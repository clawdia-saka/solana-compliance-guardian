#!/usr/bin/env tsx
/**
 * Simple example of using the Solana Token Analyzer
 * 
 * For production use, set SOLANA_RPC_URL to a premium RPC provider:
 * - Helius: https://rpc.helius.xyz/?api-key=YOUR_KEY
 * - QuickNode: https://your-endpoint.solana-mainnet.quiknode.pro/YOUR_TOKEN/
 * - Alchemy: https://solana-mainnet.g.alchemy.com/v2/YOUR_KEY
 */

import { TokenAnalyzer } from './token-analyzer.js';
import { TokenDataError } from './types.js';

async function analyzeTokenExample() {
  // Create analyzer instance
  const analyzer = new TokenAnalyzer({
    rpcUrl: process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
    commitment: 'confirmed',
    timeout: 30000,
  });

  // Example 1: Analyze a single token
  console.log('Example 1: Single Token Analysis\n');
  
  try {
    const mintAddress = 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263'; // $BONK
    
    console.log(`Analyzing ${mintAddress}...`);
    const analysis = await analyzer.analyzeToken(mintAddress);
    
    // Pretty print
    console.log(analyzer.formatAnalysis(analysis));
    
    // Access specific data
    console.log('Programmatic access:');
    console.log(`- Symbol: ${analysis.metadata.symbol}`);
    console.log(`- Total Supply: ${analysis.supply.total}`);
    console.log(`- Risk Score: ${analysis.riskScore}/100`);
    console.log(`- Has Mint Authority: ${analysis.metadata.mintAuthority ? 'Yes' : 'No'}`);
    
  } catch (error) {
    if (error instanceof TokenDataError) {
      console.error(`Error [${error.type}]: ${error.message}`);
      
      // Handle specific error types
      switch (error.type) {
        case 'NETWORK_ERROR':
          console.log('\n💡 Tip: Use a premium RPC provider for better reliability');
          console.log('   Set SOLANA_RPC_URL environment variable');
          break;
        case 'INVALID_MINT':
          console.log('\n💡 Tip: Double-check the mint address');
          break;
      }
    }
  }

  console.log('\n' + '━'.repeat(50) + '\n');

  // Example 2: Batch analysis
  console.log('Example 2: Batch Token Analysis\n');
  
  const tokens = [
    { name: 'BONK', address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263' },
    { name: 'WIF', address: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm' },
  ];

  try {
    const addresses = tokens.map(t => t.address);
    console.log(`Analyzing ${addresses.length} tokens...`);
    
    const results = await analyzer.analyzeTokens(addresses);
    
    console.log(`\n✓ Successfully analyzed ${results.length} tokens:\n`);
    
    // Create comparison table
    results.forEach((result, i) => {
      console.log(`${i + 1}. ${tokens[i].name} (${result.metadata.symbol || 'N/A'})`);
      console.log(`   Risk: ${result.riskScore}/100`);
      console.log(`   Mint Authority: ${result.metadata.mintAuthority ? '⚠️ Active' : '✓ Revoked'}`);
      console.log(`   Freeze Authority: ${result.metadata.freezeAuthority ? '⚠️ Active' : '✓ Revoked'}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Batch analysis failed:', error);
  }

  console.log('\n' + '━'.repeat(50) + '\n');

  // Example 3: Integration with Compliance Agent
  console.log('Example 3: JSON Export for Agent Integration\n');
  
  try {
    const analysis = await analyzer.analyzeToken('DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263');
    
    // This JSON can be sent to your compliance agent
    const exportData = {
      timestamp: new Date().toISOString(),
      tokenAnalysis: {
        mint: analysis.mintAddress,
        symbol: analysis.metadata.symbol,
        riskScore: analysis.riskScore,
        warnings: analysis.warnings,
        authorities: {
          mint: analysis.metadata.mintAuthority,
          freeze: analysis.metadata.freezeAuthority,
        },
        distribution: {
          holders: analysis.holderDistribution.totalHolders,
          concentration: analysis.holderDistribution.top10Concentration,
        }
      }
    };
    
    console.log('Agent-ready JSON:');
    console.log(JSON.stringify(exportData, null, 2));
    
  } catch (error) {
    console.error('Export failed:', error);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  analyzeTokenExample().catch(console.error);
}
