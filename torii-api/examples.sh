#!/bin/bash
# Torii API - Real-world Examples

BASE_URL="${1:-http://localhost:3000}"

echo "⛩️  Torii API - Real-world Token Classification Examples"
echo "Testing against: $BASE_URL"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Example 1: Utility Token
echo "1️⃣  Utility Token (Low Risk)"
echo "─────────────────────────────────────────────────────────────────────────"
curl -s -X POST "$BASE_URL/api/check" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Platform access token for cloud storage service. Users spend tokens to purchase storage space and bandwidth."
  }' | jq '.data | {classification, riskScore, riskLevel, required}'
echo ""

# Example 2: Governance Token (Medium Risk)
echo "2️⃣  Governance Token with Economic Rights (Medium Risk)"
echo "─────────────────────────────────────────────────────────────────────────"
curl -s -X POST "$BASE_URL/api/check" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Governance token allowing holders to vote on protocol upgrades, treasury allocations, and parameter changes for a DEX."
  }' | jq '.data | {classification, riskScore, riskLevel, required}'
echo ""

# Example 3: DeFi Token (High Risk)
echo "3️⃣  DeFi Protocol Token with Staking (High Risk)"
echo "─────────────────────────────────────────────────────────────────────────"
curl -s -X POST "$BASE_URL/api/check" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Token for DeFi lending protocol. Holders can stake tokens to earn a share of protocol fees and borrowing interest."
  }' | jq '.data | {classification, riskScore, riskLevel, required, risks}'
echo ""

# Example 4: Security Token (Very High Risk)
echo "4️⃣  Revenue Share Token (Security)"
echo "─────────────────────────────────────────────────────────────────────────"
curl -s -X POST "$BASE_URL/api/check" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Investment token representing equity in real estate project. Holders receive quarterly dividend distributions from rental income and profit from property appreciation. Token buyback program active."
  }' | jq '.data | {classification, riskScore, riskLevel, required, risks}'
echo ""

# Example 5: NFT (Low Risk)
echo "5️⃣  NFT Collection (Low Risk)"
echo "─────────────────────────────────────────────────────────────────────────"
curl -s -X POST "$BASE_URL/api/check" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "ERC-721 NFT collection featuring generative art. Each token is unique with on-chain metadata and rarity traits."
  }' | jq '.data | {classification, riskScore, riskLevel, required}'
echo ""

# Example 6: Solana Token (Real Colosseum Use Case)
echo "6️⃣  Solana Governance Token (Colosseum Example)"
echo "─────────────────────────────────────────────────────────────────────────"
curl -s -X POST "$BASE_URL/api/check" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "SPL token for Solana-based DAO. Token holders vote on proposals, delegate voting power, and participate in treasury governance. No profit distribution."
  }' | jq '.data | {classification, riskScore, riskLevel, required, confidence}'
echo ""

# Example 7: Quick Classification Lookup
echo "7️⃣  Quick Classification Lookup"
echo "─────────────────────────────────────────────────────────────────────────"
echo "Type: Governance"
curl -s "$BASE_URL/api/classify/governance" | jq '.data | {type, risk, action}'
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ All examples complete!"
echo ""
echo "📚 Full documentation: $BASE_URL/api/docs"
echo "💚 Health check: $BASE_URL/health"
echo ""
