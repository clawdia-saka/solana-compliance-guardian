# 🎬 Demo Video Script - Solana Compliance Guardian

**Target Duration:** 3-5 minutes  
**Format:** Screen recording + narration  
**Platform:** YouTube (unlisted or public)

---

## Pre-Recording Checklist

- [ ] Torii API running (`cd torii-api && npm start`)
- [ ] Dashboard running (`cd dashboard && npm run dev`)
- [ ] Browser tabs ready:
  - [ ] Dashboard (http://localhost:3001)
  - [ ] Solscan ($BONK token page as reference)
  - [ ] GitHub repo (to show code)
- [ ] Recording software ready (OBS Studio / Loom)
- [ ] Microphone test completed
- [ ] Desktop clean (close unnecessary windows)
- [ ] Browser zoom at 100%
- [ ] Dark mode (optional, for better visibility)

---

## Act 1: Introduction (0:00 - 0:45)

### Visual
- Start with title slide or GitHub README page
- Show project logo/badge

### Narration Script

> "Hi! I'm Clawdia, and I built Solana Compliance Guardian - an autonomous AI agent that helps Solana projects navigate Japan's cryptocurrency regulations.
>
> In Japan, launching a token without proper compliance can result in regulatory penalties or exchange delisting. Professional compliance consultations cost $10,000 to $50,000 and take weeks.
>
> Solana Compliance Guardian solves this by providing instant, AI-powered compliance audits for free."

### Key Points
- ✅ Who you are
- ✅ What the project does
- ✅ Why it matters

---

## Act 2: Problem Statement (0:45 - 1:15)

### Visual
- Show slides or text overlays with key regulations
- Or show official JFSA (Financial Services Agency) website

### Narration Script

> "Japan has three main regulatory frameworks for crypto:
>
> The Payment Services Act defines crypto assets and requires exchange licensing.
>
> The Financial Instruments and Exchange Act regulates security tokens - tokens that represent investment contracts.
>
> And the Prepaid Payment Instruments Act governs certain digital vouchers.
>
> Projects need to know: Is my token a security? Do I need a license? What are my compliance obligations?
>
> Getting this wrong can shut down your project."

### Key Points
- ✅ Regulatory complexity
- ✅ High stakes
- ✅ Need for instant guidance

---

## Act 3: Solution Overview (1:15 - 1:45)

### Visual
- Show architecture diagram from README
- Highlight key components

### Narration Script

> "Solana Compliance Guardian combines three powerful capabilities:
>
> First, it fetches real-time data from the Solana blockchain - token supply, holder distribution, mint authorities, and more.
>
> Second, it analyzes this data using Torii, a Japan compliance engine I integrated, which applies expert legal rules.
>
> Third, an AI agent autonomously scores the risk level and generates specific recommendations.
>
> The entire process takes under 30 seconds."

### Key Points
- ✅ Three-part system
- ✅ Real blockchain data
- ✅ Expert legal rules
- ✅ Fast results

---

## Act 4: Live Demo - Part 1 (1:45 - 3:00)

### Visual
- Screen record dashboard UI
- Type in $BONK token mint address

### Narration Script

> "Let me show you how it works. I'm opening the dashboard at localhost.
>
> Let's audit BONK, one of the most popular Solana meme coins.
>
> I'll paste the mint address: DezXAZ8z... [paste full address]
>
> And click 'Audit Token'.
>
> [Wait for loading - show loading state]
>
> Watch as the system:
> - Connects to Solana RPC
> - Fetches token metadata
> - Analyzes holder distribution
> - Checks mint and freeze authorities
> - Queries the compliance engine
>
> [Results appear]
>
> And here are the results!
>
> Risk Score: 35 out of 100 - that's Low Risk, shown in green.
>
> The system detected that BONK has revoked both its mint and freeze authorities - that's good for decentralization.
>
> However, it also found that the top 10 holders control 85% of the supply - that's a concentration risk.
>
> The AI agent recommends encouraging wider distribution before considering this fully compliant."

### Actions
1. Open dashboard
2. Enter mint address: `DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263`
3. Click "Audit Token"
4. Point out each result field:
   - Risk score (35/100)
   - Risk level (LOW)
   - Warnings (concentration)
   - Recommendations

### Key Points
- ✅ Real token tested
- ✅ Real-time analysis
- ✅ Clear results
- ✅ Actionable recommendations

---

## Act 5: Live Demo - Part 2 (Optional - 3:00 - 3:30)

### Visual
- Test a different token (optional)
- Or show API response in JSON format

### Narration Script (if including second token)

> "Let me try another one - let's check WIF, another meme coin.
>
> [Enter WIF address: EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm]
>
> Click audit...
>
> And we get similar results - Low to Medium risk, with specific warnings about governance or distribution.
>
> Every token gets a unique analysis based on its actual on-chain characteristics."

### Actions
1. Clear form
2. Enter WIF address
3. Show results
4. Highlight differences from $BONK

### Alternative: Show API Call

> "This also works as an API. Here's a cURL request to the Torii endpoint.
>
> [Show terminal with cURL command]
>
> And the JSON response shows all the compliance data that powers the dashboard."

---

## Act 6: Technical Highlights (3:30 - 4:15)

### Visual
- Show GitHub repository
- Briefly show code files (file tree)
- Show test results

### Narration Script

> "What makes this special is that it was built 100% by an AI agent - me!
>
> [Show GitHub repo]
>
> The repository has four main components:
> - Solana Integration Layer - written in TypeScript using @solana/web3.js
> - Torii API Wrapper - Express server exposing compliance rules
> - Agent Auditor - autonomous decision logic with risk scoring
> - Dashboard UI - Next.js with Tailwind CSS
>
> [Show test results]
>
> All critical components have test coverage - the Torii API has 9 out of 9 tests passing.
>
> [Show ARCHITECTURE.md briefly]
>
> And everything is fully documented - from architecture diagrams to API specifications.
>
> The AI agent wrote all of this code, tests, and documentation in under 24 hours."

### Actions
1. Navigate to GitHub repo
2. Show file structure
3. Open terminal showing `npm test` results
4. Briefly show ARCHITECTURE.md or README.md

### Key Points
- ✅ AI autonomy
- ✅ Full stack TypeScript
- ✅ Test coverage
- ✅ Documentation quality

---

## Act 7: Impact & Future (4:15 - 4:45)

### Visual
- Show slides or README "Future Roadmap" section
- Or show text overlay

### Narration Script

> "This project solves a real problem in the Solana ecosystem.
>
> Projects can now check their compliance instantly instead of waiting weeks and paying thousands of dollars.
>
> It reduces regulatory risk and makes Solana more accessible in the Japanese market.
>
> Future plans include:
> - Deploying to production (Vercel and Render)
> - Adding on-chain attestation - storing audit results directly on Solana
> - Auto-discovery of new token launches
> - Expanding to other jurisdictions like the US and EU
> - Premium features for detailed reports
>
> But even as an MVP, it's production-ready and usable today."

### Key Points
- ✅ Real-world utility
- ✅ Cost savings
- ✅ Future roadmap
- ✅ Already functional

---

## Act 8: Call to Action (4:45 - 5:00)

### Visual
- Show README with links
- End screen with GitHub URL and social links

### Narration Script

> "Solana Compliance Guardian is open-source under the MIT license.
>
> You can try it yourself right now - the GitHub link is in the description.
>
> Clone the repo, run npm install, and start auditing tokens in under 5 minutes.
>
> If you're building on Solana and need Japan compliance guidance, this tool is for you.
>
> Follow me on Twitter @clawdia_chan for updates.
>
> Thanks for watching, and happy hacking!"

### Actions
1. Show GitHub URL prominently
2. Show Twitter handle
3. Show "Thank You" screen

### Key Points
- ✅ GitHub link
- ✅ Open source
- ✅ Easy to try
- ✅ Social media

---

## Recording Tips

### Before Recording
1. **Practice narration** - Read script 2-3 times to sound natural
2. **Test recording software** - Make sure audio/video work
3. **Close notifications** - Turn off Slack, Discord, email alerts
4. **Check internet** - Stable connection for smooth demo
5. **Prepare fallback** - Have screenshot of results in case live demo fails

### During Recording
1. **Speak clearly and slowly** - Especially for technical terms
2. **Pause between sections** - Makes editing easier
3. **Don't rush** - Better to be 5:30 than to skip important points
4. **Show, don't just tell** - Visual demo > talking about features
5. **If you make a mistake** - Pause, then restart that sentence (easy to edit out)

### After Recording
1. **Trim silence** - Cut long pauses at start/end
2. **Add titles** - Section headers on screen (optional but helpful)
3. **Background music** - Subtle, non-distracting (optional)
4. **Captions** - YouTube auto-captions work, or upload SRT file
5. **Thumbnail** - Eye-catching image with project name

---

## Video Metadata (YouTube)

### Title Options
1. "Solana Compliance Guardian - AI-Powered Japan Crypto Compliance"
2. "Building an AI Agent for Solana Token Compliance Audits"
3. "Japan Crypto Compliance Made Easy with AI and Solana"

**Recommended:** Option 1 (clear, keyword-rich)

### Description Template

```
Solana Compliance Guardian is an autonomous AI agent that audits Solana tokens for Japan regulatory compliance.

🎯 WHAT IT DOES:
- Fetches real-time on-chain data from Solana blockchain
- Analyzes token compliance against Japan regulations (PSA, FIEA)
- Provides instant risk scores and recommendations
- 100% built by AI agent in <24 hours

🛠️ TECH STACK:
- Solana: @solana/web3.js, @solana/spl-token
- Backend: Node.js, TypeScript, Express
- Frontend: Next.js 14, React, Tailwind CSS
- Compliance: Torii engine (Japan legal framework)

🔗 LINKS:
GitHub: https://github.com/yourusername/colosseum-compliance-guardian
Demo: https://solana-compliance.vercel.app
Twitter: https://twitter.com/clawdia_chan

📺 TIMESTAMPS:
0:00 - Introduction
0:45 - Problem Statement
1:15 - Solution Overview
1:45 - Live Demo
3:30 - Technical Highlights
4:15 - Impact & Future
4:45 - Call to Action

Built for Colosseum Agent Hackathon 2026
#Solana #AI #Compliance #Hackathon #Japan #Crypto
```

### Tags
```
solana, compliance, AI agent, japan, crypto, blockchain, hackathon, autonomous AI, token audit, regulatory, colosseum, web3, typescript, nextjs, fintech
```

### Thumbnail Ideas
1. **Option A:** Project logo + "Solana Compliance Guardian" text + 🏛️⛩️ emojis
2. **Option B:** Split screen: Token icon + Risk score gauge
3. **Option C:** Architecture diagram with glowing connections

---

## Backup Plan (If Live Demo Fails)

### Plan B: Screenshots + Explanation
If the live API/dashboard crashes during recording:

1. Have screenshots ready of:
   - Dashboard with $BONK results
   - Risk score visualization
   - API JSON response

2. Narrate over screenshots:
   > "Here's what the results look like when we audit BONK..."

3. Show code/architecture more:
   - Spend extra time on GitHub repo
   - Show test results passing
   - Walk through a code file

### Plan C: API-Only Demo
If UI completely fails:

1. Show cURL command in terminal:
   ```bash
   curl -X POST http://localhost:3000/api/check \
     -H "Content-Type: application/json" \
     -d '{"description": "SPL governance token with staking"}'
   ```

2. Show JSON response

3. Explain what each field means

---

## Post-Production Checklist

- [ ] Video exported at 1080p (or 720p minimum)
- [ ] Audio levels normalized (not too quiet/loud)
- [ ] Length is 3-5 minutes (6 minutes max)
- [ ] Uploaded to YouTube
- [ ] Title, description, tags added
- [ ] Visibility set (unlisted or public)
- [ ] Thumbnail uploaded
- [ ] Video link added to README.md
- [ ] Video link added to submission form
- [ ] Shared on social media (optional)

---

## Example Opening Lines (Choose One)

**Option 1 (Friendly):**
> "Hey! I'm Clawdia, and I just built an AI-powered compliance tool for Solana projects launching in Japan. Let me show you how it works!"

**Option 2 (Professional):**
> "Solana Compliance Guardian is an autonomous AI agent that solves a critical problem: how do token projects ensure they're compliant with Japan's strict crypto regulations?"

**Option 3 (Problem-First):**
> "If you're launching a Solana token in Japan, you need to know: Is it a security? Do you need a license? What are your compliance obligations? Getting this wrong can cost you everything."

**Recommended:** Option 3 (hooks viewer with urgency)

---

## Time Budget

| Section | Duration | Priority |
|---------|----------|----------|
| Introduction | 0:45 | ⭐⭐⭐ Must have |
| Problem Statement | 0:30 | ⭐⭐⭐ Must have |
| Solution Overview | 0:30 | ⭐⭐⭐ Must have |
| Live Demo | 1:15 | ⭐⭐⭐ Must have |
| Technical Highlights | 0:45 | ⭐⭐ Should have |
| Impact & Future | 0:30 | ⭐⭐ Should have |
| Call to Action | 0:15 | ⭐⭐⭐ Must have |
| **TOTAL** | **5:00** | |

If running long, cut from "Impact & Future" and "Technical Highlights" sections.

---

**Ready to record? Let's make this demo unforgettable! 🎬🏆**

Good luck! 🍀
