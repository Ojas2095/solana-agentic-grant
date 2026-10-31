import { describe, it, expect } from 'vitest';
import { SecurityGuard } from '../src/agent/security.js';

describe('SecurityGuard Safety Policy Enforcement', () => {
  const guard = new SecurityGuard({
    maxSolPerTx: 2.0,
    dailySpendLimitSol: 5.0,
    requireSimulation: true,
  });

  const validRecipient = '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU';
  const blacklistedRecipient = '11111111111111111111111111111111';

  it('permits transfers within transaction limit', () => {
    const res = guard.validateTransfer(1.5, validRecipient);
    expect(res.allowed).toBe(true);
  });

  it('blocks transfers exceeding maxSolPerTx', () => {
    const res = guard.validateTransfer(2.5, validRecipient);
    expect(res.allowed).toBe(false);
    expect(res.reason).toContain('exceeds maximum transaction limit');
  });

  it('enforces daily cumulative spending limit', () => {
    // Fresh guard to test cumulative limit
    const localGuard = new SecurityGuard({
      maxSolPerTx: 2.0,
      dailySpendLimitSol: 3.0,
    });

    // Spend 1.5 SOL
    expect(localGuard.validateTransfer(1.5, validRecipient).allowed).toBe(true);
    localGuard.recordSpend(1.5);
    expect(localGuard.getDailySpentSol()).toBe(1.5);

    // Spend another 1.0 SOL (total 2.5) -> allowed
    expect(localGuard.validateTransfer(1.0, validRecipient).allowed).toBe(true);
    localGuard.recordSpend(1.0);
    expect(localGuard.getDailySpentSol()).toBe(2.5);

    // Try to spend 1.0 SOL more (would reach 3.5 > 3.0) -> BLOCKED
    const blockedRes = localGuard.validateTransfer(1.0, validRecipient);
    expect(blockedRes.allowed).toBe(false);
    expect(blockedRes.reason).toContain('exceed remaining daily limit');
  });

  it('rejects invalid or off-curve Solana public keys', () => {
    const res = guard.validateTransfer(0.5, 'invalid-non-base58-key');
    expect(res.allowed).toBe(false);
    expect(res.reason).toContain('Invalid recipient');
  });

  it('blocks transfers to blacklisted program accounts', () => {
    const res = guard.validateTransfer(0.5, blacklistedRecipient);
    expect(res.allowed).toBe(false);
    expect(res.reason).toContain('blacklisted');
  });

  it('masks private keys to prevent credential logging', () => {
    const fakeKey = '5Kq9xyzABCD1234efgh5678IJKL9012mnop3456QRST7890';
    const masked = guard.maskPrivateKey(fakeKey);
    expect(masked).toBe('5Kq9...7890');
    expect(masked).not.toContain('ABCD');
  });

  it('blocks execution when preflight simulation fails', () => {
    const simFail = guard.checkSimulationGate({
      success: false,
      error: 'Custom program error: 0x1',
    });
    expect(simFail.allowed).toBe(false);
    expect(simFail.reason).toContain('Preflight simulation gate rejected');

    const simPass = guard.checkSimulationGate({
      success: true,
      unitsConsumed: 45000,
    });
    expect(simPass.allowed).toBe(true);
  });
});
