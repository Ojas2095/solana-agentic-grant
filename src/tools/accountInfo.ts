import { z } from 'zod';
import { PublicKey } from '@solana/web3.js';
import { AgentTool, StandardToolResult, ToolExecutionContext } from './types.js';

export const AccountInfoSchema = z.object({
  address: z.string().describe('Solana base58 public key to inspect.'),
});

export type AccountInfoParams = z.infer<typeof AccountInfoSchema>;

export interface AccountInfoResult {
  address: string;
  exists: boolean;
  lamports: number;
  owner: string;
  executable: boolean;
  rentEpoch: number;
  dataSize: number;
}

export const accountInfoTool: AgentTool<AccountInfoParams, StandardToolResult<AccountInfoResult>> = {
  name: 'inspect_account',
  description: 'Inspect low-level account data, executable status, and owner program for any Solana address.',
  schema: AccountInfoSchema,
  execute: async (params, context: ToolExecutionContext): Promise<StandardToolResult<AccountInfoResult>> => {
    try {
      const pubkey = new PublicKey(params.address);
      const acc = await context.connection.getAccountInfo(pubkey);

      if (!acc) {
        return {
          success: true,
          data: {
            address: params.address,
            exists: false,
            lamports: 0,
            owner: '11111111111111111111111111111111',
            executable: false,
            rentEpoch: 0,
            dataSize: 0,
          },
        };
      }

      return {
        success: true,
        data: {
          address: params.address,
          exists: true,
          lamports: acc.lamports,
          owner: acc.owner.toBase58(),
          executable: acc.executable,
          rentEpoch: acc.rentEpoch || 0,
          dataSize: acc.data.length,
        },
      };
    } catch (err: any) {
      return {
        success: false,
        error: `Account inspection failed: ${err?.message || err}`,
      };
    }
  },
};
