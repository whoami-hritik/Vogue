/**
 * Vogue — Bonded Solver Network & Atomic Intent Execution Engine (DIN)
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

// --- Execution Pipeline ------------------------------------------------------

/**
 * 1. Formulates and commits a private dark intent to Midnight with escrowed vUSD.
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

  // Match optimal bonded solver
  const matchedSolver =
    REGISTERED_BONDED_SOLVERS.find((s) => s.specializedVenue === routeQuote.venue.id) ||
    REGISTERED_BONDED_SOLVERS[0];

  const intent: DarkIntent = {
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
    solver: matchedSolver,
    midnightCommitTxHash: commitTxHash,
    privacyMetrics: {
      anonymityScore: routeQuote.venue.anonymityScore,
      externalIdentityExposed: false,
      strategyParametersHidden: true,
      mevProtection: '100%_SHIELDED',
    },
  };

  addDarkIntent(intent);
  return intent;
}

/**
 * 2. Simulates the off-chain external fill by the bonded solver on the external venue.
 */
export async function simulateSolverExecution(
  intent: DarkIntent,
  routeQuote: RouteQuote
): Promise<ExternalExecutionReceipt> {
  updateDarkIntent(intent.intentId, { status: 'SOLVER_BIDDING' });

  // Simulate network dispatch latency (250ms - 450ms)
  await new Promise((resolve) => setTimeout(resolve, Math.max(250, routeQuote.venue.avgLatencyMs / 2)));

  const actualFillPrice = routeQuote.executionPriceUsd;
  const actualFillUnits = Number((intent.escrowAmountUsd / actualFillPrice).toFixed(4));
  const externalTxHash = generateExternalTxHash(intent.venueId);

  let explorerBase = 'https://arbiscan.io/tx/';
  if (intent.venueId === 'hyperliquid') {
    explorerBase = 'https://app.hyperliquid.xyz/explorer/tx/';
  } else if (intent.venueId === 'minswap') {
    explorerBase = 'https://cardanoscan.io/transaction/';
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

  updateDarkIntent(intent.intentId, {
    status: 'FILLED_EXTERNAL',
    externalReceipt: receipt,
  });

  return receipt;
}

/**
 * 3. Dispatches Midnight atomic settlement circuit (fulfillDarkIntent)
 * releasing escrow to the solver and crediting the shielded position note to the trader.
 */
export async function settleDarkIntentOnMidnight(
  intent: DarkIntent,
  receipt: ExternalExecutionReceipt
): Promise<string> {
  console.info(`[DIN] Atomic ZK Settlement for Intent ${intent.intentId} via Midnight...`);

  const settleTxHash = await executeSignedTransaction('fulfillDarkIntent', {
    intentId: intent.intentId,
    solverId: intent.solver?.id || '0xsolver_default',
    fillPriceUsd: receipt.actualFillPrice,
    fillUnits: receipt.fillUnits,
    receiptProof: receipt.cryptographicProofHash,
    currentTime: Math.floor(Date.now() / 1000),
  });

  updateDarkIntent(intent.intentId, {
    status: 'SETTLED_MIDNIGHT',
    midnightSettleTxHash: settleTxHash,
  });

  return settleTxHash;
}
