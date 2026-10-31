import { Connection, Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { SecurityGuard, SecurityPolicy } from './security.js';
import { AgentTool, ToolExecutionContext, StandardToolResult } from '../tools/types.js';
import { ALL_TOOLS } from '../tools/index.js';

export interface SolanaAgentConfig {
  rpcUrl?: string;
  privateKey?: string;
  securityPolicy?: Partial<SecurityPolicy>;
  tools?: AgentTool[];
}

export class SolanaAgent {
  public connection: Connection;
  public keypair: Keypair;
  public securityGuard: SecurityGuard;
  private toolRegistry: Map<string, AgentTool> = new Map();

  constructor(config?: SolanaAgentConfig) {
    const rpcUrl = config?.rpcUrl || process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
    this.connection = new Connection(rpcUrl, 'confirmed');

    // Load keypair from env, config, or generate ephemeral devnet keypair
    const pk = config?.privateKey || process.env.SOLANA_PRIVATE_KEY;
    if (pk) {
      try {
        const decoded = bs58.decode(pk.trim());
        this.keypair = Keypair.fromSecretKey(decoded);
      } catch {
        this.keypair = Keypair.generate();
      }
    } else {
      this.keypair = Keypair.generate();
    }

    this.securityGuard = new SecurityGuard(config?.securityPolicy);

    // Register initial tools
    const toolsToRegister = config?.tools || ALL_TOOLS;
    toolsToRegister.forEach((t) => this.registerTool(t));
  }

  public getAddress(): string {
    return this.keypair.publicKey.toBase58();
  }

  public registerTool(tool: AgentTool): void {
    this.toolRegistry.set(tool.name, tool);
  }

  public getTool(name: string): AgentTool | undefined {
    return this.toolRegistry.get(name);
  }

  public getAllTools(): AgentTool[] {
    return Array.from(this.toolRegistry.values());
  }

  public getContext(): ToolExecutionContext {
    return {
      connection: this.connection,
      keypair: this.keypair,
      securityGuard: this.securityGuard,
    };
  }

  /**
   * Executes a tool by name with parameter validation and security guardrail enforcement.
   */
  public async executeTool<TParams = any, TResult = any>(
    name: string,
    params: TParams
  ): Promise<StandardToolResult<TResult>> {
    const tool = this.toolRegistry.get(name);
    if (!tool) {
      return {
        success: false,
        error: `Tool '${name}' not found in registry. Available tools: ${Array.from(this.toolRegistry.keys()).join(', ')}`,
      };
    }

    // Validate parameters against Zod schema
    const parsed = tool.schema.safeParse(params);
    if (!parsed.success) {
      return {
        success: false,
        error: `Invalid parameters for tool '${name}': ${parsed.error.message}`,
      };
    }

    return await tool.execute(parsed.data, this.getContext());
  }

  /**
   * Converts registered tools into standard LangChain DynamicStructuredTools
   * for zero-friction integration with LangChain ReAct agents.
   */
  public toLangChainTools(): DynamicStructuredTool[] {
    const context = this.getContext();
    return this.getAllTools().map((t) => {
      return new DynamicStructuredTool({
        name: t.name,
        description: t.description,
        schema: t.schema as any,
        func: async (args: any) => {
          const res = await t.execute(args, context);
          return JSON.stringify(res);
        },
      });
    });
  }
}
