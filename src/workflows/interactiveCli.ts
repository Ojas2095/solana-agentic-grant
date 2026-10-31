#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { SolanaAgent } from '../agent/SolanaAgent.js';
import { ReActExecutor } from '../agent/executor.js';
import { runAutonomousTreasury } from './autonomousTreasury.js';
import { runPortfolioRebalance } from './portfolioRebalance.js';

const program = new Command();

program
  .name('solana-agent')
  .description('Autonomous Solana AI Agent CLI (SendAI / LangChain ReAct Engine)')
  .version('1.0.0');

program
  .command('tools')
  .description('List all available registered structured tools in the agent tool registry')
  .action(() => {
    const agent = new SolanaAgent();
    console.log(chalk.bold.cyan('\nRegistered Agent Tools (8+ Structured Actions):'));
    console.log('--------------------------------------------------------------------------------');
    agent.getAllTools().forEach((t, i) => {
      console.log(`${chalk.green(`${i + 1}. ${t.name.padEnd(28)}`)} | ${t.description}`);
    });
    console.log('--------------------------------------------------------------------------------\n');
  });

program
  .command('ask <prompt...>')
  .description('Run conversational multi-turn ReAct reasoning loop on a user prompt')
  .action(async (promptParts: string[]) => {
    const prompt = promptParts.join(' ');
    console.log(chalk.bold.cyan(`\nUser Objective: "${prompt}"\n`));

    const agent = new SolanaAgent();
    const executor = new ReActExecutor(agent);
    const result = await executor.executeObjective(prompt);

    console.log(chalk.bold.yellow('=== REASONING TRACE ==='));
    result.steps.forEach((s) => {
      console.log(`[Turn ${s.turn}] ${chalk.gray(s.thought)}`);
      if (s.action) {
        console.log(`  ➔ Tool Call: ${chalk.green(s.action)} with input ${chalk.gray(JSON.stringify(s.actionInput))}`);
      }
    });

    console.log(chalk.bold.green('\n=== AGENT RESPONSE ==='));
    console.log(result.finalAnswer);
    console.log(`Turns: ${result.totalTurns} | Speed: ${result.durationMs}ms\n`);
  });

program
  .command('treasury')
  .description('Execute autonomous treasury reserve rebalancing sweep')
  .option('-t, --threshold <sol>', 'SOL reserve threshold', '2.0')
  .action(async (opts) => {
    await runAutonomousTreasury(parseFloat(opts.threshold));
  });

program
  .command('rebalance')
  .description('Execute dynamic portfolio allocation rebalancer')
  .action(async () => {
    await runPortfolioRebalance();
  });

program.parse(process.argv);
