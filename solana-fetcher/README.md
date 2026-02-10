# Solana Token Data Fetcher

**Part of Colosseum Compliance Guardian** - 48h Hackathon Project

A TypeScript library for fetching and analyzing Solana token data for compliance and security analysis.

## Features

- ✅ Fetch token metadata (name, symbol, decimals)
- ✅ Analyze token supply and circulation
- ✅ Get holder distribution and concentration metrics
- ✅ Check mint and freeze authorities
- ✅ Detect Token Program vs Token-2022
- ✅ Calculate risk scores based on compliance factors
- ✅ Graceful error handling with retry logic
- ✅ TypeScript types for type safety

## Installation

```bash
npm install
```

## Quick Start

```typescript
import { TokenAnalyzer } from './token-analyzer.js';

const analyzer = new TokenAnalyzer({
  rpcUrl: 'https://api.mainnet-beta.solana.com',
  commitment: 'confirmed'
});

// Analyze a single token
const analysis = await analyzer.analyzeToken('DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263');

console.log(analyzer.formatAnalysis(analysis));
```

## API Reference

### `TokenAnalyzer`

Main class for token analysis.

#### Constructor

```typescript
new TokenAnalyzer(config?: SolanaClientConfig)
```

**Config Options:**
- `rpcUrl?: string` - Solana RPC endpoint (default: mainnet)
- `commitment?: 'processed' | 'confirmed' | 'finalized'` (default: 'confirmed')
- `timeout?: number` - Request timeout in ms (default: 30000)

#### Methods

##### `analyzeToken(mintAddress: string): Promise<TokenAnalysis>`

Performs comprehensive analysis of a single token.

**Returns:** `TokenAnalysis` object containing:
- `mintAddress`: Token mint address
- `metadata`: Token metadata (name, symbol, decimals, authorities)
- `supply`: Total and circulating supply
- `holderDistribution`: Holder count and concentration
- `programOwnership`: Token program info
- `warnings`: Array of compliance warnings
- `riskScore`: 0-100 risk assessment

**Example:**
```typescript
const analysis = await analyzer.analyzeToken('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
console.log(`Risk Score: ${analysis.riskScore}/100`);
```

##### `analyzeTokens(mintAddresses: string[]): Promise<TokenAnalysis[]>`

Batch analyze multiple tokens.

**Example:**
```typescript
const results = await analyzer.analyzeTokens([
  'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', // $BONK
  'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm'  // $WIF
]);
```

##### `formatAnalysis(analysis: TokenAnalysis): string`

Format analysis results as human-readable text.

### `SolanaClient`

Low-level client for Solana RPC calls. Used internally by `TokenAnalyzer`.

#### Methods

- `validateMintAddress(address: string): Promise<PublicKey>`
- `getMintInfo(mintPubkey: PublicKey)`
- `getTokenAccounts(mintPubkey: PublicKey)`
- `getTokenSupply(mintPubkey: PublicKey)`
- `getMetaplexMetadata(mintPubkey: PublicKey)`

### Error Handling

All errors are wrapped in `TokenDataError` with specific error types:

```typescript
import { TokenDataError, TokenFetchError } from './types.js';

try {
  const analysis = await analyzer.analyzeToken(address);
} catch (error) {
  if (error instanceof TokenDataError) {
    switch (error.type) {
      case TokenFetchError.INVALID_MINT:
        console.error('Invalid mint address');
        break;
      case TokenFetchError.NETWORK_ERROR:
        console.error('Network issue, retry?');
        break;
      case TokenFetchError.TIMEOUT:
        console.error('Request timed out');
        break;
    }
  }
}
```

## Risk Scoring

The analyzer calculates a risk score (0-100) based on:

| Factor | Points | Description |
|--------|--------|-------------|
| Mint Authority Active | +30 | Token supply can be inflated |
| Freeze Authority Active | +25 | Accounts can be frozen |
| High Concentration (>50%) | +20 | Top 10 holders dominate |
| Low Holder Count (<100) | +15 | Limited distribution |
| Missing Metadata | +10 | Unverified token |

**Risk Levels:**
- 🟢 0-39: Low Risk
- 🟡 40-69: Medium Risk
- 🔴 70+: High Risk

## Testing

Run the test suite with real tokens:

```bash
npm test
```

Tests include:
1. $BONK analysis (meme coin with revoked authorities)
2. $WIF analysis (another popular meme coin)
3. Batch analysis (USDC + Wrapped SOL)
4. Error handling (invalid token addresses)

## Example Output

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🪙 TOKEN ANALYSIS: BONK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Basic Info:
   Name: Bonk
   Symbol: BONK
   Mint: DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263
   Decimals: 5

📊 Supply:
   Total: 92833842069431.84

👥 Holders:
   Total: 20
   Top 10 Own: 85.23%

🔐 Authorities:
   Mint: ❌ Revoked
   Freeze: ❌ Revoked

⚡ Program:
   Type: Token Program

🎯 Risk Assessment:
   Score: 35/100 🟢 LOW RISK

⚠️  Warnings:
   ⚠️  High concentration: Top 10 holders own 85.2%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Integration with Compliance Agent

The analyzer outputs JSON-serializable data for easy integration:

```typescript
const analysis = await analyzer.analyzeToken(mintAddress);

// Send to compliance agent
await sendToAgent({
  type: 'TOKEN_ANALYSIS',
  data: analysis
});
```

## Performance

- Average analysis time: 3-5 seconds per token
- Batch analysis: Processes sequentially with error tolerance
- RPC calls: ~5-7 per token analysis
- Retry logic: Automatic retry with exponential backoff

## Limitations

- Metaplex metadata parsing is simplified (no full @metaplex-foundation/mpl-token-metadata)
- Holder distribution limited to top 20 accounts (RPC limitation)
- Does not analyze transaction history
- Circulating supply = total supply (no burn account detection)

## Future Improvements

For production deployment:
1. Add proper Metaplex metadata parsing
2. Implement caching layer for repeated queries
3. Add burn account detection for accurate circulating supply
4. Transaction history analysis
5. Social media/website verification
6. Integration with token blacklists/whitelists

## License

MIT - Built for Colosseum Hackathon 2026

## Support

For issues or questions, contact the Compliance Guardian team.
