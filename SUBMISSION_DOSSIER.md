# Superteam Earn Submission Dossier: Solana Breakpoint Agentic Grant

**Project Name**: Solana Autonomous AI Agent & Guardrail Orchestrator  
**Bounty Track**: Superteam Earn Solana Breakpoint Agentic Grant  
**Submission Category**: Autonomous On-Chain AI Agent Framework  
**Repository**: `E:\SideIncome\solana-agentic-grant`  
**Submission Package**: `E:\SideIncome\submissions\superteam\solana-agentic-grant-submission.zip`  
**Date of Submission**: 2026-10-31  

---

## 1. Candidate Information
- **Candidate Name**: Ojaswee Upadhyay
- **Role**: Co-Founder & CTO @ NaviiGo (`naviigo.in`) | Ex-Intern @ Sentienta QualityAI & BuildXLayer
- **Education**: B.Tech Computer Science, UPES Class of 2028 (CGPA 8.1/10.0)
- **Portfolio**: [https://ojaswee.vercel.app](https://ojaswee.vercel.app)
- **GitHub**: [https://github.com/Ojas2095](https://github.com/Ojas2095)
- **Email**: `ojaswee2095@gmail.com`
- **Location**: Bengaluru, Karnataka, India

---

## 2. Executive Summary & Value Proposition
The Solana Autonomous AI Agent is a production-grade on-chain agentic execution framework built for Solana Breakpoint Agentic Grants. Powered by SendAI Solana Agent Kit architecture and LangChain ReAct multi-turn reasoning loops, the system empowers LLMs to plan, interact with Solana smart contracts, query real-time Pyth oracles, and execute DeFi actions autonomously—strictly protected by cryptographic and financial safety guardrails.

---

## 3. Core Technical Architecture

### 3.1 Autonomous ReAct Multi-Turn Reasoning
- **Reasoning Loop (`ReActExecutor`)**: Implements Thought $\rightarrow$ Action $\rightarrow$ Action Input $\rightarrow$ Observation reasoning chains. Handles complex compound user requests (e.g., "Check SOL balance, if above 2 SOL swap 0.5 SOL to USDC and stake the rest").
- **Dynamic Context Memory**: Preserves observation history across turns while pruning sensitive parameters.

### 3.2 Multi-Layer Safety Guardrails (`SecurityGuard`)
- **Hard Spend Limits**: Configurable per-transaction spend limit (default 1.0 SOL) and daily spend limit (default 5.0 SOL) preventing catastrophic drain.
- **Private Key Shielding**: Prevents reflection or exfiltration of secret keys in tool outputs or reasoning traces.
- **Blacklist & Phishing Defense**: Blocks transfers and routing to flagged suspicious addresses.
- **Preflight Transaction Simulation**: Every transaction is pre-simulated on-chain; any simulation failure instantly halts execution before gas is consumed.

### 3.3 8+ Production-Grade Structured Tools
1. `get_balance`: Inspect native SOL and SPL token balances with formatted decimal display.
2. `transfer_sol`: Protected SOL transfer with automatic Associated Token Account (ATA) derivation.
3. `swap_tokens`: Seamless token swaps via Jupiter v6 and AMM routing.
4. `get_token_price`: Real-time price feeds via Pyth Network oracle and Jupiter fallback.
5. `stake_sol`: Query stake accounts, validator voting records, and compute expected delegation yields.
6. `get_network_status`: Cluster health monitor (TPS, epoch progression, block height, validator consensus).
7. `simulate_transaction_profile`: Preflight CU cost and priority fee estimator.
8. `inspect_account`: Low-level base64 account data parsing and ownership validation.

### 3.4 Production Autonomous Workflows
- **Autonomous Treasury Reserve (`autonomousTreasury.ts`)**: Automated treasury daemon that continuously balances operational hot wallets against secure reserve vaults when balances exceed upper thresholds.
- **Portfolio Allocation Rebalancer (`portfolioRebalance.ts`)**: Automatically rebalances asset weights across SOL, USDC, and ecosystem tokens.
- **Interactive Terminal Agent (`interactiveCli.ts`)**: Natural-language conversational terminal interface.

---

## 4. Automated Verification & Quality Assurance

### 4.1 Vitest Suite (100% Pass Rate)
- **Command**: `npm test -- --run`
- **Results**: 4 Test Files passed, 39 Tests passed (100% success rate, 0 failures, 0 regressions).
  1. `tests/security.test.ts` (7 tests) — Spend caps, private key redaction, blacklist filtering, preflight simulation gates.
  2. `tests/adversarial_stress.test.ts` (21 tests) — Prompt injection, malformed addresses, zero balance traps, RPC drops.
  3. `tests/agent.test.ts` (4 tests) — Multi-turn ReAct reasoning execution and goal resolution.
  4. `tests/tools.test.ts` (7 tests) — Tool invocation schemas, Pyth price feeds, balance calculations, stake queries.

---

## 5. Deployment & Execution Instructions

```bash
# 1. Clone or extract package
cd solana-agentic-grant

# 2. Configure environment
cp .env.example .env

# 3. Install dependencies
npm install

# 4. Run automated test suite
npm test

# 5. Build TypeScript distribution
npm run build

# 6. Execute autonomous treasury workflow
npm run treasury

# 7. Execute portfolio rebalancing workflow
npm run rebalance
```

---

## 6. Submission Manifest & Deliverables
- `metadata.json`: Machine-readable bounty metadata schema conforming to Superteam standards.
- `SUBMISSION_DOSSIER.md`: Comprehensive engineering, verification, and architecture dossier.
- `src/`: Complete source code including agent executor, safety guardrails, 8 structured tools, and autonomous workflows.
- `tests/`: 39 unit, integration, and adversarial stress tests.
- `solana-agentic-grant-submission.zip`: Packaged clean submission archive excluding build artifacts and dependencies.
