# Solana Compliance Guardian - System Architecture

**Project:** Colosseum Agent Hackathon Submission  
**Deadline:** Feb 12, 2026, 23:59 UTC  
**AI Agent:** Autonomous development required  
**Version:** 1.0

---

## Executive Summary

**Solana Compliance Guardian** is an autonomous AI agent that audits Solana tokens and programs for Japan regulatory compliance. It combines real-time on-chain analysis with expert compliance rule checking to produce risk scores and actionable recommendations.

**Differentiation:** Only hackathon project combining Solana-native blockchain analysis with Japan crypto regulatory compliance.

---

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     SOLANA COMPLIANCE GUARDIAN                  │
│                    (AI Agent Autonomous System)                 │
└─────────────────────────────────────────────────────────────────┘
                               │
                ┌──────────────┼──────────────┐
                │              │              │
                ▼              ▼              ▼
        ┌───────────┐  ┌──────────────┐  ┌──────────┐
        │  Solana   │  │   Agent      │  │ Dashboard│
        │Integration│  │   Decision   │  │   UI     │
        │   Layer   │  │    Logic     │  │          │
        └───────────┘  └──────────────┘  └──────────┘
                │              │              │
                │              │              │
                ▼              ▼              ▼
        ┌───────────┐  ┌──────────────┐  ┌──────────┐
        │  Solana   │  │     Torii    │  │  HTTP    │
        │    RPC    │  │ API Wrapper  │  │  Server  │
        └───────────┘  └──────────────┘  └──────────┘
                               │
                               ▼
                        ┌────────────┐
                        │   Torii    │
                        │  Backend   │
                        │  Service   │
                        └────────────┘
```

---

## Core Components

### 1. Solana Integration Layer

**Purpose:** Fetch and parse on-chain data from Solana blockchain

**Responsibilities:**
- Connect to Solana RPC endpoints (Helius, Quicknode, or public)
- Query SPL token metadata (mint address, decimals, supply)
- Fetch token account balances and holder distribution
- Parse program IDL (Interface Definition Language) for smart contracts
- Extract transaction history for wallets/programs
- Monitor real-time on-chain events

**Technology Stack:**
- `@solana/web3.js` (v1.95+) - Core Solana SDK
- `@solana/spl-token` - SPL token utilities
- `@metaplex-foundation/js` - NFT/token metadata
- `@coral-xyz/anchor` - Program IDL parsing (if analyzing Anchor programs)

**Key Data Structures:**
```typescript
interface SolanaTokenData {
  mintAddress: string;
  name: string;
  symbol: string;
  decimals: number;
  supply: number;
  holderCount: number;
  topHolders: Array<{address: string; balance: number; percentage: number}>;
  metadata: {
    uri: string;
    creators?: Array<{address: string; verified: boolean}>;
    updateAuthority?: string;
  };
  freezeAuthority: string | null;
  mintAuthority: string | null;
}

interface SolanaProgramData {
  programId: string;
  executable: boolean;
  owner: string;
  upgradeable: boolean;
  upgradeAuthority: string | null;
  idl?: any; // Anchor IDL if available
  recentTransactions: number;
}
```

**API Endpoints (Internal):**
- `getTokenInfo(mintAddress: string): Promise<SolanaTokenData>`
- `getProgramInfo(programId: string): Promise<SolanaProgramData>`
- `getWalletActivity(address: string, limit: number): Promise<Transaction[]>`
- `monitorTokenTransfers(mintAddress: string): EventEmitter`

---

### 2. Torii API Wrapper

**Purpose:** Transform Torii skill into callable service for agent

**Responsibilities:**
- Expose Torii compliance rules via HTTP/REST API
- Map Solana token data → Torii input format
- Parse Torii output → structured compliance report
- Handle Torii skill lifecycle (start, query, stop)
- Cache compliance rules to reduce latency

**Architecture Pattern:**
```
Agent → HTTP POST /api/compliance/check
         ↓
    Torii API Wrapper
         ↓
    Torii Skill (subprocess or CLI)
         ↓
    Japan Regulatory Rules
         ↓
    Return: ComplianceReport
```

**Technology Stack:**
- `express` or `fastify` - HTTP server
- `execa` or `child_process` - Execute Torii skill
- `zod` - Schema validation
- `node-cache` - Response caching

**API Contract:**
```typescript
// Request
POST /api/compliance/check
{
  "assetType": "token" | "program",
  "data": SolanaTokenData | SolanaProgramData,
  "jurisdiction": "japan",
  "checkTypes": ["ico", "kyc", "aml", "licensing"]
}

// Response
{
  "riskScore": 0-100,
  "riskLevel": "low" | "medium" | "high" | "critical",
  "violations": [
    {
      "rule": "Japan PSA Article 2.14",
      "severity": "high",
      "description": "Token may qualify as security without registration",
      "evidence": ["Centralized mint authority", "No utility functionality"]
    }
  ],
  "recommendations": [
    "Renounce mint authority to demonstrate decentralization",
    "Register with JFSA if token qualifies as cryptoasset"
  ],
  "timestamp": "2026-02-10T08:33:00Z"
}
```

**Implementation Notes:**
- Torii skill remains unchanged (human-built dependency)
- Wrapper is AI-agent-written code
- If Torii doesn't have CLI, create simple wrapper script

---

### 3. Agent Decision Logic

**Purpose:** Autonomous compliance auditing with minimal human intervention

**Responsibilities:**
- Accept audit requests (wallet address, token mint, program ID)
- Orchestrate: Fetch Solana data → Query Torii → Generate report
- Apply autonomous decision rules (e.g., auto-flag high-risk tokens)
- Schedule periodic re-audits for monitored assets
- Trigger alerts for critical compliance changes
- Learn from audit history (optional: simple ML for pattern detection)

**Agent Autonomy Features:**
1. **Auto-Discovery:** Scan popular Solana DEXs (Raydium, Orca) for new tokens
2. **Risk Prioritization:** Focus on tokens with high transaction volume
3. **Alert System:** Notify when monitored token becomes non-compliant
4. **Batch Processing:** Queue and process multiple audits efficiently

**Technology Stack:**
- TypeScript (Node.js runtime)
- `bull` or `bullmq` - Job queue for batch processing
- `node-cron` - Scheduled re-audits
- `winston` - Structured logging

**Core Logic Flow:**
```typescript
async function auditToken(mintAddress: string): Promise<AuditReport> {
  // 1. Fetch Solana data
  const tokenData = await solanaLayer.getTokenInfo(mintAddress);
  
  // 2. Query Torii compliance
  const complianceReport = await toriiWrapper.checkCompliance({
    assetType: 'token',
    data: tokenData,
    jurisdiction: 'japan'
  });
  
  // 3. Agent decision logic
  const recommendations = generateRecommendations(tokenData, complianceReport);
  const riskLevel = calculateRiskLevel(complianceReport, tokenData);
  
  // 4. Store audit result
  await db.storeAudit({
    mintAddress,
    timestamp: Date.now(),
    riskLevel,
    complianceReport,
    recommendations
  });
  
  // 5. Trigger alerts if critical
  if (riskLevel === 'critical') {
    await alertSystem.notify({
      channel: 'telegram',
      message: `⚠️ CRITICAL: Token ${tokenData.symbol} failed compliance`
    });
  }
  
  return {tokenData, complianceReport, recommendations, riskLevel};
}
```

**Autonomous Decision Rules:**
```typescript
// Example: Auto-classification logic
function calculateRiskLevel(
  compliance: ComplianceReport,
  tokenData: SolanaTokenData
): RiskLevel {
  let score = compliance.riskScore;
  
  // Agent autonomously adjusts score based on Solana signals
  if (tokenData.mintAuthority !== null) score += 15; // Centralization risk
  if (tokenData.topHolders[0]?.percentage > 50) score += 20; // Whale risk
  if (tokenData.holderCount < 100) score += 10; // Low distribution
  
  if (score >= 80) return 'critical';
  if (score >= 60) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}
```

---

### 4. Dashboard UI

**Purpose:** Human-readable interface to view audit results

**Responsibilities:**
- Display audit reports (risk scores, violations, recommendations)
- Search/filter tokens by risk level, symbol, compliance status
- Show real-time audit queue status
- Visualize risk trends over time
- Provide "Audit Now" button for manual audits

**Technology Stack:**
- **Frontend:** React + Vite (fast development)
- **Styling:** Tailwind CSS (rapid prototyping)
- **Charts:** Recharts or Chart.js (risk visualization)
- **State:** React Query (data fetching)
- **Backend:** Express API (same as Torii wrapper)

**UI Screens:**

**1. Dashboard Home**
```
┌─────────────────────────────────────────────┐
│  Solana Compliance Guardian                │
│                                             │
│  Total Audits: 156                          │
│  Critical: 12   High: 34   Medium: 67       │
│                                             │
│  Recent Audits:                             │
│  ┌───────────────────────────────────────┐ │
│  │ $BONK  │ Medium Risk │ Feb 10, 08:30  │ │
│  │ $WIF   │ Low Risk    │ Feb 10, 08:15  │ │
│  │ $PYTH  │ Critical    │ Feb 10, 07:55  │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  [Audit Token] [View Queue] [Settings]     │
└─────────────────────────────────────────────┘
```

**2. Audit Detail View**
```
┌─────────────────────────────────────────────┐
│  Token: Bonk ($BONK)                        │
│  Mint: DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB264
│                                             │
│  Risk Score: 55/100  [=========>   ] MEDIUM │
│                                             │
│  Violations:                                │
│  ⚠️  High concentration (top holder: 35%)   │
│  ⚠️  Centralized upgrade authority          │
│                                             │
│  Recommendations:                           │
│  ✓ Implement multi-sig for upgrade auth    │
│  ✓ Encourage wider token distribution       │
│                                             │
│  [Download Report] [Schedule Re-audit]      │
└─────────────────────────────────────────────┘
```

**3. Audit Request Form**
```
┌─────────────────────────────────────────────┐
│  New Audit Request                          │
│                                             │
│  Asset Type: ● Token  ○ Program             │
│                                             │
│  Mint Address:                              │
│  [______________________________________]   │
│                                             │
│  Jurisdiction: [Japan ▼]                    │
│                                             │
│  Check Types:                               │
│  ☑ ICO Compliance                           │
│  ☑ KYC/AML Requirements                     │
│  ☑ Licensing Status                         │
│  ☑ Securities Classification                │
│                                             │
│  [Submit Audit]                             │
└─────────────────────────────────────────────┘
```

**Implementation Notes:**
- Keep UI simple (MVP, not production-grade)
- Focus on demonstrating agent autonomy in backend
- Static site deployment (Vercel, Netlify) for demo

---

## Data Flow Sequence

### Scenario: User audits a Solana token

```
User → Dashboard UI: "Audit $BONK"
         ↓
Dashboard → Agent API: POST /audit {mintAddress: "DezX..."}
         ↓
Agent Decision Logic:
  1. Call Solana Integration Layer → getTokenInfo("DezX...")
  2. Solana RPC returns: {name: "Bonk", supply: 100T, ...}
  3. Call Torii API Wrapper → POST /compliance/check
  4. Torii Wrapper executes Torii skill (subprocess)
  5. Torii returns: {riskScore: 45, violations: [...]}
  6. Agent applies decision rules → adjust risk to 55
  7. Store audit in database
  8. Return AuditReport to Dashboard
         ↓
Dashboard UI: Display risk score, violations, recommendations
         ↓
Optional: Agent schedules re-audit in 24h (autonomous)
```

---

## Optional: On-Chain Compliance Attestation

**Purpose:** Store audit results on Solana blockchain for transparency

**Implementation:**
- Create Solana program (Anchor framework) with `Attestation` account
- Store: `{mint_address, risk_score, auditor_pubkey, timestamp, ipfs_report_hash}`
- Anyone can query attestations for a token on-chain
- Provides immutable proof of compliance check

**Anchor Program Structure:**
```rust
#[account]
pub struct ComplianceAttestation {
    pub mint_address: Pubkey,
    pub risk_score: u8,
    pub risk_level: RiskLevel,
    pub auditor: Pubkey,
    pub timestamp: i64,
    pub report_hash: [u8; 32], // IPFS hash of full report
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum RiskLevel {
    Low,
    Medium,
    High,
    Critical,
}
```

**Trade-offs:**
- **Pros:** Demonstrates Solana-native integration, immutable record
- **Cons:** Requires writing Rust, testing, deployment (adds 8-12h to timeline)
- **Recommendation:** Include if time permits on Day 2

---

## Tech Stack Summary

| Layer | Technology | Purpose | Agent-Written? |
|-------|-----------|---------|----------------|
| **Solana Integration** | @solana/web3.js, @solana/spl-token | Fetch on-chain data | ✅ YES |
| **Torii Wrapper** | Express, execa, zod | API service | ✅ YES |
| **Agent Logic** | TypeScript, bull, node-cron | Autonomous decisions | ✅ YES |
| **Dashboard** | React, Vite, Tailwind | UI/UX | ✅ YES |
| **Database** | SQLite or JSON files | Audit storage | ✅ YES |
| **Deployment** | Vercel (UI), Render (API) | Hosting | ⚙️ Config |
| **Torii Skill** | (Existing) | Compliance rules | ❌ NO (dependency) |

---

## Security & Privacy Considerations

1. **API Rate Limiting:** Prevent abuse of free Torii API
2. **Input Validation:** Sanitize mint addresses to prevent injection
3. **CORS Policy:** Restrict dashboard API access to known origins
4. **No Private Keys:** System is read-only (no token transfers)
5. **Data Retention:** Auto-delete audits older than 30 days (GDPR-like)

---

## Scalability & Performance

**MVP Constraints (48h hackathon):**
- Single-instance deployment (no horizontal scaling)
- In-memory job queue (no Redis)
- File-based database (SQLite or JSON)
- Support 100-500 audits/day max

**Future Enhancements (post-hackathon):**
- PostgreSQL for audit history
- Redis for job queue
- WebSocket for real-time UI updates
- Multi-region RPC fallbacks

---

## Success Metrics

**For Hackathon Judging:**
1. ✅ Agent autonomously writes 100% of Solana integration code
2. ✅ Demonstrates real on-chain data analysis (not mocked)
3. ✅ Torii integration working (compliance reports generated)
4. ✅ Dashboard shows live audit results
5. ✅ GitHub repo clearly shows agent commits
6. ✅ Live demo: User enters token mint → sees risk report in <30s

**Bonus Points:**
- On-chain attestation (Solana program deployed)
- Auto-discovery of new tokens from Raydium
- Alert system (Telegram notifications)

---

## Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Solana RPC downtime | Medium | High | Use Helius/Quicknode backup |
| Torii skill broken | Low | Critical | Test Torii before integration |
| Agent writes buggy code | Medium | Medium | Iterative testing, human review |
| UI not ready for demo | Medium | Medium | Prioritize backend; use curl for demo |
| On-chain deployment fails | Medium | Low | Make optional stretch goal |

---

## Deployment Architecture

**Production Setup (Demo):**
```
┌─────────────────────────────────────────┐
│  Vercel (Frontend)                      │
│  - React Dashboard                      │
│  - Static site (CDN)                    │
└─────────────────────────────────────────┘
                │
                ▼ (HTTPS)
┌─────────────────────────────────────────┐
│  Render / Railway (Backend)             │
│  - Express API                          │
│  - Torii Wrapper                        │
│  - Agent Logic                          │
│  - SQLite Database                      │
└─────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│  Solana RPC                             │
│  - Helius (primary)                     │
│  - Public RPC (fallback)                │
└─────────────────────────────────────────┘
```

**Local Development:**
- All components run on localhost
- Use `npm run dev` for hot-reload
- Torii skill runs as subprocess

---

## GitHub Repository Structure

```
colosseum-compliance-guardian/
├── README.md                    # Project overview, demo video
├── ARCHITECTURE.md              # This file
├── PLAN.md                      # Implementation timeline
├── .agent-commits/              # Proof of AI authorship
│   └── commit-log.md
├── backend/
│   ├── src/
│   │   ├── solana/              # Solana integration layer
│   │   │   ├── client.ts
│   │   │   ├── token.ts
│   │   │   └── program.ts
│   │   ├── torii/               # Torii API wrapper
│   │   │   ├── wrapper.ts
│   │   │   └── schema.ts
│   │   ├── agent/               # Agent decision logic
│   │   │   ├── auditor.ts
│   │   │   ├── scheduler.ts
│   │   │   └── alerts.ts
│   │   ├── api/                 # HTTP API
│   │   │   ├── routes.ts
│   │   │   └── server.ts
│   │   └── db/                  # Database
│   │       └── sqlite.ts
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── AuditDetail.tsx
│   │   │   └── AuditForm.tsx
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── program/                     # Optional: On-chain attestation
│   ├── programs/
│   │   └── compliance-attestation/
│   │       └── src/
│   │           └── lib.rs
│   └── Anchor.toml
└── docs/
    ├── API.md                   # API documentation
    └── DEMO.md                  # Demo script
```

---

## Hackathon Submission Requirements

**What to Submit:**
1. **GitHub Repo:** https://github.com/[agent]/colosseum-compliance-guardian
2. **Demo Video:** 3-5 min showing:
   - Agent autonomously auditing a Solana token
   - Risk score + violations displayed
   - Optional: On-chain attestation
3. **Live Demo URL:** https://solana-compliance.vercel.app
4. **Agent Proof:** `.agent-commits/` folder with detailed logs

**Project Description (for submission form):**
> "Solana Compliance Guardian is an autonomous AI agent that audits Solana tokens and programs for Japan regulatory compliance. It fetches on-chain data, analyzes risk factors, and generates compliance reports using expert legal rules. Built entirely by AI during the hackathon, demonstrating true agent autonomy in the Solana ecosystem."

**Categories:**
- Primary: Best Overall Project ($50K)
- Secondary: Most Agentic ($5K bonus)

---

## Next Steps

See `PLAN.md` for detailed 48-hour implementation timeline.

**Critical Path:**
1. Set up Torii as callable service (2h)
2. Build Solana integration layer (6h)
3. Implement agent decision logic (4h)
4. Create basic dashboard UI (4h)
5. Test end-to-end flow (2h)
6. Record demo video (1h)
7. Submit to Colosseum (1h)

**Total Estimated: 20 hours** (leaves 28h buffer for debugging/polish)

---

**Architecture Version:** 1.0  
**Last Updated:** Feb 10, 2026, 08:33 JST  
**Next Review:** After Day 1 implementation
