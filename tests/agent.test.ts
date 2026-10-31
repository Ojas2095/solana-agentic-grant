import { describe, it, expect } from 'vitest';
import { SolanaAgent } from '../src/agent/SolanaAgent.js';
import { ReActExecutor } from '../src/agent/executor.js';

describe('SolanaAgent & ReAct Reasoning Executor', () => {
  const agent = new SolanaAgent({
    securityPolicy: {
      maxSolPerTx: 2.0,
      dailySpendLimitSol: 5.0,
      requireSimulation: true,
    },
  });

  it('initializes agent with valid ed25519 public key and connection', () => {
    const address = agent.getAddress();
    expect(address).toBeDefined();
    expect(address.length).toBeGreaterThanOrEqual(32);
    expect(agent.getAllTools().length).toBeGreaterThanOrEqual(8);
  });

  it('converts agent tools to LangChain DynamicStructuredTools', () => {
    const lcTools = agent.toLangChainTools();
    expect(lcTools.length).toBeGreaterThanOrEqual(8);
    expect(lcTools[0].name).toBeDefined();
    expect(lcTools[0].description).toBeDefined();
    expect(typeof lcTools[0].call).toBe('function');
  });

  it('runs multi-turn ReAct reasoning loop on compound user request', async () => {
    const executor = new ReActExecutor(agent);
    const result = await executor.executeObjective(
      'Check my balance and query network TPS to prepare for execution'
    );

    expect(result.success).toBe(true);
    expect(result.steps.length).toBeGreaterThanOrEqual(2);

    // Should include get_balance tool call
    const hasBalance = result.steps.some((s) => s.action === 'get_balance');
    expect(hasBalance).toBe(true);

    // Should include get_network_status tool call
    const hasNetwork = result.steps.some((s) => s.action === 'get_network_status');
    expect(hasNetwork).toBe(true);

    expect(result.finalAnswer).toBeDefined();
    expect(result.durationMs).toBeGreaterThan(0);
  });

  it('intercepts excessive transfer through guardrails during agent execution', async () => {
    // Attempting a 10.0 SOL transfer when maxSolPerTx is 2.0
    const res = await agent.executeTool('transfer_sol', {
      recipient: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
      amount: 10.0,
    });

    expect(res.success).toBe(false);
    expect(res.error).toContain('Security guardrail blocked transfer');
  });
});
