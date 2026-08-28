/**
 * Vogue — Midnight Wallet & Protocol Hook
 *
 * Delegates all wallet detection/connection/signing to:
 *   - src/lib/lace-wallet.ts (wallet adapter layer)
 *   - src/lib/midnight-api.ts (transaction signing layer)
 *
 * This hook manages React state and UI concerns only.
 */

import { useState, useCallback, useEffect } from 'react';
import { StrategyParams, computeStrategyHash, TradeRecord, INITIAL_TRADE_HISTORY } from '../utils/contract';
import { ProtocolLogEntry } from '../components/ProtocolLog';
import { fetchLatestMidnightBlock, MidnightLatestBlock } from '../utils/midnightApi';

import {
  connect1AMWallet,
  switch1AMNetwork,
  fetchWalletBalances,
  isWalletInstalled,
  getDetectedWallets,
  type LiveWalletSession,
  type MidnightNetwork,
  type DetectedWallet,
} from '../lib/lace-wallet';

import {
  executeSignedTransaction,
  checkProofServerHealth,
  isDustReady,
  setLiveSession,
} from '../lib/midnight-api';

import {
  syncStrategyCommitment,
  syncTradeExecution,
  fetchPersistedTrades,
  fetchPersistedStrategies,
  clearSupabaseWalletData,
  fetchWalletVaultBalance,
  syncWalletVaultBalance,
} from '../lib/supabase-sync';

import { evaluateRiskModel } from '../lib/riskModel';
import {
  getLocalVaultBalance,
  setLocalVaultBalance,
  addToLocalVaultBalance,
  subtractFromLocalVaultBalance,
  mintVaultBalance,
  burnVaultBalance,
} from '../lib/vault';
import { confirmTransaction } from '../utils/rpc';
import { runManualAnalysis, TradeRecommendation } from '../utils/agent';
import { postEvent, newEventId } from '../lib/analytics';

export interface ActiveStrategy {
  id: string;
  agentId: string;
  params: StrategyParams;
  commitmentHash: string;
  createdAt: string;
  status: 'active' | 'expired' | 'revoked';
}

function formatDustDisplay(rawDust: number): string {
  if (!rawDust || isNaN(rawDust)) return '0.00 DUST';
  if (rawDust >= 1_000_000_000_000) {
    const tVal = rawDust / 1_000_000_000_000;
    return `${tVal.toLocaleString(undefined, { maximumFractionDigits: 2 })} tDUST`;
  }
  if (rawDust >= 1_000_000) {
    const mVal = rawDust / 1_000_000;
    return `${mVal.toLocaleString(undefined, { maximumFractionDigits: 2 })} tDUST`;
  }
  if (rawDust >= 1_000) {
    return `${(rawDust / 1_000).toLocaleString(undefined, { maximumFractionDigits: 2 })} kDUST`;
  }
  return `${rawDust.toLocaleString()} DUST`;
}

export function useMidnight() {
  // ─── Core wallet state ─────────────────────────────────────────────
  const [session, setSession] = useState<LiveWalletSession | null>(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [networkId, setNetworkId] = useState<MidnightNetwork>('preview');

  // ─── Shielded Vault state (0 by default for new wallets) ─────────────
  const [vaultBalance, setVaultBalance] = useState<number>(0);

  // ─── Detected wallets ──────────────────────────────────────────────
  const [detectedWallets, setDetectedWallets] = useState<DetectedWallet[]>([]);
  const [isWalletAvailable, setIsWalletAvailable] = useState(false);

  // ─── Health checks ─────────────────────────────────────────────────
  const [proofServerUp, setProofServerUp] = useState<boolean | null>(null);
  const [dustReady, setDustReady] = useState(false);

  // ─── Explorer ──────────────────────────────────────────────────────
  const [latestBlock, setLatestBlock] = useState<MidnightLatestBlock | null>(null);

  // ─── UI state ──────────────────────────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ─── Strategy & trade state ────────────────────────────────────────
  const [activeStrategies, setActiveStrategies] = useState<ActiveStrategy[]>([]);
  const [trades, setTrades] = useState<TradeRecord[]>(INITIAL_TRADE_HISTORY);
  const [isProofGenerating, setIsProofGenerating] = useState(false);
  const [proofStep, setProofStep] = useState('');

  // ─── Analysis state ────────────────────────────────────────────────
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [recommendationMap, setRecommendationMap] = useState<Record<string, TradeRecommendation>>({});

  // ─── Protocol log ──────────────────────────────────────────────────
  const [protocolLogs, setProtocolLogs] = useState<ProtocolLogEntry[]>([
    {
      id: 'log_init',
      type: 'info',
      title: 'Circuit Model Active',
      detail: 'Compact v0.24 ZK witness circuit & EZKL ZK-ML model initialized.',
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);

  const addLog = useCallback((type: 'success' | 'error' | 'info', title: string, detail: string) => {
    setProtocolLogs((prev) => [
      {
        id: `log_${Date.now()}_${Math.random().toString(16).substring(2, 6)}`,
        type,
        title,
        detail,
        timestamp: new Date().toLocaleTimeString(),
      },
      ...prev,
    ]);
  }, []);

  // ─── Derived display values ────────────────────────────────────────
  const walletAddress = session?.address ?? null;
  const shieldedAddress = session?.shieldedAddress ?? null;
  const walletName = session?.walletName ?? '1AM Wallet';
  const shieldedBalance = session ? `${session.balances.tNightShielded.toFixed(2)} tNIGHT` : '0.00 tNIGHT';
  const unshieldedBalance = session ? `${session.balances.tNightUnshielded.toLocaleString()} tNIGHT` : '0.00 tNIGHT';
  const dustBalance = session ? formatDustDisplay(session.balances.tDust) : '0.00 DUST';
  const balance = unshieldedBalance;

  // ─── Poll for wallet extension ─────────────────────────────────────
  const scanWallets = useCallback(() => {
    const found = getDetectedWallets();
    setDetectedWallets(found);
    setIsWalletAvailable(isWalletInstalled());
    return found;
  }, []);

  // ─── Load persisted trade history & strategies from Supabase on mount ──
  useEffect(() => {
    fetchPersistedTrades().then((persisted) => {
      if (persisted.length > 0) {
        setTrades(persisted);
      }
    });

    fetchPersistedStrategies().then((persistedStrats) => {
      if (persistedStrats.length > 0) {
        const loaded: ActiveStrategy[] = persistedStrats.map((s) => ({
          id: `strat_${s.commitment_hash.substring(0, 8)}`,
          agentId: s.agent_id,
          params: {
            asset: 'ADA',
            maxPositionPct: s.max_allocation_pct || 25,
            stopLossPct: s.stop_loss_pct || 8,
            timelineDays: 30,
            timelineExpiry: BigInt(Math.floor(Date.now() / 1000) + 30 * 86400),
          },
          commitmentHash: s.commitment_hash,
          createdAt: s.created_at ? new Date(s.created_at).toISOString().replace('T', ' ').substring(0, 19) : new Date().toISOString().replace('T', ' ').substring(0, 19),
          status: 'active',
        }));
        setActiveStrategies(loaded);
      }
    });
  }, []);

  useEffect(() => {
    scanWallets();
    const interval = setInterval(scanWallets, 500);
    return () => clearInterval(interval);
  }, [scanWallets]);

  // ─── Sync state ─────────────────────────────────────────────────────
  const [isSyncing, setIsSyncing] = useState(false);

  // ─── Periodic balance polling with sync-aware exponential backoff ────
  // If the wallet says "syncing", back off (3.5s → 7s → 14s → 30s max).
  // Reset to 3.5s as soon as a balance fetch succeeds.
  useEffect(() => {
    if (!session?.api) return;

    let timeoutId: ReturnType<typeof setTimeout>;
    let delay = 3500;
    let mounted = true;

    const refreshBals = async () => {
      try {
        const fresh = await fetchWalletBalances(session.api);
        if (!mounted) return;

        // Success — reset backoff and clear syncing state
        delay = 3500;
        setIsSyncing(false);

        setSession((prev) => {
          if (!prev) return null;
          if (
            prev.balances.tNightUnshielded === fresh.tNightUnshielded &&
            prev.balances.tNightShielded === fresh.tNightShielded &&
            prev.balances.tDust === fresh.tDust
          ) {
            return prev;
          }
          return { ...prev, balances: fresh };
        });
      } catch (err: unknown) {
        if (!mounted) return;
        const msg = err instanceof Error ? err.message : String(err);

        if (msg.includes('syncing') || msg.includes('Wallet is syncing')) {
          // Wallet is still syncing — back off, don't spam
          setIsSyncing(true);
          delay = Math.min(delay * 2, 30000);
          // Single silent log at the first sign of syncing
          if (delay <= 7000) {
            console.info('[Vogue Wallet] 1AM wallet syncing — polling will slow down until sync completes.');
          }
        } else {
          // Other error — keep current delay, clear syncing flag
          setIsSyncing(false);
        }
      }

      if (mounted) {
        timeoutId = setTimeout(refreshBals, delay);
      }
    };

    // First call after a short initial delay
    timeoutId = setTimeout(refreshBals, 1500);
    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, [session?.api]);

  // ─── Check proof server health ─────────────────────────────────────
  useEffect(() => {
    checkProofServerHealth().then(setProofServerUp);
    const interval = setInterval(() => {
      checkProofServerHealth().then(setProofServerUp);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // ─── Fetch live block analytics ────────────────────────────────────
  useEffect(() => {
    if (networkId === 'undeployed') return;
    const net = networkId === 'mainnet' ? 'preview' : (networkId as 'preview' | 'preprod');
    const load = () => fetchLatestMidnightBlock(net).then((b) => { if (b) setLatestBlock(b); });
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, [networkId]);

  // ─── Connect wallet ────────────────────────────────────────────────
  const connectWallet = useCallback(async (_walletHint?: unknown, targetNetwork: MidnightNetwork = networkId) => {
    setIsConnecting(true);
    setError(null);

    try {
      addLog('info', 'Connecting Wallet', `Initiating 1AM connection on Midnight ${targetNetwork}...`);

      const live = await connect1AMWallet(targetNetwork);

      setSession(live);
      setLiveSession(live);
      setWalletConnected(true);
      setDustReady(isDustReady());

      // Fetch saved vault balance for this specific wallet from Supabase (defaults to 0 for fresh wallet)
      const currentAddr = live.shieldedAddress || live.address;
      const savedVault = await fetchWalletVaultBalance(currentAddr);
      setLocalVaultBalance(savedVault);
      setVaultBalance(savedVault);

      addLog('success', 'Wallet Connected',
        `Connected to ${live.network} — ${live.address.substring(0, 18)}… (Vault Balance: $${savedVault} vUSD)`
      );
      void postEvent({ client_event_id: newEventId(), wallet_address: live.address || live.shieldedAddress || 'unknown', operation: 'wallet_connected', status: 'success', network: live.network || targetNetwork });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Wallet connection failed';
      console.error('[Vogue] Wallet connection error:', err);
      setError(msg);
      setWalletConnected(false);
      addLog('error', 'Connection Failed', msg);
    } finally {
      setIsConnecting(false);
    }
  }, [networkId, addLog]);

  // ─── Disconnect & Clear Wallet Cache (Supabase Backend Reset) ──
  const clearWalletCache = useCallback(async () => {
    const currentAddr = session?.shieldedAddress || session?.address || walletAddress;
    setSession(null);
    setLiveSession(null);
    setWalletConnected(false);
    setDustReady(false);
    setActiveStrategies([]);
    setTrades([]);
    setLocalVaultBalance(0);
    setVaultBalance(0);
    setRecommendationMap({});
    setError(null);

    // Clean up Supabase backend records
    try {
      if (currentAddr) {
        await clearSupabaseWalletData(currentAddr);
      } else {
        await clearSupabaseWalletData();
      }
    } catch (e) {
      console.warn('[Vogue] Supabase clear warning:', e);
    }

    addLog('info', 'Wallet Data Cleared', 'Wallet session closed and data reset in Supabase backend.');
  }, [session, walletAddress, addLog]);

  const disconnectWallet = useCallback(() => {
    clearWalletCache();
  }, [clearWalletCache]);

  // ─── Switch network ────────────────────────────────────────────────
  const handleSelectNetwork = useCallback(async (net: MidnightNetwork) => {
    setNetworkId(net);
    setIsConnecting(true);
    setError(null);

    try {
      addLog('info', 'Switching Network', `Requesting 1AM connection & popup on Midnight ${net.toUpperCase()}...`);
      setLiveSession(null);

      const live = await switch1AMNetwork(net);
      setSession(live);
      setLiveSession(live);
      setWalletConnected(true);
      setDustReady(isDustReady());

      // Fetch saved vault balance for this specific wallet & network from Supabase
      const currentAddr = live.shieldedAddress || live.address;
      const savedVault = await fetchWalletVaultBalance(currentAddr);
      setLocalVaultBalance(savedVault);
      setVaultBalance(savedVault);

      addLog('success', 'Network Switched',
        `Switched to Midnight ${net.toUpperCase()} — Balance: ${live.balances.tNightUnshielded.toLocaleString()} tNIGHT, ${live.balances.tDust.toLocaleString()} DUST`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network switch failed';
      console.error('[Vogue] Network switch error:', err);
      setError(msg);
      addLog('error', 'Network Switch Failed', msg);
    } finally {
      setIsConnecting(false);
    }
  }, [addLog]);

  // ─── Shielded Vault Actions ────────────────────────────────────────
  const mintVault = useCallback(async (amountVusd: number) => {
    setError(null);
    try {
      addLog('info', 'Minting Vault Balance', `Requesting 1AM signature to mint $${amountVusd} vUSD...`);
      const currentAddr = session?.shieldedAddress || session?.address || walletAddress || '';
      const txHash = await mintVaultBalance(amountVusd, currentAddr);
      const updated = getLocalVaultBalance();
      setVaultBalance(updated);
      addLog('success', 'Vault Minted', `Minted $${amountVusd} vUSD to shielded vault. TX: ${txHash}`);
      void postEvent({ client_event_id: newEventId(), wallet_address: currentAddr, operation: 'vault_minted', status: 'success', tx_hash: txHash, network: (session?.network as string) || networkId });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Vault mint failed';
      setError(msg);
      addLog('error', 'Vault Mint Failed', msg);
    }
  }, [session, walletAddress, addLog]);

  const burnVault = useCallback(async (amountVusd: number) => {
    setError(null);
    try {
      addLog('info', 'Burning Vault Balance', `Requesting 1AM signature to burn $${amountVusd} vUSD...`);
      const currentAddr = session?.shieldedAddress || session?.address || walletAddress || '';
      const txHash = await burnVaultBalance(amountVusd, currentAddr);
      const updated = getLocalVaultBalance();
      setVaultBalance(updated);
      addLog('success', 'Vault Burned', `Burned $${amountVusd} vUSD from shielded vault. TX: ${txHash}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Vault burn failed';
      setError(msg);
      addLog('error', 'Vault Burn Failed', msg);
    }
  }, [session, walletAddress, addLog]);

  // ─── Analyze Strategy (Two-step flow step 1) ───────────────────────
  const analyzeStrategy = useCallback(async (
    agentId: string,
    targetAsset: string = 'ADA',
    customTradeSizeUsd?: number
  ) => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const strategy = activeStrategies.find((s) => s.agentId === agentId) || activeStrategies[0];
      if (!strategy) {
        throw new Error('No active strategy commitment found to analyze.');
      }

      const currentVault = getLocalVaultBalance();
      addLog('info', 'AI Analysis Triggered', `Running Gemini analysis on committed risk bounds for ${targetAsset} (Vault Balance: $${currentVault})...`);

      const rec = await runManualAnalysis(
        strategy.params,
        currentVault > 0 ? currentVault : 1000,
        targetAsset,
        customTradeSizeUsd
      );
      setRecommendationMap((prev) => ({ ...prev, [agentId]: rec }));

      addLog('success', 'Analysis Complete', `Recommendation: ${rec.recommendation}`);
      return rec;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Analysis failed';
      setError(msg);
      addLog('error', 'Analysis Error', msg);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, [activeStrategies, addLog]);

  // ─── Commit strategy (triggers real 1AM wallet popup) ──────────────
  const commitStrategyCircuit = useCallback(async (params: StrategyParams): Promise<string> => {
    if (!walletConnected) {
      throw new Error('Please connect your 1AM Wallet before committing a strategy.');
    }

    setIsProofGenerating(true);
    setError(null);

    try {
      addLog('info', 'Circuit Initiated',
        `Commit Risk Rules: Max ${params.maxPositionPct}% position, ${params.stopLossPct}% stop-loss (${params.timelineDays} days)`
      );

      setProofStep('1. Computing persistentHash witness commitment...');
      const hash = computeStrategyHash(params);

      setProofStep('2. Requesting 1AM Wallet transaction signature...');

      const agentId = `0xagent_${Math.random().toString(16).substring(2, 8)}`;

      // Triggers the REAL 1AM wallet extension popup
      const txHash = await executeSignedTransaction('commitStrategy', {
        agentId,
        strategyHash: hash,
        maxPositionPct: params.maxPositionPct,
        stopLossPct: params.stopLossPct,
        timelineExpiry: params.timelineExpiry.toString(),
      });

      setProofStep(`3. Transaction signed! TX: ${txHash.substring(0, 18)}…`);

      const newStrategy: ActiveStrategy = {
        id: `strat_${Date.now()}`,
        agentId,
        params,
        commitmentHash: hash,
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        status: 'active',
      };

      setActiveStrategies((prev) => [newStrategy, ...prev]);

      // Non-blocking off-chain sync to Supabase / localStorage
      syncStrategyCommitment({
        agent_id: agentId,
        commitment_hash: hash,
        wallet_address: session?.shieldedAddress || session?.address || 'mn_addr_1am',
        tx_hash: txHash,
        created_at: newStrategy.createdAt,
        status: 'active',
      }).catch((e) => console.warn('[Vogue Sync] Strategy sync error:', e));

      addLog('success', 'Strategy Committed', `TX: ${txHash} | Hash: ${hash}`);
      void postEvent({ client_event_id: newEventId(), wallet_address: session?.shieldedAddress || session?.address || 'unknown', operation: 'strategy_committed', status: 'success', tx_hash: txHash, network: (session?.network as string) || networkId });
      return hash;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Strategy commitment failed';
      console.error('[Vogue] Commit strategy error:', err);
      setError(msg);
      addLog('error', 'Circuit Failed', msg);
      throw err;
    } finally {
      setIsProofGenerating(false);
    }
  }, [walletConnected, session, addLog]);

  // ─── Execute proven trade (EZKL risk model check + 1AM wallet popup) ──
  const executeProvenTrade = useCallback(async (
    agentId: string,
    tradeSizeUsd: number = 1200,
    targetAsset?: string,
    tradeType: 'BUY' | 'SELL' | 'STOP_LOSS' = 'BUY',
    forceRiskFail: boolean = false
  ): Promise<TradeRecord | undefined> => {
    setIsProofGenerating(true);
    setError(null);

    try {
      // 0. Strict Shielded Vault Balance Requirement Check
      const currentVault = getLocalVaultBalance();
      if (currentVault <= 0 || currentVault < tradeSizeUsd) {
        const vaultErrMsg = `Insufficient Shielded Vault Balance: You have $${currentVault.toLocaleString()} vUSD available, but this trade requires $${tradeSizeUsd.toLocaleString()} vUSD. Please mint or deposit to your Shielded Vault in the 'Shielded Vault & Withdraw' tab before trading.`;
        setError(vaultErrMsg);
        addLog('error', 'Trade Blocked — Insufficient Vault', vaultErrMsg);
        throw new Error(vaultErrMsg);
      }

      const strategy = activeStrategies.find((s) => s.agentId === agentId) || activeStrategies[0];
      const maxAllowedSize = strategy ? Math.floor((currentVault * strategy.params.maxPositionPct) / 100) : currentVault;

      if (strategy && tradeSizeUsd > maxAllowedSize && !forceRiskFail) {
        const maxPosErrMsg = `Trade Size Exceeds Committed Risk Bounds: $${tradeSizeUsd} exceeds your ${strategy.params.maxPositionPct}% max position limit ($${maxAllowedSize} of $${currentVault} vault balance).`;
        setError(maxPosErrMsg);
        addLog('error', 'Trade Blocked — Exceeds Max Position', maxPosErrMsg);
        throw new Error(maxPosErrMsg);
      }

      addLog('info', 'EZKL Risk Model Evaluation', `Running EZKL ZK-ML Risk Check for agent ${agentId} ($${tradeSizeUsd} ${targetAsset || 'ADA'})...`);

      setProofStep('1. Running EZKL ZK-ML Risk Eligibility Model...');

      const asset = targetAsset || 'ADA';
      const volatilityPct = forceRiskFail ? 85 : asset === 'BTC' ? 20 : asset === 'ETH' ? 30 : asset === 'SOL' ? 38 : 22;
      const portfolioVal = currentVault;
      const positionSizePct = forceRiskFail ? 75 : Math.min(100, Math.round((tradeSizeUsd * 100) / portfolioVal));
      const stopLossDistancePct = forceRiskFail ? 15 : strategy?.params.stopLossPct ? 100 - strategy.params.stopLossPct : 92;

      const riskRes = await evaluateRiskModel({
        volatilityPct,
        positionSizePct,
        stopLossDistancePct,
      });

      if (!riskRes.passed) {
        const riskErrMsg = `Trade blocked by ZK Risk Model: Risk parameters exceed safety threshold (Score: ${riskRes.score} > 35.0). ${riskRes.details}`;
        setError(riskErrMsg);
        addLog('error', 'ZK Risk Check Failed', riskErrMsg);
        throw new Error(riskErrMsg);
      }

      addLog('success', 'ZK Risk Check Passed', `EZKL Proof Verified: ${riskRes.proofHash.substring(0, 18)}… | Score: ${riskRes.score}`);

      const basePrice = asset === 'BTC' ? 61250 : asset === 'ETH' ? 3300 : asset === 'SOL' ? 145 : asset === 'tNIGHT' ? 0.85 : 0.421;

      // ============================================================================
      // ASSUMPTION NOTICE: ADA, SOL, BTC, ETH, and Stock tickers (AAPL) are paper
      // positions valued against the trader's private vault balance. No real custody,
      // bridging, or order routing is executed for non-Midnight assets.
      // ============================================================================

      const txHash = await executeSignedTransaction('executeTrade', {
        agentId,
        tradeId: `0xtrade_${Math.random().toString(16).substring(2, 7)}`,
        tradeSizeUsd,
        currentTime: Math.floor(Date.now() / 1000),
      });

      // Draw down vault balance upon trade execution and sync to Supabase
      const currentAddr = session?.shieldedAddress || session?.address || walletAddress || '';
      const updatedVault = subtractFromLocalVaultBalance(tradeSizeUsd, currentAddr);
      setVaultBalance(updatedVault);

      const isExecuted = tradeSizeUsd <= 5000;
      const simulatedPnlPct = isExecuted ? Number((Math.random() * 8 + 1.5).toFixed(2)) : 0;
      const simulatedPnlUsd = isExecuted ? Number(((tradeSizeUsd * simulatedPnlPct) / 100).toFixed(2)) : 0;

      const newTrade: TradeRecord = {
        id: `0xtrade_${Math.random().toString(16).substring(2, 7)}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        asset,
        type: tradeType,
        sizeUsd: tradeSizeUsd,
        priceUsd: basePrice,
        pnlUsd: simulatedPnlUsd,
        pnlPct: simulatedPnlPct,
        status: isExecuted ? 'executed' : 'rejected',
        proofTimeMs: Math.floor(350 + Math.random() * 150),
        commitmentHash: strategy?.commitmentHash || txHash,
        txHash,
        rpcStatus: 'pending',
      };

      setTrades((prev) => [newTrade, ...prev]);

      // Non-blocking off-chain sync to Supabase / localStorage
      syncTradeExecution({
        trade_id: newTrade.id,
        agent_id: agentId,
        commitment_hash: newTrade.commitmentHash,
        tx_hash: txHash,
        asset,
        status: newTrade.status,
        proof_time_ms: newTrade.proofTimeMs,
        timestamp: newTrade.timestamp,
      }).catch((e) => console.warn('[Vogue Sync] Trade sync error:', e));

      addLog('success', 'Trade Proven', `Trade ${newTrade.id} — ${asset} $${tradeSizeUsd} — TX: ${txHash}`);
      void postEvent({ client_event_id: newEventId(), wallet_address: session?.shieldedAddress || session?.address || 'unknown', operation: 'trade_executed', status: 'success', tx_hash: txHash, network: networkId });


      // Async RPC confirmation
      const net = networkId === 'preprod' ? 'preprod' : 'preview';
      confirmTransaction(txHash, net).then((rpcState) => {
        if (rpcState === 'confirmed') {
          setTrades((prev) =>
            prev.map((t) => (t.id === newTrade.id ? { ...t, rpcStatus: 'confirmed' } : t))
          );
          addLog('info', 'RPC Confirmed', `Transaction ${txHash.substring(0, 18)}… confirmed by Midnight RPC.`);
        }
      });

      return newTrade;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Trade execution failed';
      setError(msg);
      addLog('error', 'Trade Execution Failed', msg);
      return undefined;
    } finally {
      setIsProofGenerating(false);
    }
  }, [activeStrategies, networkId, session, walletAddress, addLog]);

  return {
    // Wallet state
    detectedWallets,
    isWalletAvailable,
    walletConnected,
    walletAddress,
    shieldedAddress,
    walletName,
    networkId,
    detected1AMNetwork: session?.detected1AMNetwork ?? networkId,
    isNetworkAligned: session ? session.isNetworkAligned : true,
    balance,
    shieldedBalance,
    unshieldedBalance,
    dustBalance,
    vaultBalance,
    isConnecting,
    error,

    // Health
    proofServerUp,
    dustReady,
    isSyncing,

    // Explorer
    latestBlock,

    // UI
    isModalOpen,
    setIsModalOpen,
    protocolLogs,

    // Actions
    scanWallets,
    handleSelectNetwork,
    connectWallet,
    disconnectWallet,
    clearWalletCache,
    mintVault,
    burnVault,

    // Strategy & trading
    activeStrategies,
    trades,
    isProofGenerating,
    proofStep,
    isAnalyzing,
    recommendationMap,
    analyzeStrategy,
    commitStrategyCircuit,
    executeProvenTrade,

    // Compat shims
    windowMidnightKeys: detectedWallets.map((w) => w.id),
    serviceConfig: session?.serviceConfig ?? null,
    addProtocolLog: addLog,
  };
}

