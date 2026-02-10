import { PublicKey } from '@solana/web3.js';
import { SolanaClient } from './solana-client.js';
import {
  TokenAnalysis,
  TokenMetadata,
  TokenSupply,
  HolderDistribution,
  ProgramOwnership,
  TokenDataError,
  TokenFetchError,
  SolanaClientConfig,
} from './types.js';
import { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';

/**
 * TokenAnalyzer performs comprehensive analysis of Solana tokens
 */
export class TokenAnalyzer {
  private client: SolanaClient;

  constructor(config: SolanaClientConfig = {}) {
    this.client = new SolanaClient(config);
  }

  /**
   * Analyze a token and return comprehensive data
   */
  async analyzeToken(mintAddress: string): Promise<TokenAnalysis> {
    try {
      console.log(`🔍 Analyzing token: ${mintAddress}`);

      // Step 1: Validate mint address
      const mintPubkey = await this.client.validateMintAddress(mintAddress);

      // Step 2: Get mint info and determine program
      const { mintInfo, programId } = await this.client.getMintInfo(mintPubkey);
      console.log(`✓ Mint info retrieved (decimals: ${mintInfo.decimals})`);

      // Step 3: Get metadata
      const metadata = await this.getMetadata(mintPubkey, mintInfo);
      console.log(`✓ Metadata retrieved: ${metadata.symbol || 'N/A'}`);

      // Step 4: Get supply information
      const supply = await this.getSupply(mintPubkey, mintInfo.decimals);
      console.log(`✓ Supply: ${supply.total}`);

      // Step 5: Get holder distribution
      const holderDistribution = await this.getHolderDistribution(mintPubkey, supply);
      console.log(`✓ Holders: ${holderDistribution.totalHolders}`);

      // Step 6: Program ownership
      const programOwnership: ProgramOwnership = {
        programId: programId.toBase58(),
        isTokenProgram: programId.equals(TOKEN_PROGRAM_ID),
        isToken2022: programId.equals(TOKEN_2022_PROGRAM_ID),
      };

      // Step 7: Calculate risk score and warnings
      const warnings: string[] = [];
      let riskScore = 0;

      // Check mint authority (centralization risk)
      if (mintInfo.mintAuthority) {
        warnings.push('⚠️  Mint authority is active - token supply can be inflated');
        riskScore += 30;
      }

      // Check freeze authority (can freeze accounts)
      if (mintInfo.freezeAuthority) {
        warnings.push('⚠️  Freeze authority is active - accounts can be frozen');
        riskScore += 25;
      }

      // Check holder concentration
      if (holderDistribution.top10Concentration > 50) {
        warnings.push(
          `⚠️  High concentration: Top 10 holders own ${holderDistribution.top10Concentration.toFixed(1)}%`
        );
        riskScore += 20;
      }

      // Check total holders (low liquidity risk)
      if (holderDistribution.totalHolders < 100) {
        warnings.push(`⚠️  Low holder count: ${holderDistribution.totalHolders} holders`);
        riskScore += 15;
      }

      // Check if metadata is missing
      if (!metadata.name && !metadata.symbol) {
        warnings.push('⚠️  No metadata found - token may not be verified');
        riskScore += 10;
      }

      console.log(`✓ Analysis complete - Risk score: ${riskScore}/100`);

      return {
        mintAddress,
        metadata,
        supply,
        holderDistribution,
        programOwnership,
        timestamp: Date.now(),
        warnings,
        riskScore,
      };
    } catch (error) {
      if (error instanceof TokenDataError) {
        throw error;
      }

      throw new TokenDataError(
        TokenFetchError.UNKNOWN,
        `Failed to analyze token ${mintAddress}`,
        error as Error
      );
    }
  }

  /**
   * Get token metadata
   */
  private async getMetadata(mintPubkey: PublicKey, mintInfo: any): Promise<TokenMetadata> {
    // Try to get Metaplex metadata
    const metaplex = await this.client.getMetaplexMetadata(mintPubkey);

    return {
      name: metaplex?.name,
      symbol: metaplex?.symbol,
      decimals: mintInfo.decimals,
      uri: metaplex?.uri,
      mintAuthority: mintInfo.mintAuthority?.toBase58() || null,
      freezeAuthority: mintInfo.freezeAuthority?.toBase58() || null,
    };
  }

  /**
   * Get token supply information
   */
  private async getSupply(mintPubkey: PublicKey, decimals: number): Promise<TokenSupply> {
    const supplyInfo = await this.client.getTokenSupply(mintPubkey);

    return {
      total: supplyInfo.uiAmountString || '0',
      circulating: supplyInfo.uiAmountString || '0', // Same as total for basic tokens
      decimals,
    };
  }

  /**
   * Get holder distribution analysis
   */
  private async getHolderDistribution(
    mintPubkey: PublicKey,
    supply: TokenSupply
  ): Promise<HolderDistribution> {
    const largestAccounts = await this.client.getTokenAccounts(mintPubkey);

    // Calculate total supply in smallest units
    const totalSupply = parseFloat(supply.total);

    // Get top holders
    const largestHolders = largestAccounts.slice(0, 10).map((account) => {
      const balance = account.uiAmount || 0;
      const percentage = totalSupply > 0 ? (balance / totalSupply) * 100 : 0;

      return {
        address: account.address.toBase58(),
        balance: balance.toString(),
        percentage,
      };
    });

    // Calculate top 10 concentration
    const top10Concentration = largestHolders.reduce(
      (sum, holder) => sum + holder.percentage,
      0
    );

    return {
      totalHolders: largestAccounts.length,
      top10Concentration,
      largestHolders,
    };
  }

  /**
   * Batch analyze multiple tokens
   */
  async analyzeTokens(mintAddresses: string[]): Promise<TokenAnalysis[]> {
    const results: TokenAnalysis[] = [];

    for (const address of mintAddresses) {
      try {
        const analysis = await this.analyzeToken(address);
        results.push(analysis);
      } catch (error) {
        console.error(`Failed to analyze ${address}:`, error);
        // Continue with other tokens
      }
    }

    return results;
  }

  /**
   * Get a quick summary for display
   */
  formatAnalysis(analysis: TokenAnalysis): string {
    const lines = [
      `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `🪙 TOKEN ANALYSIS: ${analysis.metadata.symbol || 'UNKNOWN'}`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      ``,
      `📋 Basic Info:`,
      `   Name: ${analysis.metadata.name || 'N/A'}`,
      `   Symbol: ${analysis.metadata.symbol || 'N/A'}`,
      `   Mint: ${analysis.mintAddress}`,
      `   Decimals: ${analysis.metadata.decimals}`,
      ``,
      `📊 Supply:`,
      `   Total: ${analysis.supply.total}`,
      ``,
      `👥 Holders:`,
      `   Total: ${analysis.holderDistribution.totalHolders}`,
      `   Top 10 Own: ${analysis.holderDistribution.top10Concentration.toFixed(2)}%`,
      ``,
      `🔐 Authorities:`,
      `   Mint: ${analysis.metadata.mintAuthority || '❌ Revoked'}`,
      `   Freeze: ${analysis.metadata.freezeAuthority || '❌ Revoked'}`,
      ``,
      `⚡ Program:`,
      `   Type: ${analysis.programOwnership.isToken2022 ? 'Token-2022' : 'Token Program'}`,
      ``,
      `🎯 Risk Assessment:`,
      `   Score: ${analysis.riskScore}/100 ${this.getRiskEmoji(analysis.riskScore)}`,
      ``,
    ];

    if (analysis.warnings.length > 0) {
      lines.push(`⚠️  Warnings:`);
      analysis.warnings.forEach((warning) => {
        lines.push(`   ${warning}`);
      });
      lines.push(``);
    }

    lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    return lines.join('\n');
  }

  private getRiskEmoji(score: number): string {
    if (score >= 70) return '🔴 HIGH RISK';
    if (score >= 40) return '🟡 MEDIUM RISK';
    return '🟢 LOW RISK';
  }
}
