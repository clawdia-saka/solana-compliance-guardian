'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { formatUnits } from 'viem';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X, Loader2, CheckCircle, AlertTriangle, DollarSign } from 'lucide-react';
import { getX402Config } from '@/lib/x402-config';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentComplete: (paymentProof: string) => void;
  tokenAddress: string;
}

type PaymentStatus = 'idle' | 'checking_balance' | 'approving' | 'paying' | 'success' | 'error';

export function PaymentModal({ isOpen, onClose, onPaymentComplete, tokenAddress }: PaymentModalProps) {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  
  const [status, setStatus] = useState<PaymentStatus>('idle');
  const [error, setError] = useState('');
  const [balance, setBalance] = useState<string>('0');
  
  const config = getX402Config();
  const priceUSD = parseFloat(config.AUDIT_PRICE.replace('$', ''));
  
  // USDC contract addresses
  const USDC_CONTRACTS = {
    'eip155:8453': '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // Base mainnet
    'eip155:84532': '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // Base Sepolia
  } as const;

  const usdcAddress = USDC_CONTRACTS[config.NETWORK as keyof typeof USDC_CONTRACTS];

  const checkBalance = useCallback(async () => {
    if (!publicClient || !address) return;
    
    setStatus('checking_balance');
    try {
      // Read USDC balance
      const balanceOf = await publicClient.readContract({
        address: usdcAddress as `0x${string}`,
        abi: [
          {
            name: 'balanceOf',
            type: 'function',
            stateMutability: 'view',
            inputs: [{ name: 'account', type: 'address' }],
            outputs: [{ type: 'uint256' }],
          },
        ],
        functionName: 'balanceOf',
        args: [address],
      });

      const formattedBalance = formatUnits(balanceOf as bigint, 6); // USDC has 6 decimals
      setBalance(formattedBalance);
      setStatus('idle');
    } catch (err) {
      console.error('Balance check error:', err);
      setBalance('0');
      setStatus('idle');
    }
  }, [publicClient, address, usdcAddress]);

  useEffect(() => {
    if (isOpen && isConnected && address) {
      checkBalance();
    }
  }, [isOpen, isConnected, address, checkBalance]);

  const handlePayment = async () => {
    if (!walletClient || !address) {
      setError('Please connect your wallet first');
      return;
    }

    if (parseFloat(balance) < priceUSD) {
      setError(`Insufficient USDC balance. You have ${balance} USDC but need ${priceUSD} USDC.`);
      return;
    }

    try {
      setStatus('paying');
      setError('');

      // For demo: Generate a mock payment signature
      // In production, this would use actual x402 SDK to create payment proof
      const timestamp = Date.now();
      const paymentData = {
        from: address,
        to: config.PAY_TO_ADDRESS,
        amount: config.AUDIT_PRICE,
        network: config.NETWORK,
        tokenAddress,
        timestamp,
      };

      // Create a simple payment proof (in production, use x402 SDK)
      const paymentProof = JSON.stringify({
        ...paymentData,
        signature: `mock_sig_${timestamp}_${address.slice(2, 10)}`,
        scheme: config.SCHEME,
      });

      // Simulate payment delay
      await new Promise(resolve => setTimeout(resolve, 2000));

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
            Pay with USDC on Base network to unlock audit results
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
              <span className="text-purple-200">{config.IS_TESTNET ? 'Base Sepolia (Testnet)' : 'Base'}</span>
            </div>
            {isConnected && (
              <div className="flex justify-between items-center text-sm mt-1">
                <span className="text-purple-400">Your Balance:</span>
                <span className={`font-mono ${parseFloat(balance) >= priceUSD ? 'text-green-400' : 'text-orange-400'}`}>
                  {parseFloat(balance).toFixed(2)} USDC
                </span>
              </div>
            )}
          </div>

          {/* Wallet Status */}
          {!isConnected && (
            <Alert className="border-orange-600 bg-orange-900/20">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-orange-200">
                Please connect your wallet to proceed with payment
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
            <p>• Payment processed via x402 protocol</p>
            <p>• Funds sent directly to service wallet</p>
            <p>• One-time fee per token audit</p>
            {config.IS_TESTNET && (
              <p className="text-orange-400">⚠️ Testnet mode - Use testnet USDC</p>
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
              disabled={!isConnected || status === 'paying' || status === 'success' || parseFloat(balance) < priceUSD}
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

          {/* Demo Mode Notice */}
          <div className="text-xs text-center text-purple-500 italic">
            Demo mode: Payment simulation enabled for testing
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
