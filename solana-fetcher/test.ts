#!/usr/bin/env tsx
import { TokenAnalyzer } from './token-analyzer.js';
import { TokenDataError } from './types.js';

/**
 * Test tokens for validation
 */
const TEST_TOKENS = {
  BONK: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
  WIF: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
  SOL: 'So11111111111111111111111111111111111111112', // Wrapped SOL
  USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
};

async function main() {
  console.log('🚀 Solana Token Analyzer - Test Suite\n');

  // Initialize analyzer with mainnet RPC
  const analyzer = new TokenAnalyzer({
    rpcUrl: process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
    commitment: 'confirmed',
    timeout: 30000,
  });

  // Test 1: Analyze $BONK
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('TEST 1: Analyzing $BONK (Meme Coin)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    const bonkAnalysis = await analyzer.analyzeToken(TEST_TOKENS.BONK);
    console.log(analyzer.formatAnalysis(bonkAnalysis));
    
    // Export for compliance agent
    console.log('📤 JSON Export (for Agent consumption):');
    console.log(JSON.stringify(bonkAnalysis, null, 2));
  } catch (error) {
    if (error instanceof TokenDataError) {
      console.error(`❌ Token Error [${error.type}]: ${error.message}`);
    } else {
      console.error('❌ Unexpected error:', error);
    }
  }

  console.log('\n\n');

  // Test 2: Analyze $WIF
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('TEST 2: Analyzing $WIF (Meme Coin)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    const wifAnalysis = await analyzer.analyzeToken(TEST_TOKENS.WIF);
    console.log(analyzer.formatAnalysis(wifAnalysis));
  } catch (error) {
    if (error instanceof TokenDataError) {
      console.error(`❌ Token Error [${error.type}]: ${error.message}`);
    } else {
      console.error('❌ Unexpected error:', error);
    }
  }

  console.log('\n\n');

  // Test 3: Batch analysis
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('TEST 3: Batch Analysis (USDC + Wrapped SOL)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    const batchResults = await analyzer.analyzeTokens([
      TEST_TOKENS.USDC,
      TEST_TOKENS.SOL,
    ]);

    console.log(`✓ Successfully analyzed ${batchResults.length} tokens:\n`);
    
    batchResults.forEach((result, index) => {
      console.log(`${index + 1}. ${result.metadata.symbol || 'UNKNOWN'}`);
      console.log(`   Risk Score: ${result.riskScore}/100`);
      console.log(`   Holders: ${result.holderDistribution.totalHolders}`);
      console.log(`   Mint Authority: ${result.metadata.mintAuthority ? '⚠️  Active' : '✓ Revoked'}`);
      console.log('');
    });
  } catch (error) {
    console.error('❌ Batch analysis error:', error);
  }

  console.log('\n\n');

  // Test 4: Invalid token (error handling)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('TEST 4: Error Handling (Invalid Token)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    await analyzer.analyzeToken('InvalidTokenAddress123');
  } catch (error) {
    if (error instanceof TokenDataError) {
      console.log('✓ Error handling works correctly:');
      console.log(`  Type: ${error.type}`);
      console.log(`  Message: ${error.message}`);
    }
  }

  console.log('\n✅ Test suite completed!\n');
}

// Run tests if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { TEST_TOKENS };
