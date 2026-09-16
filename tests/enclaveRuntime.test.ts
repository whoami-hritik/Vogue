import { describe, it, expect, beforeEach } from 'vitest';
import {
  calculateProportionalOrderSize,
  calculateEffectiveStopLoss,
  emitConfidentialTradeSignal,
  executeProportionalMirrorTrade,
  executeBatchProportionalMirroring,
  resolveConfidentialTrade,
  resetEnclaveRuntimeForTesting,
  getAllEnclaveSignals,
  getSignalsByStrategy,
  getAllMirroredTrades,
  getMirroredTradesByFollower,
} from '../src/lib/enclave-runtime';
import {
  subscribeToAlphaStrategy,
  CURATED_ALPHA_STRATEGIES,
  getAllSubscriptions,
} from '../src/lib/alpha-engine';
import { setLocalVaultBalance, getLocalVaultBalance } from '../src/lib/vault';

describe('Vogue Confidential Enclave Runtime & Proportional Mirroring Engine Suite', () => {
  const FOLLOWER_1 = '0xfollower_wallet_alpha_01';
  const FOLLOWER_2 = '0xfollower_wallet_alpha_02';
  const STRATEGY = CURATED_ALPHA_STRATEGIES[0]; // 0xalpha_strat_01 (Momentum Alpha)

  beforeEach(() => {
    resetEnclaveRuntimeForTesting();
    // Seed vault balance
    setLocalVaultBalance(20000);
  });

  describe('1. Proportional Order Sizing & Mathematics', () => {
    it('calculates exact proportional order size scaled to follower stake and capped by max allocation', () => {
      // Master executes $50,000 notional.
      // Pool total capital: $500,000.
      // Follower allocated stake: $10,000 (which is 2% of pool).
      // Expected raw size: 50,000 * (10,000 / 500,000) = $1,000.
      const sizing = calculateProportionalOrderSize(
        50000,
        10000,
        500000,
        2500 // maxTradeAllocationUsd
      );

      expect(sizing.proportionalSizeUsd).toBe(1000);
      expect(sizing.proportionalAllocationBps).toBe(1000); // 10% of $10,000 stake = 1000 bps
    });

    it('strictly caps proportional order size at maxTradeAllocationUsd when raw size exceeds limit', () => {
      // Master executes $100,000 on a $200,000 pool (50% ratio).
      // Follower stake: $20,000 -> raw size would be $10,000.
      // But follower max trade allocation is $2,500.
      const sizing = calculateProportionalOrderSize(
        100000,
        20000,
        200000,
        2500
      );

      expect(sizing.proportionalSizeUsd).toBe(2500);
      expect(sizing.proportionalAllocationBps).toBe(1250); // 2500 / 20000 = 12.5% = 1250 bps
    });

    it('handles zero or negative inputs safely by returning zero sizing', () => {
      const zeroSizing = calculateProportionalOrderSize(0, 5000, 100000, 1000);
      expect(zeroSizing.proportionalSizeUsd).toBe(0);
      expect(zeroSizing.proportionalAllocationBps).toBe(0);
    });
  });

  describe('2. Personal Stop-Loss Boundaries Calculation', () => {
    it('enforces tighter personal stop loss on LONG trades when personal SL is above master SL', () => {
      // Entry: $100. Master SL: $90 (-10%). Follower personal SL: 5% (triggers at $95).
      const res = calculateEffectiveStopLoss(100, 90, 'LONG', 5);
      expect(res.usesPersonalStopLoss).toBe(true);
      expect(res.effectiveStopLossPriceUsd).toBe(95);
    });

    it('keeps master stop loss on LONG trades when master SL is tighter than personal SL', () => {
      // Entry: $100. Master SL: $97 (-3%). Follower personal SL: 8% (triggers at $92).
      const res = calculateEffectiveStopLoss(100, 97, 'LONG', 8);
      expect(res.usesPersonalStopLoss).toBe(false);
      expect(res.effectiveStopLossPriceUsd).toBe(97);
    });

    it('enforces tighter personal stop loss on SHORT trades when personal SL is below master SL', () => {
      // Entry: $100. Master SL: $115 (+15%). Follower personal SL: 4% (triggers at $104).
      const res = calculateEffectiveStopLoss(100, 115, 'SHORT', 4);
      expect(res.usesPersonalStopLoss).toBe(true);
      expect(res.effectiveStopLossPriceUsd).toBe(104);
    });
  });

  describe('3. Confidential Enclave Signal Emission', () => {
    it('emits confidential trade signal with TEE attestation and commitment hash', async () => {
      const signal = await emitConfidentialTradeSignal({
        strategyId: STRATEGY.id,
        assetSymbol: 'BTC',
        direction: 'LONG',
        entryPriceUsd: 65000,
        targetPriceUsd: 72000,
        stopLossPriceUsd: 62000,
        masterPositionNotionalUsd: 50000,
        creatorAddress: STRATEGY.creator,
        enclaveVendor: 'INTEL_SGX',
      });

      expect(signal.signalId.startsWith('0xsignal_')).toBe(true);
      expect(signal.strategyId).toBe(STRATEGY.id);
      expect(signal.status).toBe('ACTIVE');
      expect(signal.commitmentHash.startsWith('0xalpha_signal_')).toBe(true);
      expect(signal.attestationQuote.startsWith('0xtee_quote_intel_sgx_')).toBe(true);

      const allSignals = getAllEnclaveSignals();
      expect(allSignals.length).toBe(1);
      expect(allSignals[0].signalId).toBe(signal.signalId);
    });

    it('rejects signal emission if caller is not the registered strategy creator', async () => {
      await expect(
        emitConfidentialTradeSignal({
          strategyId: STRATEGY.id,
          assetSymbol: 'ETH',
          direction: 'SHORT',
          entryPriceUsd: 3500,
          targetPriceUsd: 3200,
          stopLossPriceUsd: 3700,
          masterPositionNotionalUsd: 20000,
          creatorAddress: '0xunauthorized_impostor',
        })
      ).rejects.toThrow(/Unauthorized: Caller is not the registered creator/);
    });
  });

  describe('4. Proportional Mirroring Execution & High-Water Mark Settlement', () => {
    it('mirrors an active confidential signal proportionally for a subscriber', async () => {
      // Subscribe follower to strategy
      const sub = await subscribeToAlphaStrategy(
        STRATEGY.id,
        FOLLOWER_1,
        5000,
        1500,
        4 // 4% personal stop loss
      );

      const signal = await emitConfidentialTradeSignal({
        strategyId: STRATEGY.id,
        assetSymbol: 'SOL',
        direction: 'LONG',
        entryPriceUsd: 150,
        targetPriceUsd: 180,
        stopLossPriceUsd: 135,
        masterPositionNotionalUsd: 25000,
        creatorAddress: STRATEGY.creator,
      });

      const mirrorExec = await executeProportionalMirrorTrade(signal.signalId, sub.subscriptionId);

      expect(mirrorExec.status).toBe('EXECUTED');
      expect(mirrorExec.strategyId).toBe(STRATEGY.id);
      expect(mirrorExec.followerAddress).toBe(FOLLOWER_1);
      expect(mirrorExec.proportionalSizeUsd).toBeGreaterThan(0);
      expect(mirrorExec.proportionalSizeUsd).toBeLessThanOrEqual(sub.maxTradeAllocationUsd);
      expect(mirrorExec.effectiveStopLossPriceUsd).toBe(144); // 150 * (1 - 0.04) = 144 > 135
      expect(mirrorExec.personalStopLossTriggered).toBe(true);

      const followerTrades = getMirroredTradesByFollower(FOLLOWER_1);
      expect(followerTrades.length).toBe(1);
    });

    it('prevents duplicate trade mirror execution on the same signal for the same subscriber', async () => {
      let sub = getAllSubscriptions().find((s) => s.followerAddress === FOLLOWER_1 && s.strategyId === STRATEGY.id && s.status === 'ACTIVE');
      if (!sub) {
        sub = await subscribeToAlphaStrategy(STRATEGY.id, FOLLOWER_1, 5000, 1500, 5);
      }

      const signal = await emitConfidentialTradeSignal({
        strategyId: STRATEGY.id,
        assetSymbol: 'BTC',
        direction: 'LONG',
        entryPriceUsd: 68000,
        targetPriceUsd: 74000,
        stopLossPriceUsd: 64000,
        masterPositionNotionalUsd: 30000,
        creatorAddress: STRATEGY.creator,
      });

      // First execution succeeds
      await executeProportionalMirrorTrade(signal.signalId, sub.subscriptionId);

      // Duplicate execution on same signal must throw
      await expect(
        executeProportionalMirrorTrade(signal.signalId, sub.subscriptionId)
      ).rejects.toThrow(/already been mirrored/);
    });

    it('resolves trade in profit, triggering High-Water Mark fee split and crediting shielded vault', async () => {
      let sub = getAllSubscriptions().find((s) => s.followerAddress === FOLLOWER_1 && s.strategyId === STRATEGY.id && s.status === 'ACTIVE');
      if (!sub) {
        sub = await subscribeToAlphaStrategy(STRATEGY.id, FOLLOWER_1, 5000, 1500, 5);
      }
      const initialVault = getLocalVaultBalance();

      const signal = await emitConfidentialTradeSignal({
        strategyId: STRATEGY.id,
        assetSymbol: 'SOL',
        direction: 'LONG',
        entryPriceUsd: 150,
        targetPriceUsd: 180,
        stopLossPriceUsd: 135,
        masterPositionNotionalUsd: 25000,
        creatorAddress: STRATEGY.creator,
      });

      await executeProportionalMirrorTrade(signal.signalId, sub.subscriptionId);

      // Exit at $165 (+10% gain)
      const { resolvedExecutions } = resolveConfidentialTrade(signal.signalId, 165);

      expect(resolvedExecutions.length).toBe(1);
      const exec = resolvedExecutions[0];
      expect(exec.status).toBe('CLOSED_PROFIT');
      expect(exec.followerPnlUsd).toBeGreaterThan(0);
      expect(exec.performanceFeeDeductedUsd).toBeGreaterThan(0);
      expect(exec.netProfitUsd).toBeGreaterThan(0);

      // Vault should have received net profit
      expect(getLocalVaultBalance()).toBeGreaterThan(initialVault);
    });

    it('triggers personal stop loss early when market moves against follower, protecting vault', async () => {
      // Create new signal
      const signal = await emitConfidentialTradeSignal({
        strategyId: STRATEGY.id,
        assetSymbol: 'ADA',
        direction: 'LONG',
        entryPriceUsd: 1.00,
        targetPriceUsd: 1.30,
        stopLossPriceUsd: 0.80, // Master SL is -20%
        masterPositionNotionalUsd: 10000,
        creatorAddress: STRATEGY.creator,
      });

      let sub = getAllSubscriptions().find((s) => s.followerAddress === FOLLOWER_1 && s.strategyId === STRATEGY.id && s.status === 'ACTIVE');
      if (!sub) {
        sub = await subscribeToAlphaStrategy(STRATEGY.id, FOLLOWER_1, 5000, 1500, 4);
      }

      await executeProportionalMirrorTrade(signal.signalId, sub.subscriptionId);

      // Market drops to $0.75 (below both master SL and personal SL)
      // Follower had 4% personal SL -> should exit at $0.96 (NOT $0.75 or $0.80)
      const { resolvedExecutions } = resolveConfidentialTrade(signal.signalId, 0.75);
      const exec = resolvedExecutions[0];

      expect(exec.status).toBe('STOPPED_OUT');
      expect(exec.personalStopLossTriggered).toBe(true);
      expect(exec.exitPriceUsd).toBe(0.96);
      expect(exec.followerPnlUsd).toBeCloseTo(-exec.proportionalSizeUsd * 0.04, 1);
    });

    it('executes batch mirroring across all active followers of a strategy', async () => {
      let sub1 = getAllSubscriptions().find((s) => s.followerAddress === FOLLOWER_1 && s.strategyId === STRATEGY.id && s.status === 'ACTIVE');
      if (!sub1) {
        await subscribeToAlphaStrategy(STRATEGY.id, FOLLOWER_1, 5000, 1500, 4);
      }

      // Add second subscriber
      const sub2 = await subscribeToAlphaStrategy(
        STRATEGY.id,
        FOLLOWER_2,
        3000,
        1000,
        5
      );

      const signal = await emitConfidentialTradeSignal({
        strategyId: STRATEGY.id,
        assetSymbol: 'ETH',
        direction: 'LONG',
        entryPriceUsd: 3000,
        targetPriceUsd: 3500,
        stopLossPriceUsd: 2800,
        masterPositionNotionalUsd: 20000,
        creatorAddress: STRATEGY.creator,
      });

      const batchResult = await executeBatchProportionalMirroring(signal.signalId);

      expect(batchResult.totalFollowers).toBeGreaterThanOrEqual(2);
      expect(batchResult.executedCount).toBeGreaterThanOrEqual(2);
      expect(batchResult.totalVolumeMirroredUsd).toBeGreaterThan(0);
      expect(batchResult.executions.every((e) => e.status === 'EXECUTED')).toBe(true);
    });
  });
});
