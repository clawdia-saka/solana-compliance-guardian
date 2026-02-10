/**
 * x402 Payment Protocol Configuration for Solana
 * Handles payment integration with Solana network for audit fees
 */

import { clusterApiUrl } from '@solana/web3.js';

export const X402_SOLANA_CONFIG = {
  // Payment amount: $0.01 USDC per audit (10,000 lamports = 0.01 USDC, USDC has 6 decimals)
  AUDIT_PRICE: '$0.01',
  AUDIT_PRICE_USDC: 0.01, // in USDC
  AUDIT_PRICE_LAMPORTS: 10000, // 0.01 USDC = 10,000 lamports (USDC has 6 decimals)
  
  // Solana network
  NETWORK: 'solana:mainnet-beta' as const,
  RPC_ENDPOINT: process.env.NEXT_PUBLIC_SOLANA_RPC || clusterApiUrl('mainnet-beta'),
  
  // USDC token mint address on Solana mainnet
  USDC_MINT: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  
  // Receiving wallet address (update with actual Solana wallet)
  PAY_TO_ADDRESS: process.env.NEXT_PUBLIC_PAY_TO_ADDRESS || '3q1MWFNmKp6i8hnnXEKAR21BELTk5PVxweT2Jxs98gWC',
  
  // Payment scheme
  SCHEME: 'exact' as const,
  
  // Test mode flag
  IS_TESTNET: process.env.NEXT_PUBLIC_X402_TESTNET === 'true',
} as const;

// Use Solana devnet for testing
export const X402_SOLANA_TESTNET_CONFIG = {
  ...X402_SOLANA_CONFIG,
  NETWORK: 'solana:devnet' as const,
  RPC_ENDPOINT: clusterApiUrl('devnet'),
  // USDC mint on devnet (you may need to use a different mint or create one)
  USDC_MINT: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU', // USDC devnet mint
  AUDIT_PRICE: '$0.005', // Lower price for testing
  AUDIT_PRICE_USDC: 0.005,
  AUDIT_PRICE_LAMPORTS: 5000,
};

export const getX402SolanaConfig = () => {
  return X402_SOLANA_CONFIG.IS_TESTNET ? X402_SOLANA_TESTNET_CONFIG : X402_SOLANA_CONFIG;
};
