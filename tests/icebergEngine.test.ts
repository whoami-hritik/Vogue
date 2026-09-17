import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateTemporalSchedule,
  createIcebergOrder,
  dispatchIcebergSlice,
  cancelIcebergOrder,
  getAllIcebergOrders,
  getIcebergOrderById,
  getIcebergOrdersByTrader,
  resetIcebergStateForTesting,
} from '../src/lib/iceberg-engine';
import { setLocalVaultBalance, getLocalVaultBalance } from '../src/lib/vault';

describe('Vogue ZK-Iceberg & Temporal Shuffling (Anti-MEV TWAP) Engine Suite', () => {
  const TRADER = '0xinstitutional_fund_brevan_howard';

  beforeEach(() => {
    resetIcebergStateForTesting();
    // Seed vault balance with $500,000 vUSD
    setLocalVaultBalance(500000);
  });

  describe('1. Temporal Shuffling Mathematics & Capital Invariants', () => {
    it('guarantees exact penny-for-penny capital conservation across randomized slice distributions', () => {
      const totalAmount = 100000;
      const sliceCount = 12;

      const slices = generateTemporalSchedule('0xtest_order_1', {
        totalAmount,
        sliceCount,
        horizonHours: 24,
        timeVariancePct: 35,
        sizeVariancePct: 25,
      });

      expect(slices.length).toBe(sliceCount);

      const totalPlanned = slices.reduce((sum, s) => sum + s.plannedNotionalUsd, 0);
      expect(Number(totalPlanned.toFixed(2))).toBe(totalAmount);
    });

    it('verifies non-zero interval variance proving non-periodicity to break MEV autocorrelation', () => {
      const sliceCount = 10;
      const slices = generateTemporalSchedule('0xtest_order_2', {
        totalAmount: 50000,
        sliceCount,
        horizonHours: 10,
        timeVariancePct: 40,
        sizeVariancePct: 20,
      });

      const intervals = slices.map((s) => s.delayIntervalSeconds);

      // Verify not all intervals are identical (standard deviation > 0)
      const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const variance = intervals.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / intervals.length;
      const stdDev = Math.sqrt(variance);

      expect(stdDev).toBeGreaterThan(0);
    });
  });

  describe('2. Order Creation & Vault Escrow Lifecycle', () => {
    it('creates active iceberg order and deducts escrowed collateral from shielded vault', async () => {
      const initialVault = getLocalVaultBalance();
      const orderAmount = 75000;

      const order = await createIcebergOrder({
        traderAddress: TRADER,
        assetSymbol: 'BTC',
        totalNotionalUsd: orderAmount,
        timeHorizonHours: 24,
        sliceCount: 5,
        maxPriceLimitUsd: 70000,
      });

      expect(order.orderId.startsWith('0xiceberg_btc_')).toBe(true);
      expect(order.status).toBe('ACTIVE');
      expect(order.totalNotionalUsd).toBe(orderAmount);
      expect(order.filledNotionalUsd).toBe(0);
      expect(order.remainingNotionalUsd).toBe(orderAmount);
      expect(order.slices.length).toBe(5);

      // Collateral deducted from vault
      expect(getLocalVaultBalance()).toBe(initialVault - orderAmount);

      // Order queryable in registry
      const stored = getIcebergOrderById(order.orderId);
      expect(stored).toBeDefined();
      expect(stored?.orderId).toBe(order.orderId);

      const byTrader = getIcebergOrdersByTrader(TRADER);
      expect(byTrader.length).toBe(1);
    });

    it('rejects order creation if shielded vault balance is insufficient', async () => {
      const excessiveAmount = 1000000; // $1,000,000 > $500,000 vault balance

      await expect(
        createIcebergOrder({
          traderAddress: TRADER,
          assetSymbol: 'ETH',
          totalNotionalUsd: excessiveAmount,
          timeHorizonHours: 48,
          maxPriceLimitUsd: 3500,
        })
      ).rejects.toThrow(/Insufficient Shielded Vault Balance/);
    });
  });

  describe('3. Micro-Slice Dispatch & Progressive Anti-MEV Settlement', () => {
    it('dispatches sequential micro-slices, progressively tracking filled notional and VWAP', async () => {
      const order = await createIcebergOrder({
        traderAddress: TRADER,
        assetSymbol: 'SOL',
        totalNotionalUsd: 30000,
        timeHorizonHours: 6,
        sliceCount: 3,
        maxPriceLimitUsd: 160,
      });

      // Dispatch slice 0 at $145
      const res1 = await dispatchIcebergSlice(order.orderId, 145);
      expect(res1.slice.status).toBe('FILLED');
      expect(res1.slice.fillPriceUsd).toBe(145);
      expect(res1.isOrderCompleted).toBe(false);
      expect(res1.order.filledNotionalUsd).toBeGreaterThan(0);
      expect(res1.order.averageExecutedVwapUsd).toBe(145);
      expect(res1.mevSavedUsd).toBeGreaterThan(0);

      // Dispatch slice 1 at $150
      const res2 = await dispatchIcebergSlice(order.orderId, 150);
      expect(res2.slice.status).toBe('FILLED');
      expect(res2.isOrderCompleted).toBe(false);
      // VWAP should be between $145 and $150
      expect(res2.order.averageExecutedVwapUsd).toBeGreaterThanOrEqual(145);
      expect(res2.order.averageExecutedVwapUsd).toBeLessThanOrEqual(150);

      // Dispatch final slice 2 at $148 -> Should complete order
      const res3 = await dispatchIcebergSlice(order.orderId, 148);
      expect(res3.slice.status).toBe('FILLED');
      expect(res3.isOrderCompleted).toBe(true);
      expect(res3.order.status).toBe('COMPLETED');
      expect(res3.order.remainingNotionalUsd).toBe(0);
    });

    it('enforces dip-buying guard: delays/rejects slice when market price exceeds max limit price', async () => {
      const order = await createIcebergOrder({
        traderAddress: TRADER,
        assetSymbol: 'ADA',
        totalNotionalUsd: 20000,
        timeHorizonHours: 12,
        sliceCount: 4,
        maxPriceLimitUsd: 0.95,
        dipBuyerActive: true,
      });

      // Current price is $1.05 > $0.95 max limit price
      await expect(
        dispatchIcebergSlice(order.orderId, 1.05)
      ).rejects.toThrow(/Dip-Buyer Guard Triggered/);

      // Order should remain active with 0 fills
      const freshOrder = getIcebergOrderById(order.orderId);
      expect(freshOrder?.filledNotionalUsd).toBe(0);
      expect(freshOrder?.slices[0].status).toBe('PENDING');
    });
  });

  describe('4. Order Cancellation & Unspent Collateral Refunds', () => {
    it('cancels active order, cancels pending slices, and refunds unspent collateral to shielded vault', async () => {
      const initialVault = getLocalVaultBalance();
      const orderAmount = 60000;

      const order = await createIcebergOrder({
        traderAddress: TRADER,
        assetSymbol: 'BTC',
        totalNotionalUsd: orderAmount,
        timeHorizonHours: 24,
        sliceCount: 3,
        maxPriceLimitUsd: 70000,
      });

      const vaultAfterCreation = getLocalVaultBalance();
      expect(vaultAfterCreation).toBe(initialVault - orderAmount);

      // Dispatch first slice only
      const res = await dispatchIcebergSlice(order.orderId, 68000);
      const filledAmount = res.slice.filledNotionalUsd;

      // Cancel order before remaining slices execute
      const cancelResult = await cancelIcebergOrder(order.orderId);
      expect(cancelResult.order.status).toBe('CANCELLED');
      expect(cancelResult.refundedAmountUsd).toBe(orderAmount - filledAmount);

      // Verify unspent collateral was refunded back to shielded vault
      expect(getLocalVaultBalance()).toBe(vaultAfterCreation + cancelResult.refundedAmountUsd);

      // Remaining slices should be marked CANCELLED
      const fresh = getIcebergOrderById(order.orderId);
      const remainingSlices = fresh?.slices.slice(1);
      expect(remainingSlices?.every((s) => s.status === 'CANCELLED')).toBe(true);
    });

    it('rejects slice dispatch attempts on cancelled orders', async () => {
      const order = await createIcebergOrder({
        traderAddress: TRADER,
        assetSymbol: 'ETH',
        totalNotionalUsd: 25000,
        timeHorizonHours: 12,
        sliceCount: 3,
        maxPriceLimitUsd: 3500,
      });

      await cancelIcebergOrder(order.orderId);

      await expect(
        dispatchIcebergSlice(order.orderId, 3400)
      ).rejects.toThrow(/not active/);
    });
  });
});
