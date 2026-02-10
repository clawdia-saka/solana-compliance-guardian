'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getAssociatedTokenAddress, createTransferInstruction, getAccount } from '@solana/spl-token';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X, Loader2, CheckCircle, AlertTriangle, DollarSign } from 'lucide-react';
import { getX402SolanaConfig } from '@/lib/x402-solana-config';

interface SolanaPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentComplete: (paymentProof: string) => void;
  tokenAddress: string;
}

type PaymentStatus = 'idle' | 'checking_balance' | 'paying' | 'success' | 'error';

export function SolanaPaymentModal({ isOpen, onClose, onPaymentComplete, tokenAddress }: SolanaPaymentModalProps) {
  const { publicKey, signTransaction, connected } = useWallet();
  const { connection } = useConnection();
  
  const [status, setStatus] = useState<PaymentStatus>('idle');
  const [error, setError] = useState('');
  const [balance, setBalance] = useState<string>('0');
  const [solBalance, setSolBalance] = useState<string>('0');
  
  const config = getX402SolanaConfig();
  
  const checkBalance = useCallback(async () => {
    if (!publicKey) return;
    
    setStatus('checking_balance');
    try {
      // Check SOL balance
      const solBalanceLamports = await connection.getBalance(publicKey);
      const solBalanceSOL = (solBalanceLamports / LAMPORTS_PER_SOL).toFixed(4);
      setSolBalance(solBalanceSOL);
      
      // Check USDC balance
      try {
        const usdcMint = new PublicKey(config.USDC_MINT);
        const tokenAccount = await getAssociatedTokenAddress(
          usdcMint,
          publicKey
        );
        
        const accountInfo = await getAccount(connection, tokenAccount);
        const usdcBalance = Number(accountInfo.amount) / 1_000_000; // USDC has 6 decimals
        setBalance(usdcBalance.toFixed(2));
      } catch (err) {
        console.log('No USDC token account found or error:', err);
        setBalance('0');
      }
      
      setStatus('idle');
    } catch (err) {
      console.error('Balance check error:', err);
      setBalance('0');
      setSolBalance('0');
      setStatus('idle');
    }
  }, [connection, publicKey, config.USDC_MINT]);

  useEffect(() => {
    if (isOpen && connected && publicKey) {
      checkBalance();
    }
  }, [isOpen, connected, publicKey, checkBalance]);

  const handlePayment = async () => {
    if (!publicKey || !signTransaction) {
      setError('Please connect your wallet first');
      return;
    }

    if (parseFloat(balance) < config.AUDIT_PRICE_USDC) {
      setError(`Insufficient USDC balance. You have ${balance} USDC but need ${config.AUDIT_PRICE_USDC} USDC.`);
      return;
    }

    try {
      setStatus('paying');
      setError('');

      const recipientPublicKey = new PublicKey(config.PAY_TO_ADDRESS);
      const usdcMint = new PublicKey(config.USDC_MINT);
      
      // Get token accounts
      const fromTokenAccount = await getAssociatedTokenAddress(
        usdcMint,
        publicKey
      );
      
      const toTokenAccount = await getAssociatedTokenAddress(
        usdcMint,
        recipientPublicKey
      );
      
      // Create transfer instruction
      const transferInstruction = createTransferInstruction(
        fromTokenAccount,
        toTokenAccount,
        publicKey,
        config.AUDIT_PRICE_LAMPORTS
      );
      
      // Create transaction
      const transaction = new Transaction().add(transferInstruction);
      
      // Get recent blockhash
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;
      
      // Sign transaction
      const signedTransaction = await signTransaction(transaction);
      
      // Send transaction
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());
      
      // Wait for confirmation
      await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      });
      
      // Create payment proof
      const paymentProof = JSON.stringify({
        signature,
        from: publicKey.toBase58(),
        to: config.PAY_TO_ADDRESS,
        amount: config.AUDIT_PRICE,
        network: config.NETWORK,
        tokenAddress,
        timestamp: Date.now(),
        scheme: config.SCHEME,
      });

      setStatus('success');
      
      // Wait a moment to show success message
      setTimeout(() => {
        onPaymentComplete(paymentProof);
        handleClose();
      }, 1500);

    } catch (err) {
      console.error('Payment error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Payment failed. Please try again.';
      setError(errorMessage);
      setStatus('error');
    }
  };

  const handleClose = () => {
    setStatus('idle');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <Card className="w-full max-w-md mx-4 border-2 border-purple-600 bg-purple-900/95 shadow-2xl shadow-purple-500/50">
        <CardHeader className="relative">
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 text-purple-300 hover:text-white transition-colors"
            disabled={status === 'paying'}
          >
            <X className="w-5 h-5" />
          </button>
          <CardTitle className="flex items-center gap-2 text-purple-100">
            <DollarSign className="w-6 h-6 text-green-400" />
            Audit Payment Required
          </CardTitle>
          <CardDescription className="text-purple-300">
            Pay with USDC on Solana to unlock audit results
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Price Display */}
          <div className="p-4 bg-purple-950/50 border border-purple-600 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-purple-300">Audit Fee:</span>
              <span className="text-2xl font-bold text-green-400">{config.AUDIT_PRICE}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-purple-400">Network:</span>
              <span className="text-purple-200">{config.IS_TESTNET ? 'Solana Devnet' : 'Solana Mainnet'}</span>
            </div>
            {connected && (
              <>
                <div className="flex justify-between items-center text-sm mt-1">
                  <span className="text-purple-400">USDC Balance:</span>
                  <span className={`font-mono ${parseFloat(balance) >= config.AUDIT_PRICE_USDC ? 'text-green-400' : 'text-orange-400'}`}>
                    {balance} USDC
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm mt-1">
                  <span className="text-purple-400">SOL Balance:</span>
                  <span className="font-mono text-purple-200">
                    {solBalance} SOL
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Wallet Status */}
          {!connected && (
            <Alert className="border-orange-600 bg-orange-900/20">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-orange-200">
                Please connect your Solana wallet to proceed with payment
              </AlertDescription>
            </Alert>
          )}

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Message */}
          {status === 'success' && (
            <Alert className="border-green-600 bg-green-900/20">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="text-green-200">
                Payment successful! Submitting audit...
              </AlertDescription>
            </Alert>
          )}

          {/* Payment Info */}
          <div className="text-xs text-purple-400 space-y-1">
            <p>• Payment processed via x402 protocol on Solana</p>
            <p>• Funds sent directly to service wallet</p>
            <p>• One-time fee per token audit</p>
            {config.IS_TESTNET && (
              <p className="text-orange-400">⚠️ Devnet mode - Use devnet USDC</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleClose}
              variant="outline"
              className="flex-1 border-purple-600 text-purple-200 hover:bg-purple-800/50"
              disabled={status === 'paying'}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              disabled={!connected || status === 'paying' || status === 'success' || parseFloat(balance) < config.AUDIT_PRICE_USDC}
              className="flex-1 bg-gradient-to-r from-purple-600 via-violet-600 to-purple-700 hover:from-purple-700 hover:via-violet-700 hover:to-purple-800 solana-glow"
            >
              {status === 'checking_balance' && (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Checking Balance...
                </>
              )}
              {status === 'paying' && (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              )}
              {status === 'success' && (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Success!
                </>
              )}
              {(status === 'idle' || status === 'error') && (
                <>
                  <DollarSign className="w-4 h-4 mr-2" />
                  Pay {config.AUDIT_PRICE}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
