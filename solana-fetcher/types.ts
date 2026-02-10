import { PublicKey } from '@solana/web3.js';

/**
 * Token metadata information
 */
export interface TokenMetadata {
  name?: string;
  symbol?: string;
  decimals: number;
  uri?: string;
  mintAuthority: string | null;
  freezeAuthority: string | null;
}

/**
 * Token supply information
 */
export interface TokenSupply {
  total: string;
  circulating: string;
  decimals: number;
}

/**
 * Holder distribution data
 */
export interface HolderDistribution {
  totalHolders: number;
  top10Concentration: number; // Percentage held by top 10
  largestHolders: Array<{
    address: string;
    balance: string;
    percentage: number;
  }>;
}

/**
 * Program ownership information
 */
export interface ProgramOwnership {
  programId: string;
  isTokenProgram: boolean;
  isToken2022: boolean;
}

/**
 * Complete token analysis result
 */
export interface TokenAnalysis {
  mintAddress: string;
  metadata: TokenMetadata;
  supply: TokenSupply;
  holderDistribution: HolderDistribution;
  programOwnership: ProgramOwnership;
  timestamp: number;
  
  // Compliance flags
  warnings: string[];
  riskScore: number; // 0-100, higher = riskier
}

/**
 * Error types for better error handling
 */
export enum TokenFetchError {
  INVALID_MINT = 'INVALID_MINT',
  NETWORK_ERROR = 'NETWORK_ERROR',
  INSUFFICIENT_DATA = 'INSUFFICIENT_DATA',
  TIMEOUT = 'TIMEOUT',
  UNKNOWN = 'UNKNOWN'
}

/**
 * Custom error class for token fetching
 */
export class TokenDataError extends Error {
  constructor(
    public type: TokenFetchError,
    message: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'TokenDataError';
  }
}

/**
 * Configuration for the Solana client
 */
export interface SolanaClientConfig {
  rpcUrl?: string;
  commitment?: 'processed' | 'confirmed' | 'finalized';
  timeout?: number;
}
