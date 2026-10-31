import { z } from 'zod';
import { Connection, Keypair } from '@solana/web3.js';
import { SecurityGuard } from '../agent/security.js';

export interface ToolExecutionContext {
  connection: Connection;
  keypair: Keypair;
  securityGuard: SecurityGuard;
}

export interface AgentTool<TParams = any, TResult = any> {
  name: string;
  description: string;
  schema: z.ZodTypeAny;
  execute: (params: TParams, context: ToolExecutionContext) => Promise<TResult>;
}

export interface StandardToolResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  txSignature?: string;
  simulatedUnits?: number;
}
