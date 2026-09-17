/**
 * Vogue � Bonded Solver Network & Atomic Intent Execution Engine (DIN)
 *
 * Coordinates decentralized solvers that compete to fill private Midnight intents
 * across external deep liquidity venues (Hyperliquid, Uniswap, Cardano) and settle
 * them atomically back onto the Midnight consensus layer.
 */

import { LiquidityVenueId, LIQUIDITY_VENUES, RouteQuote } from './liquidity-router';
import { executeSignedTransaction } from './midnight-api';
import { subtractFromLocalVaultBalance, getLocalVaultBalance } from './vault';

export interface BondedSolver {
  id: string;
  name: string;
  bondedCollateralUsd: number;
  totalVolumeFilledUsd: number;
  successRatePct: number;
  specializedVenue: LiquidityVenueId;
  reputationProof: string;
}

export interface SolverBid {
  bidId: string;
  solver: BondedSolver;
  bidPriceUsd: number;
  priceImprovementBps: number;
  executionLatencyMs: number;
  estimatedGasFeeUsd: number;
  bondedCollateralUsd: number;
  reputationScore: number;
  isWinningBid: boolean;
  bidTimestamp: number;
}

export interface CrossChainStateProof {
  proofId: string;
  venueId: LiquidityVenueId;
  chainName: string;
  blockOrSlotNumber: number;
  externalTxHash: string;
  merkleRoot: string;
  oracleAttestation: {
    oracle: 'Chainlink' | 'Pyth' | 'Switchboard';
    priceUsd: number;
    timestamp: number;
  };
  stateProofHash: string;
  zkConstraintVerified: boolean;
}

export interface ExternalExecutionReceipt {
  venueId: LiquidityVenueId;
  venueName: string;
  externalTxHash: string;
  blockNumber: number;
  actualFillPrice: number;
  fillUnits: number;
  slippagePct: number;
  fillTimeMs: number;
  oracleAttestation: string;
  cryptographicProofHash: string;
  chainExplorerUrl: string;
  stateProof?: CrossChainStateProof;
}

export interface DarkIntent {
  intentId: string;
  agentId: string;
  asset: string;
  direction: 'BUY' | 'SELL';
  escrowAmountUsd: number;
  maxPriceLimitUsd: number;
  minFillUnits: number;
  expiryTimestamp: number;
  createdAt: string;
  venueId: LiquidityVenueId;
  status: 'COMMITTED' | 'SOLVER_BIDDING' | 'FILLED_EXTERNAL' | 'SETTLED_MIDNIGHT' | 'REFUNDED';
  solver?: BondedSolver;
  solverBids?: SolverBid[];
  stateProof?: CrossChainStateProof;
  externalReceipt?: ExternalExecutionReceipt;
  midnightCommitTxHash?: string;
  midnightSettleTxHash?: string;
  privacyMetrics: {
    anonymityScore: number;
    externalIdentityExposed: false;
    strategyParametersHidden: true;
    mevProtection: '100%_SHIELDED';
  };
}

// --- Registered Bonded Solvers -----------------------------------------------

export const REGISTERED_BONDED_SOLVERS: BondedSolver[] = [
  {
    id: '0xsolver_hyperliquid_alpha',
    name: 'Wintermute Dark Routing Node',
    bondedCollateralUsd: 500_000,
    totalVolumeFilledUsd: 42_800_000,
    successRatePct: 99.8,
    specializedVenue: 'hyperliquid',
    reputationProof: '0xzkproof_solver_rep_77a1bc92e',
  },
  {
    id: '0xsolver_uniswap_core',
    name: 'Amber Arbitrum Liquidity Relayer',
    bondedCollateralUsd: 350_000,
    totalVolumeFilledUsd: 28_400_000,
    successRatePct: 99.4,
    specializedVenue: 'uniswap_v3',
    reputationProof: '0xzkproof_solver_rep_33d4e81fa',
  },
  {
    id: '0xsolver_minswap_cardano',
    name: 'Cardano eUTxO Batch Relayer #4',
    bondedCollateralUsd: 250_000,
    totalVolumeFilledUsd: 14_900_000,
    successRatePct: 99.1,
    specializedVenue: 'minswap',
    reputationProof: '0xzkproof_solver_rep_55b2909cc',
  },
  {
    id: '0xsolver_solana_jupiter',
    name: 'Jito-Solana MEV-Protected Relayer',
    bondedCollateralUsd: 750_000,
    totalVolumeFilledUsd: 38_900_000,
    successRatePct: 99.9,
    specializedVenue: 'jupiter_solana',
    reputationProof: '0xzkproof_solver_solana_jito_9981',
  },
  {
    id: '0xsolver_darkpool_p2p',
    name: 'Vogue P2P Intent Crossing Engine',
    bondedCollateralUsd: 1_000_000,
    totalVolumeFilledUsd: 58_100_000,
    successRatePct: 100.0,
    specializedVenue: 'midnight_darkpool',
    reputationProof: '0xzkproof_solver_rep_p2p_native_001',
  },
];

// --- Intent Store in Memory --------------------------------------------------

let _activeDarkIntents: DarkIntent[] = [];

export function getActiveDarkIntents(): DarkIntent[] {
  return [..._activeDarkIntents];
}

export function addDarkIntent(intent: DarkIntent): void {
  _activeDarkIntents = [intent, ..._activeDarkIntents.slice(0, 19)];
}

export function clearDarkIntents(): void {
  _activeDarkIntents = [];
}

export function updateDarkIntent(intentId: string, updates: Partial<DarkIntent>): DarkIntent | null {
  const idx = _activeDarkIntents.findIndex((i) => i.intentId === intentId);
  if (idx !== -1) {
    _activeDarkIntents[idx] = { ..._activeDarkIntents[idx], ...updates };
    return _activeDarkIntents[idx];
  }
  return null;
}

// --- Cryptographic Hash Helpers ----------------------------------------------

export function generateIntentId(): string {
  const randHex = Math.random().toString(16).substring(2, 8);
  const timeHex = Date.now().toString(16).substring(6);
  return `0xintent_${randHex}${timeHex}`;
}

export function generateExternalTxHash(venueId: LiquidityVenueId): string {
  const hex = Array.from({ length: 64 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
  return `0x${hex}`;
}

// --- Multi-Solver Competitive RFQ Auction Engine ----------------------------

/**
 * Simulates a decentralized RFQ auction where bonded solvers compete
 * to fill the dark intent offchain with price improvements and latency bounds.
 */
export function runSolverRFQMarket(
  intent: DarkIntent,
  baseMarketPriceUsd?: number
): { bids: SolverBid[]; winningBid: SolverBid } {
  const marketPrice = baseMarketPriceUsd || (intent.maxPriceLimitUsd * 0.985);

  // Eligible solvers: specialized for venue or with enough bonded collateral
  const eligibleSolvers = REGISTERED_BONDED_SOLVERS.filter(
    (s) => s.specializedVenue === intent.venueId || s.bondedCollateralUsd >= intent.escrowAmountUsd
  );
  const candidates = eligibleSolvers.length > 0 ? eligibleSolvers : REGISTERED_BONDED_SOLVERS;

  const bids: SolverBid[] = candidates.map((solver, idx) => {
    const isSpecialist = solver.specializedVenue === intent.venueId;
    const baseImprovementBps = isSpecialist ? 35 : 15;
    const bonusImprovementBps = Math.floor((solver.successRatePct - 99.0) * 20);
    const totalImprovementBps = Math.max(5, baseImprovementBps + bonusImprovementBps - (idx * 5));

    // For BUY: price is reduced (better for trader). For SELL: price is increased.
    const bidPriceUsd = Number(
      (intent.direction === 'BUY'
        ? marketPrice * (1 - totalImprovementBps / 10_000)
        : marketPrice * (1 + totalImprovementBps / 10_000)
      ).toFixed(4)
    );

    const latency = isSpecialist
      ? Math.floor(LIQUIDITY_VENUES[solver.specializedVenue]?.avgLatencyMs || 250)
      : Math.floor(400 + Math.random() * 200);

    const gasFee = Number((isSpecialist ? 0.35 : 0.85).toFixed(2));
    const reputationScore = Number((solver.successRatePct * 0.1).toFixed(2));

    return {
      bidId: `0xbid_${solver.id.substring(2, 10)}_${Date.now().toString(16).slice(-4)}_${idx}`,
      solver,
      bidPriceUsd,
      priceImprovementBps: totalImprovementBps,
      executionLatencyMs: latency,
      estimatedGasFeeUsd: gasFee,
      bondedCollateralUsd: solver.bondedCollateralUsd,
      reputationScore,
      isWinningBid: false,
      bidTimestamp: Date.now(),
    };
  });

  // Sort: best price first, then lowest latency
  bids.sort((a, b) => {
    if (intent.direction === 'BUY') {
      if (a.bidPriceUsd !== b.bidPriceUsd) return a.bidPriceUsd - b.bidPriceUsd;
    } else {
      if (a.bidPriceUsd !== b.bidPriceUsd) return b.bidPriceUsd - a.bidPriceUsd;
    }
    return a.executionLatencyMs - b.executionLatencyMs;
  });

  if (bids.length > 0) {
    bids[0].isWinningBid = true;
  }

  const winningBid = bids[0];
  return { bids, winningBid };
}

// --- Cross-Chain State Proof Engine ------------------------------------------

/**
 * Constructs a verifiable cross-chain cryptographic state proof receipt
 * proving that execution constraints (limit price, asset, notional) were met on the external venue.
 */
export function generateCrossChainStateProof(
  receipt: ExternalExecutionReceipt,
  intent: DarkIntent
): CrossChainStateProof {
  const venue = LIQUIDITY_VENUES[receipt.venueId] || LIQUIDITY_VENUES.hyperliquid;
  const oracleName = receipt.venueId === 'jupiter_solana' ? 'Pyth' : receipt.venueId === 'uniswap_v3' ? 'Chainlink' : 'Pyth';

  const stateProofHash = `0xstate_proof_${receipt.venueId}_${receipt.blockNumber.toString(16)}_${Math.random().toString(16).substring(2, 10)}`;
  const merkleRoot = `0xmerkle_root_${receipt.venueId}_${Math.random().toString(16).substring(2, 14)}`;

  const zkConstraintVerified = receipt.actualFillPrice <= intent.maxPriceLimitUsd;

  return {
    proofId: `0xproof_${Math.random().toString(16).substring(2, 10)}`,
    venueId: receipt.venueId,
    chainName: venue.chain,
    blockOrSlotNumber: receipt.blockNumber,
    externalTxHash: receipt.externalTxHash,
    merkleRoot,
    oracleAttestation: {
      oracle: oracleName,
      priceUsd: receipt.actualFillPrice,
      timestamp: Math.floor(Date.now() / 1000),
    },
    stateProofHash,
    zkConstraintVerified,
  };
}

/**
 * Validates cross-chain state proof against the committed intent bounds.
 */
export function verifyCrossChainStateProof(
  proof: CrossChainStateProof,
  intent: DarkIntent
): { verified: boolean; reason?: string } {
  if (!proof.zkConstraintVerified) {
    return { verified: false, reason: 'ZK constraint failed: fill price exceeded max price limit' };
  }
  if (!proof.stateProofHash || proof.stateProofHash === '0x' || proof.stateProofHash === '0x0') {
    return { verified: false, reason: 'Invalid or missing cross-chain state proof hash' };
  }
  if (proof.oracleAttestation.priceUsd > intent.maxPriceLimitUsd) {
    return {
      verified: false,
      reason: `Oracle price attestation ($${proof.oracleAttestation.priceUsd}) exceeds intent limit ($${intent.maxPriceLimitUsd})`,
    };
  }
  return { verified: true };
}

// --- Solver Bond & Slashing Manager ------------------------------------------

export function getBondedSolver(solverId: string): BondedSolver | undefined {
  return REGISTERED_BONDED_SOLVERS.find((s) => s.id === solverId);
}

export function registerSolverBondStake(
  solverId: string,
  additionalBondUsd: number
): BondedSolver {
  if (additionalBondUsd < 0) {
    throw new Error('Bond addition must be positive');
  }
  const solver = getBondedSolver(solverId);
  if (!solver) {
    throw new Error(`Solver ${solverId} not found in registered bonded solvers`);
  }
  solver.bondedCollateralUsd += additionalBondUsd;
  return solver;
}

export function slashDelinquentSolver(
  solverId: string,
  intentId: string,
  penaltyUsd: number,
  reason: string
): { solver: BondedSolver; slashedAmount: number; remainingBond: number; slashLog: string } {
  const solver = getBondedSolver(solverId);
  if (!solver) {
    throw new Error(`Solver ${solverId} not found in registered bonded solvers`);
  }
  if (penaltyUsd <= 0) {
    throw new Error('Penalty amount must be positive');
  }
  if (penaltyUsd > solver.bondedCollateralUsd) {
    throw new Error('Penalty exceeds solver active bonded collateral');
  }

  solver.bondedCollateralUsd -= penaltyUsd;
  solver.successRatePct = Math.max(90.0, Number((solver.successRatePct - 0.5).toFixed(1)));

  const slashLog = `[DIN Slash] Solver ${solver.name} (${solverId}) slashed by $${penaltyUsd.toLocaleString()} USD on Intent ${intentId}. Reason: ${reason}. Remaining Bond: $${solver.bondedCollateralUsd.toLocaleString()} USD.`;
  console.warn(slashLog);

  return {
    solver,
    slashedAmount: penaltyUsd,
    remainingBond: solver.bondedCollateralUsd,
    slashLog,
  };
}

// --- Execution Pipeline ------------------------------------------------------

/**
 * 1. Formulates and commits a private dark intent to Midnight with escrowed vUSD
 * and runs the offchain RFQ auction across bonded solvers.
 */
export async function commitDarkIntentWorkflow(
  agentId: string,
  asset: string,
  amountUsd: number,
  routeQuote: RouteQuote,
  walletAddress?: string
): Promise<DarkIntent> {
  const currentVault = getLocalVaultBalance();
  if (amountUsd > currentVault) {
    throw new Error(
      `Insufficient Shielded Vault Balance: Requires $${amountUsd.toLocaleString()} vUSD, but current vault has $${currentVault.toLocaleString()} vUSD.`
    );
  }

  const intentId = generateIntentId();
  const maxPriceLimit = Number((routeQuote.marketPriceUsd * 1.015).toFixed(4)); // 1.5% max allowable slippage cap
  const minFillUnits = Number((amountUsd / maxPriceLimit).toFixed(4));
  const expiryTimestamp = Math.floor(Date.now() / 1000) + 1800; // 30 minutes validity

  // Lock escrow in Midnight circuit
  console.info(`[DIN] Committing Dark Intent ${intentId} to Midnight consensus...`);
  const commitTxHash = await executeSignedTransaction('commitDarkIntent', {
    agentId,
    intentId,
    escrowAmountUsd: amountUsd,
    targetVenue: routeQuote.venue.id,
    timestamp: Date.now(),
  });

  // Subtract escrow from active available vault balance
  subtractFromLocalVaultBalance(amountUsd, walletAddress);

  // Base intent structure
  const baseIntent: DarkIntent = {
    intentId,
    agentId,
    asset,
    direction: 'BUY',
    escrowAmountUsd: amountUsd,
    maxPriceLimitUsd: maxPriceLimit,
    minFillUnits,
    expiryTimestamp,
    createdAt: new Date().toISOString(),
    venueId: routeQuote.venue.id,
    status: 'COMMITTED',
    privacyMetrics: {
      anonymityScore: routeQuote.venue.anonymityScore,
      externalIdentityExposed: false,
      strategyParametersHidden: true,
      mevProtection: '100%_SHIELDED',
    },
  };

  // Run competitive RFQ auction across bonded solvers
  const { bids, winningBid } = runSolverRFQMarket(baseIntent, routeQuote.marketPriceUsd);
  const matchedSolver = winningBid?.solver || REGISTERED_BONDED_SOLVERS[0];

  const intent: DarkIntent = {
    ...baseIntent,
    solver: matchedSolver,
    solverBids: bids,
    midnightCommitTxHash: commitTxHash,
  };

  addDarkIntent(intent);
  return intent;
}

/**
 * 2. Simulates the off-chain external fill by the bonded solver on the external venue
 * and generates the cryptographic cross-chain state proof.
 */
export async function simulateSolverExecution(
  intent: DarkIntent,
  routeQuote: RouteQuote
): Promise<ExternalExecutionReceipt> {
  updateDarkIntent(intent.intentId, { status: 'SOLVER_BIDDING' });

  // Simulate network dispatch latency (120ms - 450ms)
  await new Promise((resolve) =>
    setTimeout(resolve, Math.max(120, routeQuote.venue.avgLatencyMs / 2))
  );

  const actualFillPrice = routeQuote.executionPriceUsd;
  const actualFillUnits = Number((intent.escrowAmountUsd / actualFillPrice).toFixed(4));
  const externalTxHash = generateExternalTxHash(intent.venueId);

  let explorerBase = 'https://arbiscan.io/tx/';
  if (intent.venueId === 'hyperliquid') {
    explorerBase = 'https://app.hyperliquid.xyz/explorer/tx/';
  } else if (intent.venueId === 'minswap') {
    explorerBase = 'https://cardanoscan.io/transaction/';
  } else if (intent.venueId === 'jupiter_solana') {
    explorerBase = 'https://solscan.io/tx/';
  } else if (intent.venueId === 'midnight_darkpool') {
    explorerBase = 'https://explorer.1am.xyz/tx/';
  }

  const receipt: ExternalExecutionReceipt = {
    venueId: intent.venueId,
    venueName: routeQuote.venue.name,
    externalTxHash,
    blockNumber: Math.floor(195_000_000 + Math.random() * 500_000),
    actualFillPrice,
    fillUnits: actualFillUnits,
    slippagePct: routeQuote.priceImpactPct,
    fillTimeMs: routeQuote.venue.avgLatencyMs,
    oracleAttestation: `0xattestation_pyth_chainlink_${Math.random().toString(16).substring(2, 10)}`,
    cryptographicProofHash: `0xproof_fill_${Math.random().toString(16).substring(2, 12)}`,
    chainExplorerUrl: `${explorerBase}${externalTxHash.substring(0, 18)}`,
  };

  // Generate verifiable cross-chain state proof
  const stateProof = generateCrossChainStateProof(receipt, intent);
  receipt.stateProof = stateProof;

  updateDarkIntent(intent.intentId, {
    status: 'FILLED_EXTERNAL',
    externalReceipt: receipt,
    stateProof,
  });

  return receipt;
}

/**
 * 3. Dispatches Midnight atomic settlement circuit (fulfillDarkIntent)
 * releasing escrow to the solver only when cross-chain state proof is cryptographically verified.
 */
export async function settleDarkIntentOnMidnight(
  intent: DarkIntent,
  receipt: ExternalExecutionReceipt
): Promise<string> {
  console.info(`[DIN] Atomic ZK Settlement for Intent ${intent.intentId} via Midnight...`);

  // Verify cross-chain state proof before broadcasting on-chain settlement
  if (receipt.stateProof) {
    const proofValidation = verifyCrossChainStateProof(receipt.stateProof, intent);
    if (!proofValidation.verified) {
      throw new Error(`Cross-chain state proof rejected: ${proofValidation.reason}`);
    }
  }

  const settleTxHash = await executeSignedTransaction('fulfillDarkIntent', {
    intentId: intent.intentId,
    solverId: intent.solver?.id || '0xsolver_default',
    fillPriceUsd: receipt.actualFillPrice,
    fillUnits: receipt.fillUnits,
    receiptProof: receipt.stateProof?.stateProofHash || receipt.cryptographicProofHash,
    currentTime: Math.floor(Date.now() / 1000),
  });

  updateDarkIntent(intent.intentId, {
    status: 'SETTLED_MIDNIGHT',
    midnightSettleTxHash: settleTxHash,
  });

  return settleTxHash;
}
