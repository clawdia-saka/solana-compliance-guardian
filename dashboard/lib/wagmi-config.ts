'use client';

import { createConfig, http } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { injected } from '@wagmi/connectors';

const isTestnet = process.env.NEXT_PUBLIC_X402_TESTNET === 'true';

// Configure supported chains
const chains = isTestnet 
  ? [baseSepolia, base] as const
  : [base, baseSepolia] as const;

// Create wagmi config
export const config = createConfig({
  chains,
  connectors: [
    injected({ shimDisconnect: true }),
  ],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
  ssr: false,
});
