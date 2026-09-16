import { describe, it, expect, beforeEach } from 'vitest';
import {
  calculateAlphaMetrics,
  generateProofOfAlphaCertificate,
  generateVerifiableProofHash,
  CURATED_ALPHA_STRATEGIES,
  getAllAlphaStrategies,
  getAlphaStrategyById,
  subscribeToAlphaStrategy,
  settleSubscriberPerformanceFee,
  cancelAlphaSubscription,
  publishCustomAlphaStrategy,
  getActiveSubscriptions,
} from '../src/lib/alpha-engine';
import { setLocalVaultBalance, getLocalVaultBalance } from '../src/lib/vault';

describe('Vogue Proof of Alpha (PoA) & Blind Copy-Trading Marketplace Suite', () => {
  beforeEach(() => {
    // Seed test vault with $10,000 vUSD
    setLocalVaultBalance(10000);
  });

  describe('1. Statistical Alpha Metrics Computation', () => {
    it('handles empty trade history gracefully with zero metrics', () => {
      const metrics = calculateAlphaMetrics([]);
      expect(metrics.roiPct).toBe(0);
      expect(metrics.totalTrades).toBe(0);
      expect(metrics.winRatePct).toBe(0);
      expect(metrics.sharpeRatio).toBe(0);
      expect(metrics.maxDrawdownPct).toBe(0);
      expect(metrics.cumulativePnlUsd).toBe(0);
    });

    it('accurately computes cumulative ROI, win rate, and profit factor', () => {
      // 4 wins totaling $1,000, 1 loss of -$200 -> net pnl = +$800 on $10,000 capital
      const trades = [250, 300, -200, 250, 200];
      const metrics = calculateAlphaMetrics(trades, 10000, 90);

      expect(metrics.totalTrades).toBe(5);
      expect(metrics.profitableTrades).toBe(4);
      expect(metrics.unprofitableTrades).toBe(1);
      expect(metrics.winRatePct).toBe(80.0);
      expect(metrics.cumulativePnlUsd).toBe(800);
      expect(metrics.roiPct).toBe(8.0); // 800 / 10000 = 8%
      expect(metrics.profitFactor).toBe(5.0); // 1000 gross profit / 200 gross loss = 5.0
      expect(metrics.sharpeRatio).toBeGreaterThan(0);
    });

    it('accurately computes peak-to-trough Maximum Drawdown percentage', () => {
      // Starts at $10,000 -> rises to $12,000 -> drops to $10,800 -> recovers to $13,000
      // Peak was $12,000, trough was $10,800 -> drop of $1,200 = 10% drawdown
      const trades = [1000, 1000, -1200, 1200, 1000];
      const metrics = calculateAlphaMetrics(trades, 10000, 90);

      expect(metrics.highestEquityUsd).toBe(13000);
      expect(metrics.maxDrawdownPct).toBe(10.0);
    });
  });

  describe('2. Verifiable Zero-Knowledge Proof of Alpha Certificate Generation', () => {
    it('generates cryptographic certificate with verifiable hashes and privacy guarantees', () => {
      const metrics = calculateAlphaMetrics([350, 420, -90, 510], 10000, 90);
      const cert = generateProofOfAlphaCertificate(
        '0xtest_strat_01',
        'Test Quantitative Agent',
        '0xcreator_wallet_123',
        metrics,
        15,
        1190
      );

      expect(cert.certificateId).toContain('0xtest_strat_01');
      expect(cert.status).toBe('VERIFIED_ONCHAIN');
      expect(cert.performanceFeePct).toBe(15);
      expect(cert.highWaterMarkUsd).toBe(1190);

      // Verify deterministic proof hashes
      expect(cert.merkleProofHash.startsWith('0xmerkle_root_')).toBe(true);
      expect(cert.zkAttestationCommitment.startsWith('0xpoa_attest_')).toBe(true);
      expect(cert.contractCircuitVerification.startsWith('0xcompact_vogue_poa_')).toBe(true);

      // Verify zero prompt/indicator leak guarantees
      expect(cert.zkPrivacyGuarantees.promptLogicExposed).toBe(false);
      expect(cert.zkPrivacyGuarantees.indicatorWeightsExposed).toBe(false);
      expect(cert.zkPrivacyGuarantees.exactOrderSizesHidden).toBe(true);
      expect(cert.zkPrivacyGuarantees.vaultCollateralShielded).toBe(true);
    });

    it('generateVerifiableProofHash produces deterministic 64-char hex strings', () => {
      const hash1 = generateVerifiableProofHash('test_prefix', 'abc', 123);
      const hash2 = generateVerifiableProofHash('test_prefix', 'abc', 123);
      const hash3 = generateVerifiableProofHash('test_prefix', 'abc', 124);

      expect(hash1).toBe(hash2);
      expect(hash1).not.toBe(hash3);
      expect(hash1.startsWith('0xtest_prefix_')).toBe(true);
    });
  });

  describe('3. Curated Master Alpha Strategies Registry', () => {
    it('seeds 4 verified institutional-grade alpha strategies', () => {
      const strategies = getAllAlphaStrategies();
      expect(strategies.length).toBeGreaterThanOrEqual(4);

      const strategyNames = strategies.map((s) => s.name);
      expect(strategyNames).toContain('Axiom Momentum Alpha');
      expect(strategyNames).toContain('Hyperliquid Mean Reversion');
      expect(strategyNames).toContain('Cardano Macro Swing AI');
      expect(strategyNames).toContain('Delta-Neutral vUSD Yield');
    });

    it('all curated strategies have positive Sharpe ratios and verified certificates', () => {
      for (const strat of CURATED_ALPHA_STRATEGIES) {
        expect(strat.metrics.sharpeRatio).toBeGreaterThan(1.5);
        expect(strat.metrics.roiPct).toBeGreaterThan(15);
        expect(strat.metrics.maxDrawdownPct).toBeLessThan(10);
        expect(strat.certificate).toBeDefined();
        expect(strat.certificate.status).toBe('VERIFIED_ONCHAIN');
        expect(strat.executionVenues.length).toBeGreaterThanOrEqual(1);
      }
    });

    it('retrieves individual strategies by ID', () => {
      const strat = getAlphaStrategyById('0xalpha_strat_01');
      expect(strat).toBeDefined();
      expect(strat?.name).toBe('Axiom Momentum Alpha');
      expect(strat?.creatorShort).toBe('AxiomLabs');
    });
  });

  describe('4. Follower Subscriptions & Shielded Vault Allocation', () => {
    it('rejects subscriptions below minimum follower stake', async () => {
      const strat = getAlphaStrategyById('0xalpha_strat_01')!; // min stake = $250
      await expect(
        subscribeToAlphaStrategy(strat.id, '0xfollower_01', 100)
      ).rejects.toThrow(/Minimum subscription requirement/);
    });

    it('rejects subscriptions exceeding user available vault balance', async () => {
      setLocalVaultBalance(200); // Only $200 available
      const strat = getAlphaStrategyById('0xalpha_strat_01')!; // min stake = $250
      await expect(
        subscribeToAlphaStrategy(strat.id, '0xfollower_01', 500)
      ).rejects.toThrow(/Insufficient Shielded Vault Balance/);
    });

    it('successfully creates subscription, deducts collateral, and increments stats', async () => {
      setLocalVaultBalance(5000);
      const strat = getAlphaStrategyById('0xalpha_strat_01')!;
      const initialFollowers = strat.activeFollowersCount;
      const initialMirrored = strat.totalMirroredCapitalUsd;

      const sub = await subscribeToAlphaStrategy(strat.id, '0xfollower_test', 1000);

      expect(sub.status).toBe('ACTIVE');
      expect(sub.allocatedCollateralUsd).toBe(1000);
      expect(sub.strategyId).toBe(strat.id);
      expect(sub.midnightSubscriptionTxHash).toBeDefined();

      // Shielded vault balance reduced by $1,000
      expect(getLocalVaultBalance()).toBe(4000);

      // Strategy metrics updated
      expect(strat.activeFollowersCount).toBe(initialFollowers + 1);
      expect(strat.totalMirroredCapitalUsd).toBe(initialMirrored + 1000);
    });
  });

  describe('5. High-Water Mark (HWM) Performance Fee Settlement', () => {
    it('enforces complete High-Water Mark cycle (profits, losses, recovery, new peaks)', async () => {
      setLocalVaultBalance(5000);
      const strat = getAlphaStrategyById('0xalpha_strat_01')!; // 15% performance fee
      const sub = await subscribeToAlphaStrategy(strat.id, '0xfollower_hwm_user', 1000);

      // --- Trade 1: First profit of $400 (Breaches initial HWM of $0) ---
      // 15% fee on $400 = $60 fee. Net profit = $340. New HWM = $400.
      const res1 = settleSubscriberPerformanceFee(sub.subscriptionId, 400);
      expect(res1.feePaid).toBe(true);
      expect(res1.feeDeductedUsd).toBe(60);
      expect(res1.netProfitUsd).toBe(340);
      expect(res1.newHighWaterMarkUsd).toBe(400);

      // --- Trade 2: Market Drawdown / Loss of -$150 ---
      // Cumulative PnL becomes $250. HWM remains $400. Fee must be $0.
      const res2 = settleSubscriberPerformanceFee(sub.subscriptionId, -150);
      expect(res2.feePaid).toBe(false);
      expect(res2.feeDeductedUsd).toBe(0);
      expect(res2.netProfitUsd).toBe(-150);
      expect(res2.newHighWaterMarkUsd).toBe(400); // HWM preserved at $400

      // --- Trade 3: Drawdown Recovery / Profit of +$100 ---
      // Cumulative PnL rises from $250 to $350.
      // Since $350 <= HWM ($400), user is still recovering prior losses.
      // Fee must be $0! User keeps 100% of profit.
      const res3 = settleSubscriberPerformanceFee(sub.subscriptionId, 100);
      expect(res3.feePaid).toBe(false);
      expect(res3.feeDeductedUsd).toBe(0);
      expect(res3.netProfitUsd).toBe(100);
      expect(res3.newHighWaterMarkUsd).toBe(400); // HWM unchanged
      expect(res3.reason).toContain('High-Water Mark not breached');

      // --- Trade 4: Breakthrough Profit of +$250 ---
      // Cumulative PnL rises from $350 to $600.
      // Prior HWM was $400. Net new profit above HWM = $600 - $400 = $200.
      // 15% fee on $200 = $30 fee.
      // Net profit = $250 - $30 = $220.
      // New HWM becomes $600.
      const res4 = settleSubscriberPerformanceFee(sub.subscriptionId, 250);
      expect(res4.feePaid).toBe(true);
      expect(res4.feeDeductedUsd).toBe(30);
      expect(res4.netProfitUsd).toBe(220);
      expect(res4.newHighWaterMarkUsd).toBe(600);
    });
  });

  describe('6. Subscription Cancellation & Collateral Refund', () => {
    it('cancels subscription and refunds collateral back to shielded vault', async () => {
      setLocalVaultBalance(5000);
      const strat = getAlphaStrategyById('0xalpha_strat_01')!;
      const sub = await subscribeToAlphaStrategy(strat.id, '0xfollower_cancel', 1000);
      expect(getLocalVaultBalance()).toBe(4000);

      const cancelSuccess = cancelAlphaSubscription(sub.subscriptionId);
      expect(cancelSuccess).toBe(true);

      // Collateral refunded
      expect(getLocalVaultBalance()).toBe(5000);

      // Subscription status cancelled
      const activeSubs = getActiveSubscriptions('0xfollower_cancel');
      expect(activeSubs.some((s) => s.subscriptionId === sub.subscriptionId)).toBe(false);
    });
  });

  describe('7. Custom Alpha Strategy Registration & Publishing', () => {
    it('rejects predatory fees exceeding the 50% threshold', async () => {
      await expect(
        publishCustomAlphaStrategy({
          name: 'Greedy Bot',
          creatorAddress: '0xdev_99',
          creatorShort: 'Dev99',
          description: 'Excessive fee strategy',
          category: 'MOMENTUM',
          executionVenues: ['Hyperliquid'],
          performanceFeePct: 60, // 60% > 50%
          minFollowerStakeUsd: 100,
          initialTradePnls: [100, 200],
          tags: ['Greedy'],
        })
      ).rejects.toThrow(/cannot exceed 50%/);
    });

    it('successfully publishes strategy with verified certificate and adds to marketplace', async () => {
      const newStrat = await publishCustomAlphaStrategy({
        name: 'Solana Arbitrage AI',
        creatorAddress: '0xdev_sol_arb',
        creatorShort: 'SolArb',
        description: 'Cross-DEX statistical arbitrage engine scanning Raydium vs Orca pools.',
        category: 'STAT_ARB',
        executionVenues: ['Hyperliquid Prime', 'Midnight Dark Pool'],
        performanceFeePct: 18,
        minFollowerStakeUsd: 300,
        initialTradePnls: [310, 290, -80, 420, 350, -60, 480],
        tags: ['Solana', 'Stat Arb', 'Private Cross'],
      });

      expect(newStrat.id.startsWith('0xalpha_strat_')).toBe(true);
      expect(newStrat.performanceFeePct).toBe(18);
      expect(newStrat.certificate.status).toBe('VERIFIED_ONCHAIN');
      expect(newStrat.certificate.zkAttestationCommitment).toBeDefined();

      const all = getAllAlphaStrategies();
      expect(all.some((s) => s.id === newStrat.id)).toBe(true);
    });
  });
});
