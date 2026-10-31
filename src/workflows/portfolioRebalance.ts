#!/usr/bin/env node
import chalk from 'chalk';
import { SolanaAgent } from '../agent/SolanaAgent.js';
import { ReActExecutor } from '../agent/executor.js';

export interface TargetAllocation {
  SOL: number;   // e.g. 0.50 (50%)
  USDC: number;  // e.g. 0.30 (30%)
  BONK: number;  // e.g. 0.20 (20%)
}

/**
 * Autonomous Portfolio Rebalancer Workflow
 * Queries current wallet holdings, computes deviations from target weight,
 * and triggers automated rebalancing swaps.
 */
export async function runPortfolioRebalance(targets: TargetAllocation = { SOL: 0.5, USDC: 0.3, BONK: 0.2 }) {
  console.log(chalk.bold.blue('\n============================================================='));
  console.log(chalk.bold.blue('        AUTONOMOUS SOLANA PORTFOLIO REBALANCER AGENT        '));
  console.log(chalk.bold.blue('============================================================='));
  console.log('Target Allocation Model:');
  console.log(`  SOL  : ${(targets.SOL * 100).toFixed(0)}%`);
  console.log(`  USDC : ${(targets.USDC * 100).toFixed(0)}%`);
  console.log(`  BONK : ${(targets.BONK * 100).toFixed(0)}%`);

  const agent = new SolanaAgent();
  console.log(`Agent Vault Address: ${chalk.green(agent.getAddress())}`);

  const executor = new ReActExecutor(agent);
  const prompt = `Query current wallet balance and current token price feeds for SOL, USDC, BONK, then execute rebalancing swap to match target portfolio distribution.`;

  console.log(`\nInitiating Autonomous Reasoning & Execution...`);
  const result = await executor.executeObjective(prompt);

  console.log(chalk.bold.green('\n--- REASONING LOOP SUMMARY ---'));
  result.steps.forEach((step) => {
    console.log(chalk.yellow(`Turn ${step.turn}:`), step.thought);
    if (step.action) {
      console.log(`  ➔ Executed: ${chalk.cyan(step.action)}`);
    }
  });

  console.log(chalk.bold.green('\n--- RESULT ---'));
  console.log(result.finalAnswer);
  console.log(chalk.bold.blue('=============================================================\n'));
  return result;
}

if (process.argv[1]?.includes('portfolioRebalance')) {
  runPortfolioRebalance();
}
