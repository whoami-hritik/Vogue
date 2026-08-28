import { describe, it, expect } from 'vitest';
import { evaluateRiskModel } from '../src/lib/riskModel';
import { VogueContractSimulator, StrategyWitnesses } from '../managed/vogue';

describe('Empirical EZKL ZK-ML Risk Model & Compact Contract End-to-End Suite', () => {
  it('CASE A: Safe Trade Parameters -> EZKL Risk Pass -> Compact Circuit Executes', async () => {
    const safeRiskInput = { volatilityPct: 20, positionSizePct: 15, stopLossDistancePct: 90 };
    const safeEval = await evaluateRiskModel(safeRiskInput);

    expect(safeEval.passed).toBe(true);
    expect(safeEval.score).toBeLessThanOrEqual(35.0);
    expect(safeEval.proofHash.startsWith('0xezkl_')).toBe(true);

    const safeWitnesses: StrategyWitnesses = {
      getStrategyAsset: () => 'ADA',
      getMaxPositionPct: () => 20,
      getStopLossPct: () => 10,
      getStrategyExpiry: () => 1760000000n,
      getPortfolioValue: () => 10000n,
      getTradeAsset: () => 'ADA',
      getTradeSizeUsd: () => 1500n,
      localSecretKey: () => '0xsafe_key_123',
      getRiskCheckPassed: () => safeEval.passed,
    };

    const contractA = new VogueContractSimulator(safeWitnesses);
    contractA.commitStrategy('0xagent_safe');
    const resultA = contractA.executeTrade('0xagent_safe', '0xtrade_safe', 1750000000n);

    expect(resultA.status).toBe('executed');
    expect(contractA.tradeStatus.get('0xtrade_safe')).toBe(1);
    expect(contractA.tradeCount).toBe(1);
  });

  it('CASE B: Reckless Trade Parameters -> EZKL Risk Fail -> Compact Circuit Blocked', async () => {
    const recklessRiskInput = { volatilityPct: 85, positionSizePct: 75, stopLossDistancePct: 15 };
    const recklessEval = await evaluateRiskModel(recklessRiskInput);

    expect(recklessEval.passed).toBe(false);
    expect(recklessEval.score).toBeGreaterThan(35.0);
    expect(recklessEval.proofHash.startsWith('0xezkl_')).toBe(true);

    const recklessWitnesses: StrategyWitnesses = {
      getStrategyAsset: () => 'ADA',
      getMaxPositionPct: () => 20,
      getStopLossPct: () => 10,
      getStrategyExpiry: () => 1760000000n,
      getPortfolioValue: () => 10000n,
      getTradeAsset: () => 'ADA',
      getTradeSizeUsd: () => 1500n,
      localSecretKey: () => '0xreckless_key_123',
      getRiskCheckPassed: () => recklessEval.passed,
    };

    const contractB = new VogueContractSimulator(recklessWitnesses);
    contractB.commitStrategy('0xagent_reckless');
    const resultB = contractB.executeTrade('0xagent_reckless', '0xtrade_reckless', 1750000000n);

    expect(resultB.status).toBe('rejected');
    expect(resultB.reason).toBe('risk model check failed');
    expect(contractB.tradeStatus.get('0xtrade_reckless')).toBe(2);
  });
});
