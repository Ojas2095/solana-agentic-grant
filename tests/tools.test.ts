import { describe, it, expect } from 'vitest';
import { SolanaAgent } from '../src/agent/SolanaAgent.js';
import { ALL_TOOLS } from '../src/tools/index.js';

describe('Solana Agent Structured Tool Registry', () => {
  const agent = new SolanaAgent();
  const context = agent.getContext();

  it('contains at least 8 structured tools in the registry', () => {
    expect(ALL_TOOLS.length).toBeGreaterThanOrEqual(8);
    const toolNames = ALL_TOOLS.map((t) => t.name);
    expect(toolNames).toContain('get_balance');
    expect(toolNames).toContain('transfer_sol');
    expect(toolNames).toContain('swap_tokens');
    expect(toolNames).toContain('get_token_price');
    expect(toolNames).toContain('stake_sol');
    expect(toolNames).toContain('get_network_status');
    expect(toolNames).toContain('simulate_transaction_profile');
    expect(toolNames).toContain('inspect_account');
  });

  it('executes get_balance tool and returns valid schema structure', async () => {
    const res = await agent.executeTool('get_balance', {});
    expect(res.success).toBe(true);
    expect(res.data).toBeDefined();
    expect(res.data.address).toBe(agent.getAddress());
    expect(typeof res.data.sol).toBe('number');
  });

  it('executes price oracle tool across multiple assets', async () => {
    const res = await agent.executeTool('get_token_price', {
      tokens: ['SOL', 'BONK', 'USDC'],
    });
    expect(res.success).toBe(true);
    expect(res.data).toBeDefined();
    expect(res.data.SOL.priceUsd).toBeGreaterThan(0);
    expect(res.data.USDC.priceUsd).toBeCloseTo(1.0, 1);
  });

  it('executes simulate_transaction_profile tool and computes safe budgets', async () => {
    const res = await agent.executeTool('simulate_transaction_profile', {
      operationType: 'swap_amm',
      expectedHopCount: 2,
    });
    expect(res.success).toBe(true);
    expect(res.data.estimatedUnitsConsumed).toBeGreaterThan(100_000);
    expect(res.data.recommendedComputeUnitLimit).toBeGreaterThan(res.data.estimatedUnitsConsumed);
  });

  it('executes network status tool and computes epoch metrics', async () => {
    const res = await agent.executeTool('get_network_status', {
      includePerformanceSamples: true,
    });
    expect(res.success).toBe(true);
    expect(res.data.epoch).toBeGreaterThan(0);
    expect(res.data.epochProgressPct).toBeGreaterThanOrEqual(0);
  });

  it('executes swap tool in simulation mode cleanly', async () => {
    const res = await agent.executeTool('swap_tokens', {
      inputMint: 'SOL',
      outputMint: 'USDC',
      amount: 1.0,
      simulateOnly: true,
    });
    expect(res.success).toBe(true);
    expect(res.data.simulated).toBe(true);
    expect(res.data.inputAmount).toBe(1.0);
    expect(BigInt(res.data.expectedOutputAmount)).toBeGreaterThan(0n);
  });

  it('handles transfer simulation and guardrail validation', async () => {
    const recipient = '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU';
    const res = await agent.executeTool('transfer_sol', {
      recipient,
      amount: 0.1,
      simulateOnly: true,
    });
    expect(res.success).toBe(true);
    expect(res.data.simulated).toBe(true);
    expect(res.data.amountSol).toBe(0.1);
  });
});
