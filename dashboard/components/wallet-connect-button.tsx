'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Wallet, Power, Loader2 } from 'lucide-react';

export function WalletConnectButton() {
  const { address, isConnected } = useAccount();
  const { connectors, connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  if (isPending) {
    return (
      <Button disabled className="bg-purple-600 hover:bg-purple-700">
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        Connecting...
      </Button>
    );
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <div className="px-3 py-2 bg-purple-900/50 border border-purple-600 rounded-lg">
          <span className="text-sm text-purple-200 font-mono">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
        </div>
        <Button
          onClick={() => disconnect()}
          variant="outline"
          size="sm"
          className="border-purple-600 text-purple-200 hover:bg-purple-800/50"
        >
          <Power className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  // Get the first available connector (prioritize injected)
  const preferredConnector = connectors.find(c => c.id === 'injected') || connectors[0];

  return (
    <Button
      onClick={() => connect({ connector: preferredConnector })}
      className="bg-gradient-to-r from-purple-600 via-violet-600 to-purple-700 hover:from-purple-700 hover:via-violet-700 hover:to-purple-800 solana-glow"
    >
      <Wallet className="w-4 h-4 mr-2" />
      Connect Wallet
    </Button>
  );
}
