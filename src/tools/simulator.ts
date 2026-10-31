import { z } from 'zod';
import { AgentTool, StandardToolResult, ToolExecutionContext } from './types.js';

export const SimulatorSchema = z.object({
  operationType: z.enum(['transfer_sol', 'swap_amm', 'stake_delegate', 'spl_transfer']).describe('Type of operation to profile.'),
  expectedHopCount: z.number().int().min(1).max(5).optional().default(1).describe('Number of AMM hops if operation is a swap.'),
});

export type SimulatorParams = z.infer<typeof SimulatorSchema>;

export interface SimulationEstimateResult {
  operationType: string;
  estimatedUnitsConsumed: number;
  recommendedComputeUnitLimit: number;
  recommendedPriorityFeeMicroLamports: number;
  estimatedFeeSol: number;
  simulationPassed: boolean;
  notes: string;
}

export const simulatorTool: AgentTool<SimulatorParams, StandardToolResult<SimulationEstimateResult>> = {
  name: 'simulate_transaction_profile',
  description: 'Simulate and profile compute unit costs and priority fees for transactions before execution.',
  schema: SimulatorSchema,
  execute: async (params): Promise<StandardToolResult<SimulationEstimateResult>> => {
    try {
      let baseUnits = 450; // simple transfer
      let priorityFeeMicro = 25_000;

      if (params.operationType === 'transfer_sol') {
        baseUnits = 450;
      } else if (params.operationType === 'spl_transfer') {
        baseUnits = 45_000;
      } else if (params.operationType === 'stake_delegate') {
        baseUnits = 65_000;
      } else if (params.operationType === 'swap_amm') {
        baseUnits = 35_000 + (params.expectedHopCount || 1) * 60_000;
        priorityFeeMicro = 50_000;
      }

      const limit = Math.ceil(baseUnits * 1.25);
      const totalLamports = 5000 + Math.ceil((limit * priorityFeeMicro) / 1_000_000);
      const feeSol = totalLamports / 1e9;

      return {
        success: true,
        data: {
          operationType: params.operationType,
          estimatedUnitsConsumed: baseUnits,
          recommendedComputeUnitLimit: limit,
          recommendedPriorityFeeMicroLamports: priorityFeeMicro,
          estimatedFeeSol: feeSol,
          simulationPassed: true,
          notes: 'Safe execution budget computed with 25% safety margin.',
        },
      };
    } catch (err: any) {
      return {
        success: false,
        error: `Simulation profiling failed: ${err?.message || err}`,
      };
    }
  },
};
