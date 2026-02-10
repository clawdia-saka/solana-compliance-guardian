# Solana Compliance Guardian - 48H Implementation Plan

**Project:** Colosseum Agent Hackathon Submission  
**Deadline:** Feb 12, 2026, 23:59 UTC  
**Time Available:** 48 hours from Feb 10, 08:33 JST  
**Strategy:** Critical path first, polish later

---

## Timeline Overview

| Phase | Duration | Deadline | Status |
|-------|----------|----------|--------|
| **Day 1 Morning** | 4h | Feb 10, 12:33 | ✅ Backend Foundation COMPLETE |
| **Day 1 Afternoon** | 4h | Feb 10, 16:33 | ✅ Solana Integration COMPLETE |
| **Day 1 Evening** | 4h | Feb 10, 20:33 | ✅ Agent Logic COMPLETE |
| **Day 2 Morning** | 4h | Feb 11, 12:33 | ✅ UI Dashboard COMPLETE |
| **Day 2 Afternoon** | 4h | Feb 11, 16:33 | 🔄 Testing & Polish IN PROGRESS |
| **Day 2 Evening** | 4h | Feb 11, 20:33 | ⏳ Demo & Submission PENDING |
| **Buffer** | 24h | Feb 12, 20:33 | ⚪ Contingency |

---

## Day 1: Backend & Core Logic (Feb 10)

### Phase 1: Backend Foundation (08:33 - 12:33) - 4h

**Goal:** Set up project structure and Torii service wrapper

**Tasks:**
1. **Project Setup (30min)**
   - Create GitHub repo: `colosseum-compliance-guardian`
   - Initialize monorepo structure (backend, frontend, docs)
   - Set up TypeScript configs
   - Install core dependencies

2. **Torii API Wrapper (2h)**
   - Create Express server for Torii API
   - Implement `/api/compliance/check` endpoint
   - Test Torii skill execution (subprocess/CLI)
   - Define request/response schemas with Zod
   - Add basic error handling

3. **Database Setup (1h)**
   - Initialize SQLite database
   - Create `audits` table schema
   - Implement basic CRUD operations
   - Test data persistence

4. **Testing (30min)**
   - Write unit tests for Torii wrapper
   - Test end-to-end: Mock input → Torii → Response
   - Verify schema validation

**Deliverables:** ✅ **COMPLETE**
- ✅ Working Torii API service
- ✅ Database initialized
- ✅ Basic tests passing (9/9 tests, 100% pass rate)

**Agent Instructions:**
```bash
# Agent will execute:
cd ~/.openclaw/workspace/colosseum-compliance-guardian
mkdir -p backend/src/{torii,db,api}
npm init -y
npm install express zod better-sqlite3 execa
# Agent writes: torii/wrapper.ts, db/sqlite.ts, api/server.ts
npm test
```

---

### Phase 2: Solana Integration (12:33 - 16:33) - 4h

**Goal:** Fetch and parse on-chain Solana data

**Tasks:**
1. **Solana Client Setup (1h)**
   - Install `@solana/web3.js`, `@solana/spl-token`
   - Configure RPC connection (Helius API key)
   - Test connection with sample queries

2. **Token Data Fetcher (2h)**
   - Implement `getTokenInfo(mintAddress)` function
   - Fetch: name, symbol, supply, decimals
   - Get token holder distribution
   - Extract mint/freeze authorities
   - Parse metadata (Metaplex standard)

3. **Program Data Fetcher (1h)**
   - Implement `getProgramInfo(programId)` function
   - Check if program is executable/upgradeable
   - Get upgrade authority
   - Fetch recent transaction count

4. **Integration Testing (30min)**
   - Test with real tokens: $BONK, $WIF, $PYTH
   - Verify data accuracy against Solscan
   - Handle edge cases (null authorities, etc.)

**Deliverables:** ✅ **COMPLETE**
- ✅ Solana integration layer complete
- ✅ Tested with 3+ real tokens ($BONK, $WIF, USDC)
- ✅ Data structures match architecture spec
- ✅ Risk scoring implemented

**Agent Instructions:**
```bash
# Agent will execute:
cd backend
npm install @solana/web3.js @solana/spl-token @metaplex-foundation/js
mkdir -p src/solana
# Agent writes: solana/client.ts, solana/token.ts, solana/program.ts
npm test -- solana
```

**Test Cases:**
- `$BONK`: DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB264
- `$WIF`: EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm
- `$PYTH`: HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3

---

### Phase 3: Agent Decision Logic (16:33 - 20:33) - 4h

**Goal:** Implement autonomous auditing workflow

**Tasks:**
1. **Core Auditor (2h)**
   - Implement `auditToken(mintAddress)` function
   - Orchestrate: Solana fetch → Torii check → Risk calc
   - Apply autonomous risk adjustment rules
   - Generate recommendations
   - Store audit result in database

2. **Job Queue System (1h)**
   - Set up BullMQ for async job processing
   - Create `audit-queue` for batching
   - Implement job worker
   - Add retry logic for failures

3. **Alert System (30min)**
   - Implement basic alerting (console log for MVP)
   - Trigger on critical risk levels
   - Optional: Telegram integration if time permits

4. **Scheduled Re-audits (30min)**
   - Use `node-cron` for periodic checks
   - Re-audit flagged tokens every 24h
   - Update risk scores in database

**Deliverables:** ✅ **COMPLETE**
- ✅ End-to-end audit flow working
- ✅ Job queue processing audits
- ✅ Autonomous decision rules applied
- ✅ Risk scoring algorithm implemented

**Agent Instructions:**
```bash
# Agent will execute:
cd backend
npm install bullmq node-cron winston
mkdir -p src/agent
# Agent writes: agent/auditor.ts, agent/scheduler.ts, agent/alerts.ts
npm test -- agent
```

**Test Case:**
```bash
# Audit $BONK and verify output
curl -X POST http://localhost:3000/api/audit \
  -H "Content-Type: application/json" \
  -d '{"mintAddress": "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB264"}'
```

**Expected Output:**
```json
{
  "token": {
    "name": "Bonk",
    "symbol": "BONK",
    "supply": 100000000000000
  },
  "riskScore": 55,
  "riskLevel": "medium",
  "violations": [
    "High holder concentration (top holder: 35%)",
    "Centralized upgrade authority"
  ],
  "recommendations": [
    "Implement multi-sig for upgrade authority",
    "Encourage wider distribution"
  ]
}
```

---

## Day 2: UI, Testing & Submission (Feb 11)

### Phase 4: Dashboard UI (08:33 - 12:33) - 4h

**Goal:** Build minimal viable dashboard for demo

**Tasks:**
1. **Project Setup (30min)**
   - Initialize Vite + React project
   - Install Tailwind CSS, React Query
   - Set up routing (React Router)

2. **Dashboard Home (1h)**
   - Display audit statistics (total, by risk level)
   - Show recent audits table
   - Add "Audit Token" button

3. **Audit Form (1h)**
   - Input field for mint address
   - Submit button triggers backend API
   - Loading state while auditing
   - Display results inline

4. **Audit Detail View (1h)**
   - Show full audit report
   - Display risk score with visual bar
   - List violations and recommendations
   - Add download/share buttons

5. **Styling & Polish (30min)**
   - Apply Tailwind styling
   - Add responsive layout
   - Basic error handling (invalid address)

**Deliverables:** ✅ **COMPLETE**
- ✅ Working dashboard UI (Next.js 14)
- ✅ Can submit audit requests
- ✅ Results displayed clearly
- ✅ Responsive design with Tailwind CSS
- ✅ UI components built (badges, cards, forms)

**Agent Instructions:**
```bash
# Agent will execute:
cd ~/.openclaw/workspace/colosseum-compliance-guardian
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install tailwindcss react-query react-router-dom
npx tailwindcss init
mkdir -p src/components
# Agent writes: components/Dashboard.tsx, AuditForm.tsx, AuditDetail.tsx
npm run dev
```

**UI Design Priorities:**
- ⭐ **Critical:** Audit form + results display
- ⭐ **Important:** Dashboard stats
- ⚪ **Nice-to-have:** Charts, filtering, dark mode

---

### Phase 5: Testing & Polish (12:33 - 16:33) - 4h

**Goal:** Ensure demo-ready quality

**Tasks:**
1. **Integration Testing (1.5h)**
   - Test full flow: UI → API → Solana → Torii → DB → UI
   - Audit 5+ different tokens (various risk levels)
   - Verify data accuracy
   - Check error handling (invalid address, RPC timeout)

2. **Performance Optimization (1h)**
   - Add caching for repeated queries
   - Optimize Solana RPC calls
   - Test under load (10 concurrent audits)

3. **Documentation (1h)**
   - Write README.md with demo instructions
   - Create API.md for endpoint documentation
   - Document agent authorship proof

4. **Bug Fixes (30min)**
   - Address any critical issues found
   - Improve error messages
   - Add input validation

**Deliverables:** 🔄 **IN PROGRESS (Day 2)**
- ✅ All tests passing (Torii: 9/9, Solana: tested, Agent: tested)
- 🔄 Demo script ready (written, needs video recording)
- ✅ Documentation complete (README.md, ARCHITECTURE.md, SUBMISSION.md)
- ✅ Code cleanup (no debug logs, consistent formatting)
- ⏳ Final integration testing needed

**Testing Checklist:**
- [x] Audit $BONK successfully ✅
- [x] Audit unknown token shows error ✅
- [x] Dashboard loads without crashing ✅
- [ ] API handles 10 concurrent requests (needs stress test)
- [x] Database persists audits correctly ✅
- [x] Torii wrapper returns valid responses ✅ (9/9 tests passing)

---

### Phase 6: Demo & Submission (16:33 - 20:33) - 4h

**Goal:** Record demo video and submit to Colosseum

**Tasks:**
1. **Deployment (1.5h)**
   - Deploy backend to Render/Railway
   - Deploy frontend to Vercel
   - Configure environment variables
   - Test live URLs

2. **Demo Video (1.5h)**
   - Script: 3-5 minute walkthrough
   - Show: Agent autonomy, Solana integration, compliance checking
   - Record using OBS/Loom
   - Edit and upload to YouTube

3. **Submission (1h)**
   - Fill out Colosseum submission form
   - Provide GitHub repo URL
   - Add demo video link
   - Write project description
   - Submit before deadline

**Demo Script:**
```
[0:00-0:30] Introduction
- "Solana Compliance Guardian - autonomous AI agent for Japan crypto compliance"

[0:30-1:30] Problem Statement
- "Japan has strict crypto regulations (PSA, FIEA)"
- "Projects need to verify compliance to operate legally"
- "Manual audits are slow and expensive"

[1:30-3:00] Demo
- Open dashboard
- Enter $BONK mint address
- Click "Audit Token"
- Show: Fetching on-chain data from Solana
- Show: Risk score calculated (55/100 - Medium Risk)
- Show: Violations listed (centralization, holder concentration)
- Show: Recommendations provided

[3:00-4:00] Technical Highlights
- "100% AI-agent-written code" (show .agent-commits/)
- "Solana-native on-chain analysis"
- "Torii compliance engine integration"
- "Autonomous decision logic"

[4:00-5:00] Closing
- "Live demo: [URL]"
- "GitHub: [repo]"
- "Thank you!"
```

**Deliverables:** ⏳ **PENDING (Priority #1)**
- ⏳ Live demo deployed (can run locally, public deployment optional)
- ⏳ Video uploaded (HIGHEST PRIORITY - 3-5 min demo)
- ⏳ Submission completed (form to be filled after video)

---

## Optional Stretch Goals (Day 2 Buffer)

**If time permits (Feb 11, 20:33 - Feb 12, 20:33):**

### 1. On-Chain Attestation (8h)
- Write Anchor program for compliance attestation
- Deploy to Solana devnet
- Store audit results on-chain
- Update UI to show attestation status

### 2. Auto-Discovery (4h)
- Integrate Raydium API to find new tokens
- Auto-audit top 10 trending tokens daily
- Display "Trending Audits" section in dashboard

### 3. Alert System (2h)
- Telegram bot integration
- Send alerts for critical risk tokens
- Allow users to subscribe to specific tokens

### 4. Advanced Analytics (4h)
- Add charts (risk distribution over time)
- Compare tokens by risk level
- Generate compliance trends report

**Prioritization:**
1. ⭐⭐⭐ On-chain attestation (most impressive for judges)
2. ⭐⭐ Auto-discovery (demonstrates true autonomy)
3. ⭐ Alert system (practical feature)
4. ⚪ Analytics (polish, not essential)

---

## Critical Path Items

**MUST HAVE (will fail without these):**
1. ✅ Torii API wrapper working **DONE**
2. ✅ Solana token data fetching **DONE**
3. ✅ Agent auditor logic complete **DONE**
4. ✅ Basic UI (form + results) **DONE**
5. 🔄 End-to-end test passing **NEEDS FINAL TEST**
6. ⏳ Demo video recorded **TOP PRIORITY - NOT STARTED**
7. ⏳ Submission completed **AFTER VIDEO**

**SHOULD HAVE (major selling points):**
1. ✅ Job queue for batch processing **DONE (queue.ts implemented)**
2. ✅ Database persistence **DONE (JSON files working)**
3. ✅ Autonomous decision rules **DONE (risk-scorer.ts)**
4. 🔄 GitHub proof of agent authorship **CODE READY, NEEDS COMMIT**

**NICE TO HAVE (differentiators):**
1. On-chain attestation
2. Auto-discovery
3. Alert system
4. Charts/analytics

---

## Risk Mitigation Plan

### Risk 1: Torii Skill Broken
**Probability:** Low  
**Impact:** Critical  
**Mitigation:**
- Test Torii skill FIRST (Day 1, Hour 1)
- If broken, create mock compliance checker
- Fallback: Simple rule-based system (no Torii)

### Risk 2: Solana RPC Downtime
**Probability:** Medium  
**Impact:** High  
**Mitigation:**
- Use Helius paid tier (99.9% uptime)
- Implement fallback to Quicknode
- Cache recent queries

### Risk 3: Agent Writes Buggy Code
**Probability:** Medium  
**Impact:** Medium  
**Mitigation:**
- Iterative testing after each phase
- Human reviews critical sections
- Keep scope minimal (MVP focus)

### Risk 4: UI Not Ready
**Probability:** Medium  
**Impact:** Low  
**Mitigation:**
- Backend can demo via curl
- UI is "nice-to-have" not required
- Use simple HTML if React fails

### Risk 5: Deployment Issues
**Probability:** Medium  
**Impact:** Medium  
**Mitigation:**
- Test deployment on Day 1 evening
- Have local demo ready as backup
- Record video using localhost

---

## Agent Autonomy Proof

**GitHub Commit Strategy:**
- All commits by AI agent (not human)
- Use `.agent-commits/commit-log.md` to track authorship
- Commit messages: "AI: [feature] [description]"

**Example Commit Log:**
```
AI: Initialize project structure
AI: Implement Torii API wrapper
AI: Add Solana token data fetcher
AI: Create agent auditor logic
AI: Build React dashboard UI
AI: Add integration tests
AI: Deploy to production
```

**Additional Proof:**
- Code comments: "Generated by AI Agent"
- README: "🤖 100% AI-Written Code"
- CONTRIBUTING.md: "This project was built autonomously by an AI agent"

---

## Daily Checklist

### End of Day 1 (Feb 10, 20:33) ✅ **COMPLETED**
- [x] Torii API wrapper tested and working ✅
- [x] Solana integration fetches real token data ✅
- [x] Agent can audit $BONK and return risk score ✅
- [x] Database stores audit results ✅
- [x] All backend tests passing ✅ (9/9 Torii tests)
- [x] GitHub repo initialized (commits pending)

### End of Day 2 (Feb 11, 20:33) 🔄 **IN PROGRESS**
- [x] Dashboard UI built (local testing complete) ✅
- [ ] End-to-end audit flow tested (needs final verification)
- [ ] Demo video recorded and uploaded ⏳ **PRIORITY #1**
- [ ] Colosseum submission completed ⏳
- [x] GitHub README complete ✅
- [x] All documentation complete ✅ (README, ARCHITECTURE, SUBMISSION, PLAN)

### Final Deadline (Feb 12, 23:59 UTC) ⏳ **37 HOURS REMAINING**
- [ ] Submission confirmed received ⏳
- [x] Demo ready (can run locally) ✅
- [ ] GitHub repo public and documented (code ready, needs git push)
- [ ] Video unlisted/public on YouTube ⏳ **TOP PRIORITY**

---

## Resource Allocation

| Component | Estimated Hours | Priority |
|-----------|----------------|----------|
| Torii API Wrapper | 2h | ⭐⭐⭐ Critical |
| Solana Integration | 3h | ⭐⭐⭐ Critical |
| Agent Logic | 4h | ⭐⭐⭐ Critical |
| Database | 1h | ⭐⭐ Important |
| Dashboard UI | 4h | ⭐⭐ Important |
| Testing | 3h | ⭐⭐ Important |
| Deployment | 2h | ⭐⭐ Important |
| Demo Video | 2h | ⭐⭐⭐ Critical |
| On-Chain Attestation | 8h | ⚪ Optional |
| **TOTAL (Critical)** | **20h** | 48h available |

**Time Buffer:** 28 hours for debugging, polish, and optional features

---

## Success Criteria

### Minimum Viable Demo (must achieve):
1. User enters Solana token mint address
2. System fetches on-chain data from Solana
3. Agent queries Torii for compliance check
4. Risk score (0-100) displayed
5. Violations and recommendations listed
6. Result stored in database
7. Demo video shows full flow

### Competitive Advantage (should achieve):
1. On-chain attestation stored on Solana
2. Auto-discovery of new tokens
3. Job queue handling concurrent audits
4. Telegram alerts for critical risks

### "Most Agentic" Criteria (bonus $5K):
1. Agent writes 100% of new code
2. Autonomous decision-making demonstrated
3. Minimal human intervention required
4. Agent schedules own re-audits
5. Clear proof of AI authorship

---

## Communication Plan

**During Development:**
- Agent commits every 30-60 minutes
- Update PLAN.md with progress notes
- Flag blockers immediately

**Day 1 EOD Report:**
- What's completed
- What's blocked
- Adjustments to Day 2 plan

**Day 2 EOD Report:**
- Final status
- Demo readiness
- Submission confirmation

---

## Fallback Plans

**If Critical Failure (24h before deadline):**
1. Simplify to core demo (backend only, no UI)
2. Use curl for demo video
3. Focus on agent autonomy proof
4. Submit minimal viable project

**If Moderate Delay (12h before deadline):**
1. Skip optional features (on-chain, alerts)
2. Use basic HTML instead of React
3. Deploy backend only, manual testing for demo

**If Minor Delay (4h before deadline):**
1. Skip polish and analytics
2. Record demo with known bugs noted
3. Submit with "known issues" section

---

## Post-Submission (Optional)

**If Project Wins:**
- Add production-ready features
- Scale to support more jurisdictions (US, EU)
- Partner with Solana projects for compliance checking
- Open-source under MIT license

**If Project Doesn't Win:**
- Still valuable tool for Japan crypto ecosystem
- Can be used by Solana projects pre-launch
- Torii skill gains real-world usage
- Learning experience for future hackathons

---

**Plan Version:** 1.0  
**Last Updated:** Feb 10, 2026, 08:33 JST  
**Next Review:** End of Day 1 (Feb 10, 20:33 JST)  
**Estimated Completion:** Feb 11, 20:33 JST (4h buffer remaining)

---

## Quick Command Reference

**Start Development:**
```bash
cd ~/.openclaw/workspace/colosseum-compliance-guardian
npm run dev          # Start all services
npm test             # Run tests
npm run deploy       # Deploy to production
```

**Test Single Token:**
```bash
curl -X POST http://localhost:3000/api/audit \
  -H "Content-Type: application/json" \
  -d '{"mintAddress": "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB264"}'
```

**Check Agent Commits:**
```bash
git log --author="AI Agent" --oneline
cat .agent-commits/commit-log.md
```

**Deploy:**
```bash
# Backend (Render)
git push render main

# Frontend (Vercel)
cd frontend && vercel --prod
```

---

**Ready to start? Begin with Phase 1: Backend Foundation (Day 1, 08:33-12:33)**
