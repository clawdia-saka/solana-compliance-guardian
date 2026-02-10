# Torii API Documentation

⛩️ **REST API wrapper for Japan Crypto Compliance Checker**

Version: 1.0.0  
Base URL: `http://localhost:3000` (local) | `https://your-ngrok-url.ngrok.io` (public)

---

## Overview

Torii API provides programmatic access to Japan crypto compliance classification. It analyzes token descriptions and classifies them according to Japanese regulatory frameworks (Payment Services Act, FIEA, etc.).

**Key Features:**
- 🚀 Fast response times (<100ms typical)
- 🎯 Risk scoring (0-100)
- 🔍 Confidence scores for classifications
- 📊 Detailed risk factor analysis
- 🇯🇵 Japanese regulatory context

---

## Endpoints

### 1. Health Check

**GET** `/health`

Check if the API is running.

**Response:**
```json
{
  "status": "ok",
  "service": "Torii API",
  "version": "1.0.0",
  "timestamp": "2026-02-10T08:30:00.000Z"
}
```

---

### 2. Token Classification Check

**POST** `/api/check`

Analyze a token description and receive comprehensive compliance classification.

#### Request Body

```json
{
  "description": "ERC-20 governance token for DeFi protocol, holders receive 2% of trading fees"
}
```

**Fields:**
- `description` (string, required) - Token description (10-2000 characters)

#### Response

```json
{
  "success": true,
  "data": {
    "classification": "HIGH RISK - Possible Security",
    "classificationJP": "要審査",
    "riskScore": 40,
    "riskLevel": "HIGH",
    "required": "Legal consultation before Japan launch",
    "governingLaw": "May require: FIEA registration",
    "risks": [
      "⚠️  Profit/revenue distribution detected",
      "ℹ️  Governance rights (lower risk if no economic benefit)"
    ],
    "confidence": 0.80,
    "timestamp": "2026-02-10T08:30:00.000Z",
    "disclaimer": "This is not legal advice. Consult licensed Japanese attorneys for formal opinions.",
    "futureConsideration": "Japan is considering moving crypto assets to FIEA jurisdiction by 2027."
  },
  "meta": {
    "processingTimeMs": 5,
    "descriptionLength": 78
  }
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `classification` | string | Token classification type (e.g., "SECURITY TOKEN", "UTILITY TOKEN") |
| `classificationJP` | string | Japanese classification name (e.g., "電子記録移転権利") |
| `riskScore` | number | Risk score from 0-100 (higher = more regulatory risk) |
| `riskLevel` | string | HIGH, MEDIUM, or LOW |
| `required` | string | Required licenses or registrations |
| `governingLaw` | string | Applicable Japanese law or regulation |
| `risks` | array | List of detected risk factors |
| `confidence` | number | Confidence score 0.0-1.0 (higher = more certain) |
| `timestamp` | string | ISO 8601 timestamp |
| `disclaimer` | string | Legal disclaimer |
| `futureConsideration` | string | Upcoming regulatory changes |

#### Classification Types

| Classification | Risk Score | Registration Required |
|----------------|------------|----------------------|
| **SECURITY TOKEN** (電子記録移転権利) | 50-100 | Type I/II FIEA License |
| **HIGH RISK - Possible Security** | 25-49 | Legal consultation |
| **CRYPTO ASSET** (暗号資産) | Varies | Exchange License |
| **PREPAID PAYMENT** (前払式支払手段) | Low | Notification to Finance Bureau |
| **UTILITY TOKEN** | 0-24 | Usually none |
| **NFT** | Low | Usually none (case by case) |

#### Error Responses

**400 Bad Request** - Invalid or missing description
```json
{
  "error": "Missing or invalid 'description' field",
  "example": {
    "description": "ERC-20 governance token with fee distribution"
  }
}
```

**500 Internal Server Error**
```json
{
  "error": "Internal server error",
  "message": "Error message here"
}
```

---

### 3. Quick Classification Lookup

**GET** `/api/classify/:type`

Get quick classification info for a known token type.

**Parameters:**
- `type` (string, required) - Token type: `utility`, `governance`, `security`, `payment`, or `nft`

#### Examples

**Request:**
```
GET /api/classify/governance
```

**Response:**
```json
{
  "success": true,
  "data": {
    "type": "GOVERNANCE TOKEN",
    "registration": "Depends on economic rights",
    "risk": "MEDIUM",
    "action": "Review for profit-sharing mechanisms",
    "confidence": 0.75,
    "timestamp": "2026-02-10T08:30:00.000Z",
    "disclaimer": "This is not legal advice. Consult licensed Japanese attorneys for formal opinions."
  }
}
```

#### Valid Token Types

| Type | Risk | Registration | Use Case |
|------|------|--------------|----------|
| `utility` | LOW | Usually none | Platform access, fee discounts |
| `governance` | MEDIUM | Case by case | Voting rights, no profit share |
| `security` | HIGH | FIEA License | Profit share, investment contract |
| `payment` | HIGH | Exchange License | Cryptocurrency, payments |
| `nft` | LOW | Usually none | Art, collectibles |

#### Error Response

**400 Bad Request** - Invalid type
```json
{
  "error": "Unknown type: invalid. Valid types: utility, governance, security, payment, nft",
  "validTypes": ["utility", "governance", "security", "payment", "nft"]
}
```

---

### 4. API Documentation

**GET** `/api/docs`

Get interactive API documentation in JSON format.

---

## Usage Examples

### cURL

```bash
# Check token classification
curl -X POST http://localhost:3000/api/check \
  -H "Content-Type: application/json" \
  -d '{
    "description": "ERC-20 token with staking rewards and governance rights"
  }'

# Quick lookup
curl http://localhost:3000/api/classify/governance
```

### JavaScript (Node.js)

```javascript
// POST /api/check
const response = await fetch('http://localhost:3000/api/check', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    description: 'NFT collection with unique artwork and metadata'
  })
});

const result = await response.json();
console.log(result.data.classification);
console.log(`Risk Score: ${result.data.riskScore}`);
console.log(`Confidence: ${result.data.confidence}`);
```

### Python

```python
import requests

# Check token
response = requests.post('http://localhost:3000/api/check', json={
    'description': 'DeFi token with yield farming and fee distribution'
})

data = response.json()['data']
print(f"Classification: {data['classification']}")
print(f"Risk Score: {data['riskScore']}")
print(f"Required: {data['required']}")
```

---

## Risk Scoring

Torii analyzes token descriptions for specific risk keywords:

| Risk Factor | Score | Description |
|-------------|-------|-------------|
| **Profit/Revenue Distribution** | +30 | Dividends, fee sharing, yield distribution |
| **Investment Language** | +25 | "invest", "return", "appreciation", "growth" |
| **Staking/Rewards** | +20 | Staking mechanisms, reward programs |
| **Buyback Programs** | +15 | Token buybacks, burn mechanisms |
| **Governance Rights** | +10 | Voting, governance (low risk if no profit) |

**Total Score Interpretation:**
- **0-24:** Low risk (likely utility token or NFT)
- **25-49:** Medium-high risk (possible security characteristics)
- **50-100:** High risk (likely security token)

---

## Confidence Scores

Confidence indicates how certain the classification is:

- **0.95+** - Very high confidence (multiple clear indicators)
- **0.80-0.94** - High confidence (clear risk pattern)
- **0.70-0.79** - Medium confidence (some indicators)
- **0.60-0.69** - Low confidence (ambiguous, needs more info)

---

## Performance

- **Response Time:** <100ms typical, <2s guaranteed
- **Rate Limits:** None currently (add auth for production)
- **Max Description Length:** 2000 characters
- **Concurrent Requests:** Supports multiple simultaneous requests

---

## Deployment

### Local Development

```bash
cd ~/.openclaw/workspace/colosseum-compliance-guardian/torii-api
npm install
npm start
```

### Production (with ngrok)

```bash
# Start API
npm start

# In another terminal
ngrok http 3000
```

Your API will be available at: `https://your-random-id.ngrok.io`

---

## Testing

Run the test suite:

```bash
npm test
```

This will test all endpoints with various token descriptions.

---

## Important Disclaimers

⚠️ **Not Legal Advice**  
This API provides informational analysis only. Always consult licensed Japanese attorneys for formal legal opinions.

⚠️ **Regulatory Changes**  
Japanese crypto regulations are evolving. Current as of February 2026. Verify latest requirements with FSA (Financial Services Agency).

⚠️ **AI-Powered Analysis**  
Classifications are based on keyword pattern matching and risk heuristics. Edge cases may require human legal review.

---

## Resources

- [FSA Virtual Currency Guidelines](https://www.fsa.go.jp/policy/virtual_currency/)
- [JCBA Self-Regulatory Rules](https://jcba.co.jp/)
- [STO Association Japan](https://securitytoken.or.jp/)

---

## Support

For issues or questions about the Torii API:
- GitHub: [Torii Skill](~/.openclaw/workspace/skills/torii/)
- Website: https://torii.vercel.app

Built by Crypto Times for the Solana Colosseum hackathon 🏛️
