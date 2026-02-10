import {
  Connection,
  PublicKey,
  ParsedAccountData,
  AccountInfo,
  TokenAccountBalancePair,
} from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  getMint,
  getAccount,
} from '@solana/spl-token';
import {
  SolanaClientConfig,
  TokenDataError,
  TokenFetchError,
} from './types.js';

/**
 * SolanaClient handles all interactions with Solana blockchain
 */
export class SolanaClient {
  private connection: Connection;
  private timeout: number;

  constructor(config: SolanaClientConfig = {}) {
    const rpcUrl = config.rpcUrl || 'https://api.mainnet-beta.solana.com';
    const commitment = config.commitment || 'confirmed';
    this.timeout = config.timeout || 30000;

    this.connection = new Connection(rpcUrl, {
      commitment,
      confirmTransactionInitialTimeout: this.timeout,
    });
  }

  /**
   * Get the connection instance
   */
  getConnection(): Connection {
    return this.connection;
  }

  /**
   * Validate and parse a mint address
   */
  async validateMintAddress(mintAddress: string): Promise<PublicKey> {
    try {
      const pubkey = new PublicKey(mintAddress);
      
      // Check if account exists
      const accountInfo = await this.connection.getAccountInfo(pubkey);
      if (!accountInfo) {
        throw new TokenDataError(
          TokenFetchError.INVALID_MINT,
          `Mint address ${mintAddress} does not exist on-chain`
        );
      }

      return pubkey;
    } catch (error) {
      if (error instanceof TokenDataError) throw error;
      
      throw new TokenDataError(
        TokenFetchError.INVALID_MINT,
        `Invalid mint address: ${mintAddress}`,
        error as Error
      );
    }
  }

  /**
   * Get mint account information
   */
  async getMintInfo(mintPubkey: PublicKey) {
    try {
      // Try TOKEN_PROGRAM_ID first
      try {
        const mintInfo = await getMint(
          this.connection,
          mintPubkey,
          'confirmed',
          TOKEN_PROGRAM_ID
        );
        return { mintInfo, programId: TOKEN_PROGRAM_ID };
      } catch (e) {
        // Try TOKEN_2022_PROGRAM_ID if standard token program fails
        const mintInfo = await getMint(
          this.connection,
          mintPubkey,
          'confirmed',
          TOKEN_2022_PROGRAM_ID
        );
        return { mintInfo, programId: TOKEN_2022_PROGRAM_ID };
      }
    } catch (error) {
      throw new TokenDataError(
        TokenFetchError.NETWORK_ERROR,
        `Failed to fetch mint info for ${mintPubkey.toBase58()}`,
        error as Error
      );
    }
  }

  /**
   * Get all token accounts for a specific mint
   */
  async getTokenAccounts(mintPubkey: PublicKey): Promise<TokenAccountBalancePair[]> {
    try {
      const response = await this.connection.getTokenLargestAccounts(mintPubkey);
      return response.value;
    } catch (error) {
      throw new TokenDataError(
        TokenFetchError.NETWORK_ERROR,
        `Failed to fetch token accounts for ${mintPubkey.toBase58()}`,
        error as Error
      );
    }
  }

  /**
   * Get token supply information
   */
  async getTokenSupply(mintPubkey: PublicKey) {
    try {
      const supply = await this.connection.getTokenSupply(mintPubkey);
      return supply.value;
    } catch (error) {
      throw new TokenDataError(
        TokenFetchError.NETWORK_ERROR,
        `Failed to fetch token supply for ${mintPubkey.toBase58()}`,
        error as Error
      );
    }
  }

  /**
   * Get metadata from Metaplex (if available)
   */
  async getMetaplexMetadata(mintPubkey: PublicKey): Promise<any | null> {
    try {
      // Metaplex metadata PDA derivation
      const METADATA_PROGRAM_ID = new PublicKey(
        'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'
      );

      const [metadataPDA] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('metadata'),
          METADATA_PROGRAM_ID.toBuffer(),
          mintPubkey.toBuffer(),
        ],
        METADATA_PROGRAM_ID
      );

      const accountInfo = await this.connection.getAccountInfo(metadataPDA);
      
      if (!accountInfo) return null;

      // Basic parsing - in production you'd use @metaplex-foundation/mpl-token-metadata
      // For hackathon speed, we'll just extract what we can
      const data = accountInfo.data;
      
      // Simple UTF-8 extraction (not robust, but works for demo)
      const nameMatch = data.toString('utf8').match(/[\x20-\x7E]{2,32}/g);
      
      return {
        name: nameMatch?.[0] || undefined,
        symbol: nameMatch?.[1] || undefined,
        uri: nameMatch?.[2] || undefined,
      };
    } catch (error) {
      // Metadata is optional, don't throw
      return null;
    }
  }

  /**
   * Get account info with retry logic
   */
  async getAccountInfoWithRetry(
    pubkey: PublicKey,
    maxRetries: number = 3
  ): Promise<AccountInfo<Buffer> | null> {
    let lastError: Error | undefined;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await this.connection.getAccountInfo(pubkey);
      } catch (error) {
        lastError = error as Error;
        if (i < maxRetries - 1) {
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
        }
      }
    }

    throw new TokenDataError(
      TokenFetchError.NETWORK_ERROR,
      `Failed to fetch account info after ${maxRetries} retries`,
      lastError
    );
  }
}
