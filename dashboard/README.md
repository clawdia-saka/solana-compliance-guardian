# Solana Compliance Guardian Dashboard

AI-powered token compliance auditing system for Solana tokens with integrated x402 payment protocol.

## Overview

Compliance Guardian provides automated compliance screening for Solana tokens against Japanese regulations (PSA, FIEA, Prepaid Instruments Act). Built for the Colosseum Hackathon 2026.

## Features

- 🔍 **AI-Powered Audits**: Automated token compliance analysis using Torii AI
- 💳 **x402 Payments**: Seamless USDC payments on Solana ($0.01 per audit)
- 🔐 **Wallet Integration**: Support for Phantom, Solflare, and other Solana wallets
- 📊 **Risk Scoring**: Comprehensive risk assessment with detailed breakdown
- 🌐 **Multi-Chain Roadmap**: Expanding to Ethereum, L2s, and other chains

## Pricing

- **Production**: $0.01 USDC per audit on Solana mainnet-beta
- **Testing**: $0.005 USDC on Solana devnet
- **Demo Mode**: Free testing without wallet connection

## Payment Flow

1. Enter Solana token address
2. Click "Audit Token" → Connect Solana wallet (Phantom/Solflare)
3. Approve 0.01 USDC payment via x402 protocol
4. Payment confirmed → Audit submitted
5. View detailed compliance results

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Blockchain**: Solana (mainnet-beta/devnet)
- **Wallet**: @solana/wallet-adapter-react
- **Payments**: x402-solana protocol
- **AI**: Torii AI for compliance analysis

## Getting Started

### Install Dependencies

```bash
npm install
```

### Environment Variables

Create a `.env.local` file:

```env
# Solana Configuration
NEXT_PUBLIC_SOLANA_RPC=https://api.mainnet-beta.solana.com
NEXT_PUBLIC_PAY_TO_ADDRESS=<your-solana-wallet-address>

# Test Mode (optional)
NEXT_PUBLIC_X402_TESTNET=true  # Use devnet
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

### Build for Production

```bash
npm run build
npm start
```

## Deploy on Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/compliance-guardian)

1. Push code to GitHub
2. Import project to Vercel
3. Set environment variables
4. Deploy!

Current deployment: [https://dashboard-eight-tan-82.vercel.app](https://dashboard-eight-tan-82.vercel.app)

## Project Structure

```
dashboard/
├── app/
│   ├── page.tsx              # Main audit submission page
│   ├── layout.tsx            # Root layout with Solana wallet provider
│   └── audit/[id]/page.tsx   # Audit results page
├── components/
│   ├── solana-wallet-provider.tsx  # Solana wallet context
│   ├── solana-wallet-button.tsx    # Wallet connect UI
│   └── solana-payment-modal.tsx    # x402 payment interface
├── lib/
│   ├── x402-solana-config.ts  # x402 payment configuration
│   ├── api.ts                 # Backend API calls
│   └── types.ts               # TypeScript types
└── public/                    # Static assets
```

## x402 Payment Integration

The dashboard uses the x402 protocol for seamless USDC payments on Solana:

- **Token**: USDC (EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v)
- **Amount**: 0.01 USDC per audit
- **Network**: Solana mainnet-beta (or devnet for testing)
- **Protocol**: x402-solana

Payment flow is handled automatically through the `SolanaPaymentModal` component.

## Roadmap

### ✅ Phase 1: Solana (Current)
- Full Japan compliance analysis (PSA, FIEA, Prepaid Instruments)
- x402 payment integration
- AI-powered risk scoring

### 🔜 Phase 2: Ethereum Ecosystem
- Ethereum Mainnet (US SEC framework)
- L2s: Arbitrum, Base, Optimism, zkSync, Polygon zkEVM

### 🚀 Phase 3: Alt L1s
- BSC (Thailand SEC)
- Polygon PoS (EU MiCA)
- Avalanche (Multi-subnet)

### 🌐 Phase 4+: Global Expansion
- Bitcoin L2s (Stacks, Rootstock)
- Regional compliance: EU MiCA, US SEC, Singapore MAS

## Legal Disclaimer

⚠️ **This is an automated screening tool for informational purposes only.**

- NOT legal advice
- Consult a licensed attorney (弁護士) in Japan for compliance matters
- Results are AI-generated and may contain errors
- Use at your own risk

## Contributing

This project is part of the Colosseum Hackathon 2026. Contributions welcome!

## License

MIT License - see LICENSE file for details

## Links

- **Live Demo**: https://dashboard-eight-tan-82.vercel.app
- **Colosseum**: https://www.colosseum.org/
- **x402 Protocol**: https://solana.com/developers/guides/getstarted/intro-to-x402
- **Solana**: https://solana.com/

---

Built with ⚡ Solana • 🏆 Colosseum Hackathon 2026 • 💳 x402 Payments
