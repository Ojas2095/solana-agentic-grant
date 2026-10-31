import { PublicKey } from '@solana/web3.js';

export interface SecurityPolicy {
  maxSolPerTx: number;              // E.g. max 5.0 SOL in a single transaction
  dailySpendLimitSol: number;       // E.g. max 20.0 SOL within 24h
  requireSimulation: boolean;       // Must simulate before broadcast
  blockedAddresses: string[];       // Blacklist addresses
  allowedMints?: string[];          // Optional whitelist of SPL mints
}

export const DEFAULT_SECURITY_POLICY: SecurityPolicy = {
  maxSolPerTx: 5.0,
  dailySpendLimitSol: 20.0,
  requireSimulation: true,
  blockedAddresses: [
    '11111111111111111111111111111111', // System program as recipient
  ],
};

export interface SecurityCheckResult {
  allowed: boolean;
  reason?: string;
  sanitizedDetails?: Record<string, any>;
}

export class SecurityGuard {
  private policy: SecurityPolicy;
  private dailySpendSol: number = 0;
  private lastResetTimestamp: number = Date.now();

  constructor(customPolicy?: Partial<SecurityPolicy>) {
    this.policy = { ...DEFAULT_SECURITY_POLICY, ...customPolicy };
  }

  public getPolicy(): SecurityPolicy {
    return { ...this.policy };
  }

  public getDailySpentSol(): number {
    this.resetIfDayPassed();
    return this.dailySpendSol;
  }

  private resetIfDayPassed(): void {
    const oneDayMs = 24 * 60 * 60 * 1000;
    if (Date.now() - this.lastResetTimestamp > oneDayMs) {
      this.dailySpendSol = 0;
      this.lastResetTimestamp = Date.now();
    }
  }

  /**
   * Sanitizes private keys or sensitive base58 strings so they are NEVER leaked into logs.
   * E.g. 5Kq9...j8Fm
   */
  public maskPrivateKey(key: string): string {
    if (!key || key.length < 10) return '***';
    return `${key.slice(0, 4)}...${key.slice(-4)}`;
  }

  /**
   * Validates a proposed SOL transfer against security rules.
   */
  public validateTransfer(amountSol: number, recipientAddress: string): SecurityCheckResult {
    this.resetIfDayPassed();

    if (typeof amountSol !== 'number' || Number.isNaN(amountSol) || amountSol <= 0) {
      return { allowed: false, reason: 'Transfer amount must be strictly positive' };
    }

    if (amountSol > this.policy.maxSolPerTx) {
      return {
        allowed: false,
        reason: `Amount ${amountSol} SOL exceeds maximum transaction limit of ${this.policy.maxSolPerTx} SOL`,
      };
    }

    if (this.dailySpendSol + amountSol > this.policy.dailySpendLimitSol) {
      return {
        allowed: false,
        reason: `Proposed spend of ${amountSol} SOL would exceed remaining daily limit (${(this.policy.dailySpendLimitSol - this.dailySpendSol).toFixed(3)} SOL remaining)`,
      };
    }

    // Validate recipient address syntax
    try {
      const pubkey = new PublicKey(recipientAddress);
      if (!PublicKey.isOnCurve(pubkey.toBuffer())) {
        return { allowed: false, reason: 'Recipient address is an off-curve address (PDA); only standard on-curve wallet accounts are permitted for direct SOL transfers' };
      }
    } catch {
      return { allowed: false, reason: `Invalid recipient Solana public key address: ${recipientAddress}` };
    }

    // Check blacklist
    if (this.policy.blockedAddresses.includes(recipientAddress)) {
      return { allowed: false, reason: `Recipient address ${recipientAddress} is blacklisted by safety guardrails` };
    }

    return { allowed: true };
  }

  /**
   * Records completed spend toward daily cap.
   */
  public recordSpend(amountSol: number): void {
    this.resetIfDayPassed();
    this.dailySpendSol += amountSol;
  }

  /**
   * Verifies that preflight simulation was conducted and succeeded before allowing broadcast.
   */
  public checkSimulationGate(simulationResult: { success: boolean; error?: string; unitsConsumed?: number }): SecurityCheckResult {
    if (!this.policy.requireSimulation) {
      return { allowed: true };
    }

    if (!simulationResult.success) {
      return {
        allowed: false,
        reason: `Preflight simulation gate rejected execution: ${simulationResult.error || 'Transaction simulation failed'}`,
      };
    }

    return { allowed: true };
  }
}
