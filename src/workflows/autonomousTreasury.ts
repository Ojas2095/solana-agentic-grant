#!/usr/bin/env node
import chalk from 'chalk';
import { SolanaAgent } from '../agent/SolanaAgent.js';
import { ReActExecutor } from '../agent/executor.js';

/**
 * Autonomous Treasury Workflow
 * Periodically or event-driven checks wallet treasury balance.
 * If SOL balance > threshold (e.g. 2.0 SOL), reallocates excess into stable USDC
 * or staking pool to protect treasury value against market drawdown.
 */
export async function runAutonomousTreasury(thresholdSol: number = 2.0) {
  console.log(chalk.bold.magenta('\n============================================================='));
  console.log(chalk.bold.magenta('       AUTONOMOUS SOLANA TREASURY REBALANCING WORKFLOW       '));
  console.log(chalk.bold.magenta('============================================================='));
  console.log(`Treasury Strategy: Auto-Reserve Sweep`);
  console.log(`Reserve Threshold: ${thresholdSol} SOL`);

  const agent = new SolanaAgent({
    securityPolicy: {
      maxSolPerTx: 2.0,
      dailySpendLimitSol: 10.0,
      requireSimulation: true,
    },
  });

  console.log(`Agent Address    : ${chalk.green(agent.getAddress())}`);

  const executor = new ReActExecutor(agent);
  const prompt = `Inspect wallet balance and network status, then sweep treasury excess if balance exceeds ${thresholdSol} SOL into USDC and query staking yields.`;

  console.log(`\nExecuting ReAct Reasoning Loop...`);
  const result = await executor.executeObjective(prompt);

  console.log(chalk.bold.green('\n--- EXECUTION REASONING TRACE ---'));
  result.steps.forEach((step) => {
    console.log(chalk.yellow(`\n[Turn ${step.turn}] Thought:`), step.thought);
    if (step.action) {
      console.log(chalk.cyan(`  Action:`), step.action);
      console.log(chalk.gray(`  Action Input:`), JSON.stringify(step.actionInput));
      console.log(chalk.green(`  Observation:`), step.observation?.success ? 'SUCCESS' : 'FAILED', step.observation?.data || step.observation?.error);
    }
  });

  console.log(chalk.bold.green('\n--- FINAL SYNTHESIS ---'));
  console.log(result.finalAnswer);
  console.log(`Total Turns: ${result.totalTurns} | Duration: ${result.durationMs} ms`);
  console.log(chalk.bold.magenta('=============================================================\n'));
  return result;
}

if (process.argv[1]?.includes('autonomousTreasury')) {
  runAutonomousTreasury();
}
