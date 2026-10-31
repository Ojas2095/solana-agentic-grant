# Solana Autonomous AI Agent (Breakpoint Agentic Grant Project)

Production-grade autonomous on-chain AI Agent designed for Solana Breakpoint Agentic Grants, powered by the SendAI Solana Agent Kit architecture and LangChain ReAct multi-turn reasoning loops.

## Core Architecture
- **Agent Coordinator (`SolanaAgent`)**: Keypair management, connection handling, and unified tool registry.
- **Safety Guardrails (`SecurityGuard`)**: Hard spend limits (per-tx and daily limits), private key shielding, blacklist filtering, and preflight simulation gates.
- **ReAct Reasoning Loop (`ReActExecutor`)**: Multi-turn planning, action selection, and observation verification.
- **8+ Structured Tools**:
  1. `get_balance`: Native SOL and SPL token balances.
  2. `transfer_sol`: Protected SOL transfers with ATA logic.
  3. `swap_tokens`: Jupiter v6 and AMM route execution.
  4. `get_token_price`: Pyth Network & Jupiter real-time oracle price feeds.
  5. `stake_sol`: Stake account query and delegation yield calculation.
  6. `get_network_status`: Cluster TPS, epoch progression, and block height.
  7. `simulate_transaction_profile`: Preflight CU cost and priority fee estimation.
  8. `inspect_account`: Low-level account data inspection.
- **Autonomous Workflows**:
  - `autonomousTreasury.ts`: Automatic treasury reserve rebalancing when SOL exceeds target threshold.
  - `portfolioRebalance.ts`: Target portfolio allocation rebalancer.
  - `interactiveCli.ts`: Conversational terminal interface.

## Quick Start
```bash
# Install dependencies
npm install

# Run automated vitest suite
npm test

# Build TypeScript
npm run build

# Run Autonomous Treasury workflow
npm run treasury

# Run Portfolio Rebalancer workflow
npm run rebalance
```
