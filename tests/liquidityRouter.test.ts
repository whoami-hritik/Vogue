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
  clearDarkIntents,
  runSolverRFQMarket,
  generateCrossChainStateProof,
  verifyCrossChainStateProof,
  registerSolverBondStake,
  slashDelinquentSolver,
  getBondedSolver,
  DarkIntent,
  ExternalExecutionReceipt,
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
    expect(REGISTERED_BONDED_SOLVERS.length).toBeGreaterThanOrEqual(5);

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

  it('6. Solana Venue Routing & Slippage: validates Jupiter CLMM routing with sub-second latency', () => {
    const solanaVenue = LIQUIDITY_VENUES.jupiter_solana;
    expect(solanaVenue).toBeDefined();
    expect(solanaVenue.chain).toBe('Solana');
    expect(solanaVenue.avgLatencyMs).toBeLessThanOrEqual(150); // Sub-second 120ms
    expect(solanaVenue.supportedAssets).toContain('SOL');
    expect(solanaVenue.supportedAssets).toContain('JUP');

    const solSlip = calculateVenueSlippage('jupiter_solana', 50000, 'SOL');
    expect(solSlip).toBeLessThan(0.1); // <0.1% slippage on $50k

    const solQuotes = compareExecutionRoutes('SOL', 50000, 145.5);
    expect(solQuotes.routes.some((r) => r.venue.id === 'jupiter_solana')).toBe(true);
  });

  it('7. Multi-Solver RFQ Auction: generates competitive bids and selects winning solver with optimal price improvement', () => {
    const mockIntent: DarkIntent = {
      intentId: '0xintent_rfq_test',
      agentId: '0xagent_rfq',
      asset: 'SOL',
      direction: 'BUY',
      escrowAmountUsd: 25000,
      maxPriceLimitUsd: 150.0,
      minFillUnits: 166.6,
      expiryTimestamp: Math.floor(Date.now() / 1000) + 1800,
      createdAt: new Date().toISOString(),
      venueId: 'jupiter_solana',
      status: 'COMMITTED',
      privacyMetrics: {
        anonymityScore: 99.7,
        externalIdentityExposed: false,
        strategyParametersHidden: true,
        mevProtection: '100%_SHIELDED',
      },
    };

    const marketPrice = 145.0;
    const { bids, winningBid } = runSolverRFQMarket(mockIntent, marketPrice);

    expect(bids.length).toBeGreaterThanOrEqual(1);
    expect(winningBid).toBeDefined();
    expect(winningBid.isWinningBid).toBe(true);
    // For BUY: winning bid price must be at or below market price (price improvement)
    expect(winningBid.bidPriceUsd).toBeLessThanOrEqual(marketPrice);
    expect(winningBid.priceImprovementBps).toBeGreaterThan(0);
    expect(winningBid.bondedCollateralUsd).toBeGreaterThanOrEqual(250000);
  });

  it('8. Cross-Chain State Proof Generation: constructs verifiable proof across Solana, Cardano, Hyperliquid', () => {
    const mockIntent: DarkIntent = {
      intentId: '0xintent_proof_gen',
      agentId: '0xagent_proof',
      asset: 'SOL',
      direction: 'BUY',
      escrowAmountUsd: 50000,
      maxPriceLimitUsd: 150.0,
      minFillUnits: 333.3,
      expiryTimestamp: Math.floor(Date.now() / 1000) + 1800,
      createdAt: new Date().toISOString(),
      venueId: 'jupiter_solana',
      status: 'SOLVER_BIDDING',
      privacyMetrics: {
        anonymityScore: 99.7,
        externalIdentityExposed: false,
        strategyParametersHidden: true,
        mevProtection: '100%_SHIELDED',
      },
    };

    const mockReceipt: ExternalExecutionReceipt = {
      venueId: 'jupiter_solana',
      venueName: 'Jupiter / Raydium CLMM (Solana)',
      externalTxHash: generateExternalTxHash('jupiter_solana'),
      blockNumber: 289410294,
      actualFillPrice: 146.5,
      fillUnits: 341.29,
      slippagePct: 0.04,
      fillTimeMs: 120,
      oracleAttestation: '0xattestation_pyth_sol_146_5',
      cryptographicProofHash: '0xproof_hash_sol_001',
      chainExplorerUrl: 'https://solscan.io/tx/0xmock',
    };

    const proof = generateCrossChainStateProof(mockReceipt, mockIntent);
    expect(proof.venueId).toBe('jupiter_solana');
    expect(proof.chainName).toBe('Solana');
    expect(proof.merkleRoot.startsWith('0xmerkle_root_')).toBe(true);
    expect(proof.stateProofHash.startsWith('0xstate_proof_')).toBe(true);
    expect(proof.zkConstraintVerified).toBe(true); // 146.5 <= 150.0
    expect(proof.oracleAttestation.oracle).toBe('Pyth');
  });

  it('9. Cross-Chain State Proof Verification: validates valid proof within trader limit price', () => {
    const mockIntent: DarkIntent = {
      intentId: '0xintent_verify_ok',
      agentId: '0xagent_ok',
      asset: 'ADA',
      direction: 'BUY',
      escrowAmountUsd: 10000,
      maxPriceLimitUsd: 0.85,
      minFillUnits: 11764,
      expiryTimestamp: Math.floor(Date.now() / 1000) + 1800,
      createdAt: new Date().toISOString(),
      venueId: 'minswap',
      status: 'SOLVER_BIDDING',
      privacyMetrics: {
        anonymityScore: 98.8,
        externalIdentityExposed: false,
        strategyParametersHidden: true,
        mevProtection: '100%_SHIELDED',
      },
    };

    const mockReceipt: ExternalExecutionReceipt = {
      venueId: 'minswap',
      venueName: 'Minswap eUTxO DEX',
      externalTxHash: generateExternalTxHash('minswap'),
      blockNumber: 9410294,
      actualFillPrice: 0.82, // <= 0.85 limit price
      fillUnits: 12195,
      slippagePct: 0.12,
      fillTimeMs: 950,
      oracleAttestation: '0xattestation_pyth_ada_0_82',
      cryptographicProofHash: '0xproof_ada_002',
      chainExplorerUrl: 'https://cardanoscan.io/transaction/0xmock',
    };

    const proof = generateCrossChainStateProof(mockReceipt, mockIntent);
    const verification = verifyCrossChainStateProof(proof, mockIntent);

    expect(verification.verified).toBe(true);
    expect(verification.reason).toBeUndefined();
  });

  it('10. Cross-Chain State Proof Rejection: rejects proof when external price breaches limit price', () => {
    const mockIntent: DarkIntent = {
      intentId: '0xintent_breach',
      agentId: '0xagent_breach',
      asset: 'ADA',
      direction: 'BUY',
      escrowAmountUsd: 10000,
      maxPriceLimitUsd: 0.80, // Limit price is $0.80
      minFillUnits: 12500,
      expiryTimestamp: Math.floor(Date.now() / 1000) + 1800,
      createdAt: new Date().toISOString(),
      venueId: 'minswap',
      status: 'SOLVER_BIDDING',
      privacyMetrics: {
        anonymityScore: 98.8,
        externalIdentityExposed: false,
        strategyParametersHidden: true,
        mevProtection: '100%_SHIELDED',
      },
    };

    const badReceipt: ExternalExecutionReceipt = {
      venueId: 'minswap',
      venueName: 'Minswap eUTxO DEX',
      externalTxHash: generateExternalTxHash('minswap'),
      blockNumber: 9410300,
      actualFillPrice: 0.84, // Breaches $0.80 limit price
      fillUnits: 11904,
      slippagePct: 0.25,
      fillTimeMs: 980,
      oracleAttestation: '0xattestation_pyth_ada_0_84',
      cryptographicProofHash: '0xproof_ada_bad',
      chainExplorerUrl: 'https://cardanoscan.io/transaction/0xbad',
    };

    const badProof = generateCrossChainStateProof(badReceipt, mockIntent);
    expect(badProof.zkConstraintVerified).toBe(false);

    const verification = verifyCrossChainStateProof(badProof, mockIntent);
    expect(verification.verified).toBe(false);
    expect(verification.reason).toContain('fill price exceeded max price limit');
  });

  it('11. Bonded Solver Staking: tops up solver collateral and verifies active capital bounds', () => {
    const solverId = '0xsolver_solana_jupiter';
    const initialSolver = getBondedSolver(solverId);
    expect(initialSolver).toBeDefined();

    const previousBond = initialSolver!.bondedCollateralUsd;
    const updated = registerSolverBondStake(solverId, 100000); // Add $100,000 bond

    expect(updated.bondedCollateralUsd).toBe(previousBond + 100000);
    expect(getBondedSolver(solverId)?.bondedCollateralUsd).toBe(previousBond + 100000);

    // Reject negative bond addition
    expect(() => registerSolverBondStake(solverId, -5000)).toThrow('Bond addition must be positive');
  });

  it('12. Delinquent Solver Slashing: penalizes solver collateral upon SLA breach and logs violation', () => {
    const solverId = '0xsolver_minswap_cardano';
    const solver = getBondedSolver(solverId);
    expect(solver).toBeDefined();

    const initialBond = solver!.bondedCollateralUsd;
    const penaltyUsd = 25000;

    const slashResult = slashDelinquentSolver(
      solverId,
      '0xintent_timeout_991',
      penaltyUsd,
      'Failure to deliver external fill within 1800s SLA window'
    );

    expect(slashResult.slashedAmount).toBe(penaltyUsd);
    expect(slashResult.remainingBond).toBe(initialBond - penaltyUsd);
    expect(solver!.bondedCollateralUsd).toBe(initialBond - penaltyUsd);
    expect(slashResult.slashLog).toContain('slashed by $25,000 USD');

    // Reject penalty exceeding active bond
    expect(() =>
      slashDelinquentSolver(solverId, '0xintent_overkill', 10_000_000, 'Overkill penalty')
    ).toThrow('Penalty exceeds solver active bonded collateral');
  });
});
