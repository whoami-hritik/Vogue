import { describe, it, expect } from 'vitest';
import { validateEvent, OPERATION_TYPES } from '../src/lib/analytics';

describe('Vogue Analytics — Privacy Strip & Validation', () => {
  const validBase = {
    client_event_id: 'test-uuid-1234',
    wallet_address: '0xabc123def456',
    operation: 'vault_minted' as const,
    status: 'success' as const,
    network: 'preprod',
  };

  it('1. validateEvent: strips private fields — maxPositionPct, stopLossPct, tradeSizeUsd, portfolioValue can never persist', () => {
    const withPrivateFields = {
      ...validBase,
      maxPositionPct: 20,
      stopLossPct: 8,
      tradeSizeUsd: 1200,
      portfolioValue: 10000,
      strategyHash: '0xdeadbeef',
      localSecretKey: '0xsecret',
      priceUsd: 0.421,
      pnlUsd: 114.5,
    };
    const result = validateEvent(withPrivateFields as Record<string, unknown>);
    expect(result).not.toBeNull();
    expect((result as unknown as Record<string, unknown>).maxPositionPct).toBeUndefined();
    expect((result as unknown as Record<string, unknown>).stopLossPct).toBeUndefined();
    expect((result as unknown as Record<string, unknown>).tradeSizeUsd).toBeUndefined();
    expect((result as unknown as Record<string, unknown>).portfolioValue).toBeUndefined();
    expect((result as unknown as Record<string, unknown>).strategyHash).toBeUndefined();
    expect((result as unknown as Record<string, unknown>).localSecretKey).toBeUndefined();
    expect((result as unknown as Record<string, unknown>).priceUsd).toBeUndefined();
    expect((result as unknown as Record<string, unknown>).pnlUsd).toBeUndefined();
    expect(result!.wallet_address).toBe('0xabc123def456');
    expect(result!.operation).toBe('vault_minted');
    expect(result!.network).toBe('preprod');
  });

  it('2. validateEvent: accepts all 6 whitelisted operation types', () => {
    for (const op of OPERATION_TYPES) {
      const result = validateEvent({ ...validBase, operation: op } as Record<string, unknown>);
      expect(result).not.toBeNull();
      expect(result!.operation).toBe(op);
    }
  });

  it('3. validateEvent: rejects unknown operation types', () => {
    const result = validateEvent({ ...validBase, operation: 'expose_strategy_params' } as Record<string, unknown>);
    expect(result).toBeNull();
  });

  it('4. validateEvent: rejects events missing required fields', () => {
    const noWallet = validateEvent({ ...validBase, wallet_address: undefined } as Record<string, unknown>);
    expect(noWallet).toBeNull();
    const noOp = validateEvent({ ...validBase, operation: undefined } as Record<string, unknown>);
    expect(noOp).toBeNull();
  });

  it('5. validateEvent: only the 7 whitelisted fields survive — no leakage possible', () => {
    const result = validateEvent({
      ...validBase,
      maxPositionPct: 25,
      stopLossPct: 10,
      tradeSizeUsd: 5000,
      portfolioValue: 50000,
      strategyExpiry: 1760000000,
      agentId: '0xagent_secret',
      localSecretKey: 'sk_private',
    } as Record<string, unknown>);
    const allowedKeys = new Set(['client_event_id', 'wallet_address', 'operation', 'status', 'tx_hash', 'duration_ms', 'network']);
    if (result) {
      for (const key of Object.keys(result as object)) {
        expect(allowedKeys.has(key)).toBe(true);
      }
    }
  });

  it('6. validateEvent: tx_hash and duration_ms are optional', () => {
    const result = validateEvent(validBase as Record<string, unknown>);
    expect(result).not.toBeNull();
    expect(result!.tx_hash).toBeUndefined();
    expect(result!.duration_ms).toBeUndefined();
  });

  it('7. validateEvent: tx_hash and duration_ms pass through when provided', () => {
    const result = validateEvent({ ...validBase, tx_hash: '0x27ffe1f7a2db3a071c5f2070c9ae6de476f839d7870a6f3c4da78d326cd28645', duration_ms: 420 } as Record<string, unknown>);
    expect(result).not.toBeNull();
    expect(result!.tx_hash).toBe('0x27ffe1f7a2db3a071c5f2070c9ae6de476f839d7870a6f3c4da78d326cd28645');
    expect(result!.duration_ms).toBe(420);
  });
});