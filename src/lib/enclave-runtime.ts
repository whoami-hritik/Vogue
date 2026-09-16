/**
 * Vogue — Confidential Enclave Runtime & Proportional Mirroring Engine
 *
 * Implements the Proof of Alpha (PoA) execution sandbox:
 * 1. Simulates Confidential TEE (Intel SGX, AWS Nitro, Client TEE) strategy execution.
 * 2. Emits cryptographic zero-knowledge trade signal commitments without revealing proprietary logic.
 * 3. Dynamically calculates proportional position sizing bounded by follower risk limits.
 * 4. Enforces personal stop-loss boundaries to protect follower private vaults.
 * 5. Integrates with High-Water Mark (HWM) settlement for verifiable performance fee distribution.
 */

import { executeSignedTransaction } from './midnight-api';
import {
  generateVerifiableProofHash,
  getAlphaStrategyById,
  getActiveSubscriptions,
  settleSubscriberPerformanceFee,
  type AlphaStrategy,
  type AlphaSubscription,
} from './alpha-engine';
import { subtractFromLocalVaultBalance } from './vault';

export type EnclaveVendor = 'INTEL_SGX' | 'AWS_NITRO' | 'CLIENT_TEE';
export type TradeDirection = 'LONG' | 'SHORT';
export type SignalStatus = 'ACTIVE' | 'RESOLVED_PROFIT' | 'RESOLVED_LOSS' | 'RESOLVED_STOPPED_OUT';
export type MirrorStatus = 'EXECUTED' | 'CLOSED_PROFIT' | 'CLOSED_LOSS' | 'STOPPED_OUT' | 'REJECTED_RISK_LIMIT';

export interface EnclaveTradeSignal {
  signalId: string;
  strategyId: string;
  strategyName: string;
  signalIndex: number;
  assetSymbol: string;
  direction: TradeDirection;
  entryPriceUsd: number;
  targetPriceUsd: number;
  stopLossPriceUsd: number;
  masterPositionNotionalUsd: number;
  commitmentHash: string;
  enclaveVendor: EnclaveVendor;
  attestationQuote: string;
  timestamp: string;
  status: SignalStatus;
  exitPriceUsd?: number;
}

export interface MirroredTradeExecution {
  mirrorId: string;
  signalId: string;
  strategyId: string;
  followerAddress: string;
  subscriptionId: string;
  followerAllocatedCollateralUsd: number;
  masterPositionNotionalUsd: number;
  strategyTotalCapitalUsd: number;
  proportionalSizeUsd: number;
  proportionalAllocationBps: number;
  direction: TradeDirection;
  entryPriceUsd: number;
  effectiveStopLossPriceUsd: number;
  personalStopLossTriggered: boolean;
  exitPriceUsd?: number;
  followerPnlUsd?: number;
  performanceFeeDeductedUsd?: number;
  netProfitUsd?: number;
  status: MirrorStatus;
  rejectionReason?: string;
  midnightMirrorTxHash: string;
  timestamp: string;
}

export interface BatchMirrorResult {
  signalId: string;
  totalFollowers: number;
  executedCount: number;
  rejectedCount: number;
  totalVolumeMirroredUsd: number;
  executions: MirroredTradeExecution[];
}

// --- Local & In-Memory Enclave Registry --------------------------------------

let _enclaveSignals: EnclaveTradeSignal[] = [];
let _mirroredExecutions: MirroredTradeExecution[] = [];

const STORAGE_KEY_SIGNALS = 'vogue_enclave_signals';
const STORAGE_KEY_MIRRORS = 'vogue_enclave_mirrored_trades';

function loadEnclaveData(): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const storedSignals = localStorage.getItem(STORAGE_KEY_SIGNALS);
      if (storedSignals) {
        _enclaveSignals = JSON.parse(storedSignals);
      }
      const storedMirrors = localStorage.getItem(STORAGE_KEY_MIRRORS);
      if (storedMirrors) {
        _mirroredExecutions = JSON.parse(storedMirrors);
      }
    } catch {
      // Storage unavailable in test/headless environment
    }
  }
}

function persistEnclaveData(): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem(STORAGE_KEY_SIGNALS, JSON.stringify(_enclaveSignals));
      localStorage.setItem(STORAGE_KEY_MIRRORS, JSON.stringify(_mirroredExecutions));
    } catch {
      // Storage unavailable
    }
  }
}

// Load persisted state on module import
loadEnclaveData();

// --- Mathematical Sizing & Stop-Loss Helpers ---------------------------------

/**
 * Calculates dynamic proportional position sizing for a subscriber.
 *
 * Formula:
 *   rawSize = masterPositionNotionalUsd * (followerAllocatedStakeUsd / max(strategyTotalCapitalUsd, 1))
 *   proportionalSizeUsd = min(rawSize, maxTradeAllocationUsd)
 */
export function calculateProportionalOrderSize(
  masterPositionNotionalUsd: number,
  followerAllocatedStakeUsd: number,
  strategyTotalCapitalUsd: number,
  maxTradeAllocationUsd: number
): { proportionalSizeUsd: number; proportionalAllocationBps: number } {
  if (followerAllocatedStakeUsd <= 0 || strategyTotalCapitalUsd <= 0 || masterPositionNotionalUsd <= 0) {
    return { proportionalSizeUsd: 0, proportionalAllocationBps: 0 };
  }

  const poolCapital = Math.max(strategyTotalCapitalUsd, followerAllocatedStakeUsd);
  const rawSize = masterPositionNotionalUsd * (followerAllocatedStakeUsd / poolCapital);
  const proportionalSizeUsd = Number(Math.min(rawSize, maxTradeAllocationUsd).toFixed(2));

  // Basis points relative to follower's allocated stake (1% = 100 bps, 100% = 10000 bps)
  const allocBps = Math.min(
    10000,
    Math.max(1, Math.round((proportionalSizeUsd / followerAllocatedStakeUsd) * 10000))
  );

  return {
    proportionalSizeUsd,
    proportionalAllocationBps: allocBps,
  };
}

/**
 * Determines the effective stop loss price by comparing the master strategy's
 * stop loss against the subscriber's personal stop loss threshold.
 *
 * Tighter stop-loss wins to guarantee private vault risk boundaries.
 */
export function calculateEffectiveStopLoss(
  entryPriceUsd: number,
  masterStopLossPriceUsd: number,
  direction: TradeDirection,
  personalStopLossPct: number
): { effectiveStopLossPriceUsd: number; usesPersonalStopLoss: boolean } {
  const safePct = Math.max(0.1, Math.min(personalStopLossPct, 50));

  if (direction === 'LONG') {
    const personalStopLossPrice = Number((entryPriceUsd * (1 - safePct / 100)).toFixed(2));
    if (personalStopLossPrice > masterStopLossPriceUsd) {
      return { effectiveStopLossPriceUsd: personalStopLossPrice, usesPersonalStopLoss: true };
    }
    return { effectiveStopLossPriceUsd: masterStopLossPriceUsd, usesPersonalStopLoss: false };
  } else {
    // SHORT position
    const personalStopLossPrice = Number((entryPriceUsd * (1 + safePct / 100)).toFixed(2));
    if (personalStopLossPrice < masterStopLossPriceUsd) {
      return { effectiveStopLossPriceUsd: personalStopLossPrice, usesPersonalStopLoss: true };
    }
    return { effectiveStopLossPriceUsd: masterStopLossPriceUsd, usesPersonalStopLoss: false };
  }
}

// --- Confidential Enclave Signal Emission ------------------------------------

/**
 * Emits a confidential trade signal from an attested execution enclave.
 * Registers the commitment onto the Midnight Compact contract without leaking trade logic.
 */
export async function emitConfidentialTradeSignal(params: {
  strategyId: string;
  assetSymbol: string;
  direction: TradeDirection;
  entryPriceUsd: number;
  targetPriceUsd: number;
  stopLossPriceUsd: number;
  masterPositionNotionalUsd: number;
  creatorAddress?: string;
  enclaveVendor?: EnclaveVendor;
}): Promise<EnclaveTradeSignal> {
  const strategy = getAlphaStrategyById(params.strategyId);
  if (!strategy) {
    throw new Error(`Strategy ${params.strategyId} does not exist in Alpha Marketplace.`);
  }

  if (params.creatorAddress && params.creatorAddress.toLowerCase() !== strategy.creator.toLowerCase()) {
    throw new Error(`Unauthorized: Caller is not the registered creator of strategy ${params.strategyId}.`);
  }

  // Determine signal index for strategy
  const existingSignals = _enclaveSignals.filter((s) => s.strategyId === params.strategyId);
  const signalIndex = existingSignals.length;

  const signalId = `0xsignal_${params.strategyId.substring(2, 10)}_${signalIndex}_${Date.now().toString(16).substring(4)}`;
  const vendor = params.enclaveVendor || 'INTEL_SGX';

  // Generate cryptographic commitment hash for Midnight Compact circuit
  const commitmentHash = generateVerifiableProofHash(
    'alpha_signal',
    params.strategyId,
    signalIndex,
    params.assetSymbol,
    params.direction,
    Math.round(params.entryPriceUsd * 100)
  );

  // Generate simulated hardware TEE attestation quote
  const attestationQuote = generateVerifiableProofHash(
    `tee_quote_${vendor.toLowerCase()}`,
    params.strategyId,
    params.assetSymbol,
    commitmentHash
  );

  // Broadcast to Midnight emitAlphaSignal circuit
  try {
    await executeSignedTransaction('emitAlphaSignal', {
      strategyId: params.strategyId,
      signalIndex,
      signalCommitment: commitmentHash,
      timestamp: Date.now(),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (!msg.includes('Midnight wallet extension not connected')) {
      throw err;
    }
  }

  const signal: EnclaveTradeSignal = {
    signalId,
    strategyId: params.strategyId,
    strategyName: strategy.name,
    signalIndex,
    assetSymbol: params.assetSymbol,
    direction: params.direction,
    entryPriceUsd: params.entryPriceUsd,
    targetPriceUsd: params.targetPriceUsd,
    stopLossPriceUsd: params.stopLossPriceUsd,
    masterPositionNotionalUsd: params.masterPositionNotionalUsd,
    commitmentHash,
    enclaveVendor: vendor,
    attestationQuote,
    timestamp: new Date().toISOString(),
    status: 'ACTIVE',
  };

  _enclaveSignals.unshift(signal);
  persistEnclaveData();

  return signal;
}

// --- Proportional Trade Mirroring Pipeline -----------------------------------

/**
 * Executes a proportional trade mirror for an individual subscriber.
 */
export async function executeProportionalMirrorTrade(
  signalId: string,
  subscriptionId: string
): Promise<MirroredTradeExecution> {
  const signal = _enclaveSignals.find((s) => s.signalId === signalId);
  if (!signal) {
    throw new Error(`Signal ${signalId} not found in Enclave Registry.`);
  }

  if (signal.status !== 'ACTIVE') {
    throw new Error(`Signal ${signalId} is no longer active (Status: ${signal.status}).`);
  }

  const activeSubs = getActiveSubscriptions();
  const sub = activeSubs.find((s) => s.subscriptionId === subscriptionId);
  if (!sub) {
    throw new Error(`Active subscription ${subscriptionId} not found.`);
  }

  if (sub.strategyId !== signal.strategyId) {
    throw new Error(`Subscription ${subscriptionId} belongs to strategy ${sub.strategyId}, not ${signal.strategyId}.`);
  }

  // Prevent duplicate execution of same signal for subscriber
  const existingMirror = _mirroredExecutions.find(
    (m) => m.signalId === signalId && m.subscriptionId === subscriptionId
  );
  if (existingMirror) {
    throw new Error(`Signal ${signalId} has already been mirrored by subscription ${subscriptionId}.`);
  }

  const strategy = getAlphaStrategyById(signal.strategyId);
  const strategyTotalCapitalUsd = strategy ? strategy.totalMirroredCapitalUsd : sub.allocatedCollateralUsd;

  const { proportionalSizeUsd, proportionalAllocationBps } = calculateProportionalOrderSize(
    signal.masterPositionNotionalUsd,
    sub.allocatedCollateralUsd,
    strategyTotalCapitalUsd,
    sub.maxTradeAllocationUsd
  );

  const { effectiveStopLossPriceUsd, usesPersonalStopLoss } = calculateEffectiveStopLoss(
    signal.entryPriceUsd,
    signal.stopLossPriceUsd,
    signal.direction,
    sub.personalStopLossPct
  );

  const mirrorId = `0xmirror_${subscriptionId.substring(2, 8)}_${Date.now().toString(16).substring(4)}`;

  // Enforce risk ceiling checks
  if (proportionalSizeUsd <= 0 || proportionalSizeUsd > sub.allocatedCollateralUsd) {
    const rejectedExecution: MirroredTradeExecution = {
      mirrorId,
      signalId,
      strategyId: signal.strategyId,
      followerAddress: sub.followerAddress,
      subscriptionId,
      followerAllocatedCollateralUsd: sub.allocatedCollateralUsd,
      masterPositionNotionalUsd: signal.masterPositionNotionalUsd,
      strategyTotalCapitalUsd,
      proportionalSizeUsd: 0,
      proportionalAllocationBps: 0,
      direction: signal.direction,
      entryPriceUsd: signal.entryPriceUsd,
      effectiveStopLossPriceUsd,
      personalStopLossTriggered: false,
      status: 'REJECTED_RISK_LIMIT',
      rejectionReason: `Proportional size ($${proportionalSizeUsd}) exceeds subscriber collateral bounds ($${sub.allocatedCollateralUsd}).`,
      midnightMirrorTxHash: '0x0000000000000000000000000000000000000000',
      timestamp: new Date().toISOString(),
    };
    _mirroredExecutions.unshift(rejectedExecution);
    persistEnclaveData();
    return rejectedExecution;
  }

  // Broadcast to Midnight mirrorAlphaTrade circuit
  let txHash = generateVerifiableProofHash('midnight_mirror', mirrorId, signalId, sub.followerAddress);
  try {
    txHash = await executeSignedTransaction('mirrorAlphaTrade', {
      strategyId: signal.strategyId,
      signalIndex: signal.signalIndex,
      subscriberPk: sub.followerAddress,
      allocationBps: proportionalAllocationBps,
      timestamp: Date.now(),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (!msg.includes('Midnight wallet extension not connected')) {
      throw err;
    }
  }

  const execution: MirroredTradeExecution = {
    mirrorId,
    signalId,
    strategyId: signal.strategyId,
    followerAddress: sub.followerAddress,
    subscriptionId,
    followerAllocatedCollateralUsd: sub.allocatedCollateralUsd,
    masterPositionNotionalUsd: signal.masterPositionNotionalUsd,
    strategyTotalCapitalUsd,
    proportionalSizeUsd,
    proportionalAllocationBps,
    direction: signal.direction,
    entryPriceUsd: signal.entryPriceUsd,
    effectiveStopLossPriceUsd,
    personalStopLossTriggered: usesPersonalStopLoss,
    status: 'EXECUTED',
    midnightMirrorTxHash: txHash,
    timestamp: new Date().toISOString(),
  };

  _mirroredExecutions.unshift(execution);
  persistEnclaveData();

  return execution;
}

/**
 * Batches proportional mirror execution across all active followers of a strategy.
 */
export async function executeBatchProportionalMirroring(signalId: string): Promise<BatchMirrorResult> {
  const signal = _enclaveSignals.find((s) => s.signalId === signalId);
  if (!signal) {
    throw new Error(`Signal ${signalId} not found in Enclave Registry.`);
  }

  const matchingSubs = getActiveSubscriptions().filter((s) => s.strategyId === signal.strategyId);

  const executions: MirroredTradeExecution[] = [];
  let executedCount = 0;
  let rejectedCount = 0;
  let totalVolumeMirroredUsd = 0;

  for (const sub of matchingSubs) {
    try {
      const exec = await executeProportionalMirrorTrade(signalId, sub.subscriptionId);
      executions.push(exec);
      if (exec.status === 'EXECUTED') {
        executedCount++;
        totalVolumeMirroredUsd += exec.proportionalSizeUsd;
      } else {
        rejectedCount++;
      }
    } catch {
      rejectedCount++;
    }
  }

  return {
    signalId,
    totalFollowers: matchingSubs.length,
    executedCount,
    rejectedCount,
    totalVolumeMirroredUsd: Number(totalVolumeMirroredUsd.toFixed(2)),
    executions,
  };
}

// --- Trade Resolution & High-Water Mark Fee Settlement -----------------------

/**
 * Resolves an active confidential signal at an exit price.
 * Calculates realized PnL for each follower and invokes HWM fee splits.
 */
export function resolveConfidentialTrade(
  signalId: string,
  exitPriceUsd: number
): { signal: EnclaveTradeSignal; resolvedExecutions: MirroredTradeExecution[] } {
  const signal = _enclaveSignals.find((s) => s.signalId === signalId);
  if (!signal) {
    throw new Error(`Signal ${signalId} not found.`);
  }

  const executions = _mirroredExecutions.filter(
    (m) => m.signalId === signalId && m.status === 'EXECUTED'
  );

  const resolvedExecutions: MirroredTradeExecution[] = [];

  for (const exec of executions) {
    let effectiveExitPrice = exitPriceUsd;
    let personalStopTriggered = false;

    // Check if personal stop loss was hit
    if (signal.direction === 'LONG' && exitPriceUsd <= exec.effectiveStopLossPriceUsd) {
      effectiveExitPrice = exec.effectiveStopLossPriceUsd;
      personalStopTriggered = true;
    } else if (signal.direction === 'SHORT' && exitPriceUsd >= exec.effectiveStopLossPriceUsd) {
      effectiveExitPrice = exec.effectiveStopLossPriceUsd;
      personalStopTriggered = true;
    }

    // Realized return calculation
    const returnPct =
      signal.direction === 'LONG'
        ? (effectiveExitPrice - exec.entryPriceUsd) / exec.entryPriceUsd
        : (exec.entryPriceUsd - effectiveExitPrice) / exec.entryPriceUsd;

    const followerPnlUsd = Number((exec.proportionalSizeUsd * returnPct).toFixed(2));

    exec.exitPriceUsd = effectiveExitPrice;
    exec.followerPnlUsd = followerPnlUsd;
    exec.personalStopLossTriggered = personalStopTriggered;

    if (personalStopTriggered) {
      exec.status = 'STOPPED_OUT';
      exec.performanceFeeDeductedUsd = 0;
      exec.netProfitUsd = followerPnlUsd;
      // Deduct loss from follower balance
      subtractFromLocalVaultBalance(Math.abs(followerPnlUsd), exec.followerAddress);
    } else if (followerPnlUsd > 0) {
      // Net profit: invoke High-Water Mark fee settlement
      const settlement = settleSubscriberPerformanceFee(exec.subscriptionId, followerPnlUsd);
      exec.performanceFeeDeductedUsd = settlement.feeDeductedUsd;
      exec.netProfitUsd = settlement.netProfitUsd;
      exec.status = 'CLOSED_PROFIT';
    } else {
      // Drawdown / loss
      exec.status = 'CLOSED_LOSS';
      exec.performanceFeeDeductedUsd = 0;
      exec.netProfitUsd = followerPnlUsd;
      subtractFromLocalVaultBalance(Math.abs(followerPnlUsd), exec.followerAddress);
    }

    resolvedExecutions.push(exec);
  }

  // Update master signal state
  const isMasterProfit =
    signal.direction === 'LONG' ? exitPriceUsd > signal.entryPriceUsd : exitPriceUsd < signal.entryPriceUsd;
  signal.status = isMasterProfit ? 'RESOLVED_PROFIT' : 'RESOLVED_LOSS';
  signal.exitPriceUsd = exitPriceUsd;

  persistEnclaveData();

  return {
    signal,
    resolvedExecutions,
  };
}

// --- Query APIs & Test Reset -------------------------------------------------

export function getAllEnclaveSignals(): EnclaveTradeSignal[] {
  return [..._enclaveSignals];
}

export function getSignalsByStrategy(strategyId: string): EnclaveTradeSignal[] {
  return _enclaveSignals.filter((s) => s.strategyId === strategyId);
}

export function getSignalById(signalId: string): EnclaveTradeSignal | undefined {
  return _enclaveSignals.find((s) => s.signalId === signalId);
}

export function getAllMirroredTrades(): MirroredTradeExecution[] {
  return [..._mirroredExecutions];
}

export function getMirroredTradesByFollower(followerAddress: string): MirroredTradeExecution[] {
  return _mirroredExecutions.filter(
    (m) => m.followerAddress.toLowerCase() === followerAddress.toLowerCase()
  );
}

export function getMirroredTradesByStrategy(strategyId: string): MirroredTradeExecution[] {
  return _mirroredExecutions.filter((m) => m.strategyId === strategyId);
}

/**
 * Resets in-memory state for clean unit test runs.
 */
export function resetEnclaveRuntimeForTesting(): void {
  _enclaveSignals = [];
  _mirroredExecutions = [];
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.removeItem(STORAGE_KEY_SIGNALS);
      localStorage.removeItem(STORAGE_KEY_MIRRORS);
    } catch {
      // Ignore
    }
  }
}
