'use client';

import { useMemo, ReactNode } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import { getX402SolanaConfig } from '@/lib/x402-solana-config';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

export function SolanaWalletProvider({ children }: { children: ReactNode }) {
  const config = getX402SolanaConfig();
  
  // Determine network
  const network = config.IS_TESTNET ? WalletAdapterNetwork.Devnet : WalletAdapterNetwork.Mainnet;
  
  // Use config RPC or fallback to default
  const endpoint = useMemo(() => config.RPC_ENDPOINT || clusterApiUrl(network), [config.RPC_ENDPOINT, network]);
  
  // Setup wallets
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
