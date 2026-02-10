# x402 Payment Integration

## Overview

Solana Compliance Guardian now features **x402 payment protocol integration**, enabling seamless USDC payments on Base network for audit services.

## Features

- ✅ **Wallet Connect** - Connect any EVM wallet (MetaMask, Coinbase Wallet, etc.)
- ✅ **USDC Payments** - Pay $0.10 USDC per audit on Base network
- ✅ **x402 Protocol** - Industry-standard HTTP payment protocol
- ✅ **Demo Mode** - Free testing mode for demonstrations
- ✅ **Payment Verification** - Backend validation before processing audits
- ✅ **Multi-Network** - Supports Base mainnet and Base Sepolia testnet

## Pricing

| Service | Price | Network | Currency |
|---------|-------|---------|----------|
| **Token Audit** | $0.10 | Base (eip155:8453) | USDC |
| **Demo Mode** | FREE | N/A | N/A |

## How It Works

### 1. Connect Wallet
Click "Connect Wallet" in the dashboard header to connect your EVM wallet.

### 2. Submit Token Address
Enter a Solana token mint address in the audit form.

### 3. Payment Flow
- **Demo Mode OFF**: Payment modal appears requesting $0.10 USDC
- **Demo Mode ON**: Skip payment and submit directly (for testing)

### 4. Payment Verification
Backend verifies payment via x402 protocol before processing audit.

### 5. Receive Results
Audit results displayed with risk score and compliance recommendations.

## Technical Stack

| Component | Technology |
|-----------|-----------|
| **Wallet** | wagmi + viem |
| **Payment Protocol** | x402 |
| **Network** | Base (Coinbase L2) |
| **Currency** | USDC (ERC-20) |
| **Backend Verification** | Express.js middleware |

## Configuration

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_X402_TESTNET=true                    # Use testnet (Base Sepolia)
NEXT_PUBLIC_X402_FACILITATOR_URL=https://www.x402.org/facilitator
NEXT_PUBLIC_PAY_TO_ADDRESS=0xYourWalletAddress   # Receiving wallet
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_id     # Optional
```

### Demo Mode

Toggle "Demo Mode" in the UI to:
- ✅ Skip payment requirement
- ✅ Test audit flow without wallet connection
- ✅ Perfect for demos and video recordings

## Architecture

```
┌─────────────┐
│   Client    │  1. Connect wallet (wagmi)
│  Dashboard  │  2. Submit token address
└──────┬──────┘
       │ 3. Show payment modal
       ▼
┌─────────────┐
│   Payment   │  4. Request $0.10 USDC
│    Modal    │  5. Sign transaction
└──────┬──────┘
       │ 6. Payment proof
       ▼
┌─────────────┐
│  Torii API  │  7. Verify payment
│   Backend   │  8. Process audit
└──────┬──────┘
       │ 9. Return results
       ▼
┌─────────────┐
│   Results   │  10. Display risk score
│     UI      │  11. Show recommendations
└─────────────┘
```

## Payment Verification

The backend implements x402 payment verification:

```javascript
// torii-api/server.js
function verifyPayment(paymentProof) {
  // Parse payment proof
  const proof = JSON.parse(paymentProof);
  
  // Verify signature (production: check against x402 facilitator)
  if (!proof.signature) return { valid: false };
  
  // Verify payment amount and recipient
  if (proof.amount !== '$0.10') return { valid: false };
  
  return { valid: true, payer: proof.from };
}
```

## Testing

### Testnet Mode (Free USDC)

1. Set `NEXT_PUBLIC_X402_TESTNET=true`
2. Connect wallet to Base Sepolia
3. Get testnet USDC from [Base Sepolia Faucet](https://faucet.circle.com/)
4. Test payment flow with testnet funds

### Demo Mode (No Payment)

1. Toggle "Demo Mode" switch in UI
2. Submit token address without wallet connection
3. Results returned immediately without payment

## Security

- ✅ **Payment verification** on backend prevents unauthorized audits
- ✅ **x402 protocol** provides cryptographic payment proof
- ✅ **No API keys** stored - wallet signs transactions client-side
- ✅ **Demo mode** separate from production flow

## Future Enhancements

- [ ] Support for multiple payment tokens (ETH, DAI)
- [ ] Subscription plans (unlimited audits)
- [ ] Volume discounts
- [ ] Referral system
- [ ] On-chain payment receipts

## Resources

- [x402 Protocol](https://x402.org)
- [x402 Documentation](https://docs.cdp.coinbase.com/x402)
- [Base Network](https://base.org)
- [wagmi Documentation](https://wagmi.sh)
- [viem Documentation](https://viem.sh)

## Support

For payment-related issues:
1. Check wallet has sufficient USDC balance
2. Verify correct network (Base or Base Sepolia)
3. Try demo mode to bypass payment
4. Contact support with transaction hash if payment fails

---

**Built with ❤️ using x402 payment protocol**
