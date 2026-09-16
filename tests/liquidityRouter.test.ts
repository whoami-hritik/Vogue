import { describe, it, expect } from 'vitest';
import {
  compareExecutionRoutes,
  calculateIsolatedVaultSlippage,
  calculateVenueSlippage,
  LIQUIDITY_VENUES,
} from '../src/lib/liquidity-router';
import {
  REGISTERED_BONDED_SOLVERS,
  generateIntentId,
  generateExternalTxHash,
  addDarkIntent,
  getActiveDarkIntents,
  updateDarkIntent,
  DarkIntent,
} from '../src/lib/solver-network';

describe('Vogue Dark Intent Network (DIN) — Liquidity Router & Solver Suite', () => {
  it('1. calculateIsolatedVaultSlippage: demonstrates significant price impact scaling on isolated vaults', () => {
    const smallSlip = calculateIsolatedVaultSlippage(500);
    const midSlip = calculateIsolatedVaultSlippage(25000);
    const largeSlip = calculateIsolatedVaultSlippage(100000);

    expect(smallSlip).toBeGreaterThan(1.0);
    expect(midSlip).toBeGreaterThan(smallSlip);
    expect(largeSlip).toBeGreaterThan(midSlip);
    expect(largeSlip).toBeGreaterThanOrEqual(10.0);
  });

  it('2. calculateVenueSlippage: proves deep external venues (Hyperliquid, Uniswap) have minimal slippage', () => {
    const hlSlip = calculateVenueSlippage('hyperliquid', 50000, 'BTC');
    const uniSlip = calculateVenueSlippage('uniswap_v3', 50000, 'ETH');
    const darkpoolSlip = calculateVenueSlippage('midnight_darkpool', 50000, 'ADA');
    const isolatedSlip = calculateIsolatedVaultSlippage(50000);

    expect(hlSlip).toBeLessThan(0.1); // Hyperliquid perp book has <0.1% slippage for $50k
    expect(uniSlip).toBeLessThan(0.15);
    expect(darkpoolSlip).toBeLessThan(0.01); // P2P crossing has ~0% slippage
    expect(isolatedSlip).toBeGreaterThan(5.0); // Isolated vault suffers >5% slippage
  });

  it('3. compareExecutionRoutes: computes multi-venue quotes and highlights optimal route with slippage savings', () => {
    const amountUsd = 10000;
    const marketPriceUsd = 0.421; // ADA
    const result = compareExecutionRoutes('ADA', amountUsd, marketPriceUsd);

    expect(result.routes.length).toBeGreaterThan(0);
    expect(result.optimalRoute).toBeDefined();
    expect(result.optimalRoute.isOptimal).toBe(true);
    expect(result.totalSlippageSavedUsd).toBeGreaterThan(0);
    expect(result.isolatedVaultBaseline.slippagePct).toBeGreaterThan(result.optimalRoute.priceImpactPct);
  });

  it('4. Registered Bonded Solvers: verified collateralization & reputation proofs', () => {
    expect(REGISTERED_BONDED_SOLVERS.length).toBeGreaterThanOrEqual(4);

    for (const solver of REGISTERED_BONDED_SOLVERS) {
      expect(solver.bondedCollateralUsd).toBeGreaterThanOrEqual(250000);
      expect(solver.successRatePct).toBeGreaterThan(99.0);
      expect(solver.reputationProof.startsWith('0xzkproof_')).toBe(true);
    }
  });

  it('5. Dark Intent Lifecycle: creates, records, and tracks intent states', () => {
    const intentId = generateIntentId();
    expect(intentId.startsWith('0xintent_')).toBe(true);

    const mockIntent: DarkIntent = {
      intentId,
      agentId: '0xagent_unit_test',
      asset: 'ADA',
      direction: 'BUY',
      escrowAmountUsd: 5000,
      maxPriceLimitUsd: 0.45,
      minFillUnits: 11000,
      expiryTimestamp: Math.floor(Date.now() / 1000) + 1800,
      createdAt: new Date().toISOString(),
      venueId: 'hyperliquid',
      status: 'COMMITTED',
      privacyMetrics: {
        anonymityScore: 99.4,
        externalIdentityExposed: false,
        strategyParametersHidden: true,
        mevProtection: '100%_SHIELDED',
      },
    };

    addDarkIntent(mockIntent);
    const stored = getActiveDarkIntents().find((i) => i.intentId === intentId);
    expect(stored).toBeDefined();
    expect(stored?.status).toBe('COMMITTED');

    updateDarkIntent(intentId, { status: 'FILLED_EXTERNAL' });
    const updated = getActiveDarkIntents().find((i) => i.intentId === intentId);
    expect(updated?.status).toBe('FILLED_EXTERNAL');
  });
});
