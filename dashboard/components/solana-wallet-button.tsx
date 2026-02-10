'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Button } from '@/components/ui/button';
import { Wallet, Power } from 'lucide-react';

export function SolanaWalletButton() {
  const { publicKey, disconnect, connected } = useWallet();
  const { setVisible } = useWalletModal();

  if (connected && publicKey) {
    return (
      <div className="flex items-center gap-2">
        <div className="px-3 py-2 bg-purple-900/50 border border-purple-600 rounded-lg">
          <span className="text-sm text-purple-200 font-mono">
            {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
          </span>
        </div>
        <Button
          onClick={disconnect}
          variant="outline"
          size="sm"
          className="border-purple-600 text-purple-200 hover:bg-purple-800/50"
        >
          <Power className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={() => setVisible(true)}
      className="bg-gradient-to-r from-purple-600 via-violet-600 to-purple-700 hover:from-purple-700 hover:via-violet-700 hover:to-purple-800 solana-glow"
    >
      <Wallet className="w-4 h-4 mr-2" />
      Connect Wallet
    </Button>
  );
}
