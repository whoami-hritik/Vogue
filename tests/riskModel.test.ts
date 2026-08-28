import { describe, it, expect } from 'vitest';
import {
  calculateRiskScore,
  evaluateRiskModel,
  verifyRiskModelProof,
  RiskInput,
} from '../src/lib/riskModel';

describe('EZKL ZK-ML Risk Eligibility Model Test Suite', () => {
  it('1. scores an obviously-safe input as PASS (score <= 35.0)', async () => {
    const safeInput: RiskInput = {
      volatilityPct: 15,       // Low volatility (15%)
      positionSizePct: 10,      // Conservative position size (10%)
      stopLossDistancePct: 90,  // Tight stop loss distance (90%)
    };

    const evaluation = await evaluateRiskModel(safeInput);

    expect(evaluation.passed).toBe(true);
    expect(evaluation.score).toBeLessThanOrEqual(35.0);
    expect(evaluation.details).toContain('Pass');
    expect(verifyRiskModelProof(evaluation.proofHash)).toBe(true);
  });

  it('2. scores an obviously-reckless input as FAIL (score > 35.0)', async () => {
    const recklessInput: RiskInput = {
      volatilityPct: 80,       // Extreme volatility (80%)
      positionSizePct: 60,      // Massive position size (60%)
      stopLossDistancePct: 20,  // Wide/distant stop loss (20%)
    };

    const evaluation = await evaluateRiskModel(recklessInput);

    expect(evaluation.passed).toBe(false);
    expect(evaluation.score).toBeGreaterThan(35.0);
    expect(evaluation.details).toContain('Fail');
    expect(verifyRiskModelProof(evaluation.proofHash)).toBe(true);
  });

  it('3. verifies EZKL ZK proof structure and rejects invalid proof hashes', () => {
    const validHash = '0xezkl_811c9dc5811c9dc5811c9dc5811c9dc5';
    const invalidHash = '0xinvalid_hash_123';

    expect(verifyRiskModelProof(validHash)).toBe(true);
    expect(verifyRiskModelProof(invalidHash)).toBe(false);
  });
});
