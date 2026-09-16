import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Radio,
  Activity,
  ShieldCheck,
  Lock,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Zap,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Terminal,
  RefreshCw,
  Plus,
  X,
  Eye,
  Percent,
  Sliders
} from 'lucide-react';
import {
  EnclaveTradeSignal,
  MirroredTradeExecution,
  EnclaveVendor,
  TradeDirection,
  getAllEnclaveSignals,
  getAllMirroredTrades,
  emitConfidentialTradeSignal,
  executeBatchProportionalMirroring,
  executeProportionalMirrorTrade,
  resolveConfidentialTrade,
} from '../lib/enclave-runtime';
import {
  getAllAlphaStrategies,
  getActiveSubscriptions,
  AlphaStrategy,
  AlphaSubscription,
} from '../lib/alpha-engine';

interface AlphaEnclaveFeedProps {
  walletAddress: string | null;
  walletConnected: boolean;
  vaultBalance: number;
  onConnectWallet: () => void;
  onRefreshVault?: () => void;
}

export const AlphaEnclaveFeed: React.FC<AlphaEnclaveFeedProps> = ({
  walletAddress,
  walletConnected,
  vaultBalance,
  onConnectWallet,
  onRefreshVault,
}) => {
  const [signals, setSignals] = useState<EnclaveTradeSignal[]>([]);
  const [mirroredTrades, setMirroredTrades] = useState<MirroredTradeExecution[]>([]);
  const [strategies, setStrategies] = useState<AlphaStrategy[]>([]);
  const [subscriptions, setSubscriptions] = useState<AlphaSubscription[]>([]);

  // Emission Modal State
  const [isEmitModalOpen, setIsEmitModalOpen] = useState(false);
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>('');
  const [assetSymbol, setAssetSymbol] = useState<string>('BTC');
  const [direction, setDirection] = useState<TradeDirection>('LONG');
  const [entryPrice, setEntryPrice] = useState<number>(68500);
  const [targetPrice, setTargetPrice] = useState<number>(73500);
  const [stopLossPrice, setStopLossPrice] = useState<number>(65000);
  const [masterNotional, setMasterNotional] = useState<number>(50000);
  const [enclaveVendor, setEnclaveVendor] = useState<EnclaveVendor>('INTEL_SGX');
  const [isEmitting, setIsEmitting] = useState(false);
  const [emitError, setEmitError] = useState<string | null>(null);

  // Custom Resolution State
  const [customExitPrice, setCustomExitPrice] = useState<{ [signalId: string]: number }>({});
  const [resolvingSignalId, setResolvingSignalId] = useState<string | null>(null);

  const loadData = () => {
    setSignals(getAllEnclaveSignals());
    setMirroredTrades(getAllMirroredTrades());
    const strats = getAllAlphaStrategies();
    setStrategies(strats);
    if (strats.length > 0 && !selectedStrategyId) {
      setSelectedStrategyId(strats[0].id);
    }
    setSubscriptions(getActiveSubscriptions(walletAddress || undefined));
  };

  useEffect(() => {
    loadData();
  }, [walletAddress]);

  const handleEmitSignal = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmitError(null);
    setIsEmitting(true);

    try {
      const strat = strategies.find((s) => s.id === selectedStrategyId);
      if (!strat) throw new Error('Selected strategy not found.');

      // 1. Emit confidential signal from enclave
      const newSignal = await emitConfidentialTradeSignal({
        strategyId: selectedStrategyId,
        assetSymbol,
        direction,
        entryPriceUsd: Number(entryPrice),
        targetPriceUsd: Number(targetPrice),
        stopLossPriceUsd: Number(stopLossPrice),
        masterPositionNotionalUsd: Number(masterNotional),
        creatorAddress: strat.creator,
        enclaveVendor,
      });

      // 2. Automatically trigger batch proportional trade mirroring
      await executeBatchProportionalMirroring(newSignal.signalId);

      setIsEmitModalOpen(false);
      loadData();
      if (onRefreshVault) onRefreshVault();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setEmitError(msg);
    } finally {
      setIsEmitting(false);
    }
  };

  const handleResolveSignal = (signalId: string, exitPriceUsd: number) => {
    try {
      setResolvingSignalId(signalId);
      resolveConfidentialTrade(signalId, exitPriceUsd);
      loadData();
      if (onRefreshVault) onRefreshVault();
    } catch (err) {
      console.warn('Trade resolution error:', err);
    } finally {
      setResolvingSignalId(null);
    }
  };

  const handleSeedDemoSignals = async () => {
    if (strategies.length === 0) return;
    try {
      const strat1 = strategies[0];
      const strat2 = strategies[1] || strategies[0];

      const s1 = await emitConfidentialTradeSignal({
        strategyId: strat1.id,
        assetSymbol: 'BTC',
        direction: 'LONG',
        entryPriceUsd: 68200,
        targetPriceUsd: 72500,
        stopLossPriceUsd: 65800,
        masterPositionNotionalUsd: 45000,
        creatorAddress: strat1.creator,
        enclaveVendor: 'INTEL_SGX',
      });
      await executeBatchProportionalMirroring(s1.signalId);

      const s2 = await emitConfidentialTradeSignal({
        strategyId: strat2.id,
        assetSymbol: 'ETH',
        direction: 'SHORT',
        entryPriceUsd: 3550,
        targetPriceUsd: 3250,
        stopLossPriceUsd: 3720,
        masterPositionNotionalUsd: 25000,
        creatorAddress: strat2.creator,
        enclaveVendor: 'AWS_NITRO',
      });
      await executeBatchProportionalMirroring(s2.signalId);

      loadData();
    } catch (err) {
      console.warn('Demo seeding error:', err);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner: Enclave Status & Action */}
      <div className="light-glass border border-white/80 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold">
            <Radio className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
            <span>Hardware TEE Attested • Zero Prompt Disclosure</span>
          </div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">
            Confidential Enclave Live Trade Feed
          </h2>
          <p className="text-xs text-gray-600 font-medium max-w-2xl leading-relaxed">
            Proprietary quant algorithms execute inside hardware-isolated Enclaves (Intel SGX / AWS Nitro).
            Signals commit directly to Midnight consensus; subscribers mirror proportionally with personal stop-loss guards.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {signals.length === 0 && (
            <button
              onClick={handleSeedDemoSignals}
              className="py-2.5 px-4 rounded-2xl bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Seed Enclave Signals</span>
            </button>
          )}

          <button
            onClick={() => setIsEmitModalOpen(true)}
            className="py-2.5 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Cpu className="w-4 h-4 text-indigo-200" />
            <span>Emit Enclave Signal</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="light-glass border border-white/80 rounded-2xl p-4 space-y-1 shadow-xs">
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">
            ACTIVE ENCLAVE SIGNALS
          </span>
          <span className="text-2xl font-black text-gray-900">
            {signals.filter((s) => s.status === 'ACTIVE').length}
          </span>
          <span className="text-[10px] text-indigo-600 font-semibold block">
            {signals.length} Total Emitted
          </span>
        </div>
        <div className="light-glass border border-white/80 rounded-2xl p-4 space-y-1 shadow-xs">
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">
            MIRRORED VAULT TRADES
          </span>
          <span className="text-2xl font-black text-gray-900">
            {mirroredTrades.length}
          </span>
          <span className="text-[10px] text-emerald-600 font-semibold block">
            {mirroredTrades.filter((m) => m.status === 'EXECUTED').length} Active in Vaults
          </span>
        </div>
        <div className="light-glass border border-white/80 rounded-2xl p-4 space-y-1 shadow-xs">
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">
            TEE ATTESTATION RATE
          </span>
          <span className="text-2xl font-black text-emerald-600">100%</span>
          <span className="text-[10px] text-gray-500 font-semibold block">
            Intel SGX & AWS Nitro
          </span>
        </div>
        <div className="light-glass border border-white/80 rounded-2xl p-4 space-y-1 shadow-xs">
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">
            STOP-LOSS PROTECTION
          </span>
          <span className="text-2xl font-black text-orange-600">Active</span>
          <span className="text-[10px] text-orange-700 font-semibold block">
            Personal Vault Guards
          </span>
        </div>
      </div>

      {/* Signals List & Execution Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-600" />
            <span>Confidential Signal Stream</span>
          </h3>
          <button
            onClick={loadData}
            className="text-xs text-gray-500 hover:text-gray-800 flex items-center gap-1 font-medium transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        {signals.length === 0 ? (
          <div className="light-glass border border-white/80 rounded-3xl p-10 text-center space-y-3">
            <Cpu className="w-10 h-10 text-indigo-400 mx-auto" />
            <h4 className="text-base font-extrabold text-gray-900">No Enclave Signals Emitted Yet</h4>
            <p className="text-xs text-gray-600 font-medium max-w-md mx-auto">
              Simulate an attested quant model execution to emit an encrypted trade commitment to Midnight, or seed demo signals.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={handleSeedDemoSignals}
                className="py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Seed Demo Signals
              </button>
              <button
                onClick={() => setIsEmitModalOpen(true)}
                className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Emit Custom Signal
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {signals.map((signal) => {
              const strat = strategies.find((s) => s.id === signal.strategyId);
              const relatedExecutions = mirroredTrades.filter((m) => m.signalId === signal.signalId);

              return (
                <div
                  key={signal.signalId}
                  className={`light-glass border ${
                    signal.status === 'ACTIVE'
                      ? 'border-indigo-200/90 shadow-sm'
                      : signal.status === 'RESOLVED_PROFIT'
                      ? 'border-emerald-200'
                      : 'border-gray-200'
                  } rounded-3xl p-5 sm:p-6 space-y-4 transition-all`}
                >
                  {/* Signal Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs ${
                          signal.direction === 'LONG'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-purple-50 text-purple-700 border border-purple-200'
                        }`}
                      >
                        {signal.direction === 'LONG' ? (
                          <ArrowUpRight className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <ArrowDownRight className="w-5 h-5 text-purple-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-base text-gray-900">
                            {signal.assetSymbol}/vUSD {signal.direction}
                          </h4>
                          <span className="text-xs font-bold text-gray-500">• {signal.strategyName}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 border border-indigo-200 text-indigo-700 font-mono">
                            {signal.enclaveVendor}
                          </span>
                        </div>
                        <span className="font-mono text-[10px] text-gray-400">
                          Commitment: {signal.commitmentHash.substring(0, 24)}...
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      {signal.status === 'ACTIVE' ? (
                        <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 border border-blue-200 text-blue-800 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                          ACTIVE SIGNAL
                        </span>
                      ) : signal.status === 'RESOLVED_PROFIT' ? (
                        <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          RESOLVED WIN (${signal.exitPriceUsd?.toLocaleString()})
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-red-50 border border-red-200 text-red-800 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                          RESOLVED LOSS (${signal.exitPriceUsd?.toLocaleString()})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Signal Parameters Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/70 border border-gray-100 rounded-2xl p-3 text-center">
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold block uppercase">ENTRY PRICE</span>
                      <span className="text-sm font-black text-gray-900">${signal.entryPriceUsd.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold block uppercase">TARGET (TP)</span>
                      <span className="text-sm font-black text-emerald-600">${signal.targetPriceUsd.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold block uppercase">MASTER STOP-LOSS</span>
                      <span className="text-sm font-black text-red-600">${signal.stopLossPriceUsd.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold block uppercase">MASTER NOTIONAL</span>
                      <span className="text-sm font-black text-indigo-600">${signal.masterPositionNotionalUsd.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Attestation & Proportional Mirroring Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-gray-50/80 p-3 rounded-2xl border border-gray-200/70">
                    <div className="flex items-center gap-2 text-gray-600 font-medium">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-mono text-[11px] truncate max-w-xs">
                        Attestation Quote: {signal.attestationQuote.substring(0, 32)}...
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 font-semibold text-[11px]">
                        Mirrored by {relatedExecutions.length} Subscriber Vaults
                      </span>
                    </div>
                  </div>

                  {/* Interactive Resolution Panel (for active signals) */}
                  {signal.status === 'ACTIVE' && (
                    <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-3.5 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-indigo-950 flex items-center gap-1.5">
                          <Play className="w-3.5 h-3.5 text-indigo-600" />
                          Resolve Signal & Trigger High-Water Mark Settlement:
                        </span>
                        <span className="text-[11px] text-indigo-600 font-semibold">
                          Non-Custodial Automatic Execution
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {/* Quick TP button */}
                        <button
                          onClick={() => handleResolveSignal(signal.signalId, signal.targetPriceUsd)}
                          disabled={resolvingSignalId === signal.signalId}
                          className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Hit Target (${signal.targetPriceUsd.toLocaleString()})</span>
                        </button>

                        {/* Quick SL button */}
                        <button
                          onClick={() => handleResolveSignal(signal.signalId, signal.stopLossPriceUsd)}
                          disabled={resolvingSignalId === signal.signalId}
                          className="py-1.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Hit Stop-Loss (${signal.stopLossPriceUsd.toLocaleString()})</span>
                        </button>

                        {/* Custom Price Resolver */}
                        <div className="flex items-center gap-1.5 ml-auto">
                          <input
                            type="number"
                            placeholder="Custom Exit $"
                            value={customExitPrice[signal.signalId] || ''}
                            onChange={(e) =>
                              setCustomExitPrice({
                                ...customExitPrice,
                                [signal.signalId]: Number(e.target.value),
                              })
                            }
                            className="w-28 px-2.5 py-1.5 bg-white border border-gray-300 rounded-xl text-xs font-bold focus:outline-none focus:border-indigo-500"
                          />
                          <button
                            onClick={() => {
                              const exit = customExitPrice[signal.signalId];
                              if (exit && exit > 0) {
                                handleResolveSignal(signal.signalId, exit);
                              }
                            }}
                            disabled={!customExitPrice[signal.signalId] || resolvingSignalId === signal.signalId}
                            className="py-1.5 px-3 rounded-xl bg-gray-900 hover:bg-black disabled:opacity-40 text-white text-xs font-bold transition-all cursor-pointer"
                          >
                            Resolve
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Related Mirrored Executions Details */}
                  {relatedExecutions.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                        Subscriber Vault Mirror Executions ({relatedExecutions.length})
                      </span>
                      <div className="space-y-1.5 overflow-x-auto">
                        {relatedExecutions.map((exec) => (
                          <div
                            key={exec.mirrorId}
                            className="flex items-center justify-between gap-3 text-xs bg-white/80 p-2.5 rounded-xl border border-gray-100 font-medium"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[11px] text-gray-600">
                                {exec.followerAddress.substring(0, 10)}...
                              </span>
                              <span className="font-bold text-gray-900">
                                ${exec.proportionalSizeUsd.toLocaleString()} vUSD ({exec.proportionalAllocationBps / 100}%)
                              </span>
                              {exec.personalStopLossTriggered && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                  Personal SL Protected (${exec.effectiveStopLossPriceUsd})
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-3">
                              {exec.status === 'CLOSED_PROFIT' ? (
                                <span className="font-extrabold text-emerald-700">
                                  +${exec.netProfitUsd} vUSD (Fee: ${exec.performanceFeeDeductedUsd})
                                </span>
                              ) : exec.status === 'CLOSED_LOSS' || exec.status === 'STOPPED_OUT' ? (
                                <span className="font-extrabold text-red-600">
                                  -${Math.abs(exec.followerPnlUsd || 0)} vUSD (0 Fee)
                                </span>
                              ) : (
                                <span className="font-semibold text-blue-700">
                                  Position Open
                                </span>
                              )}
                              <span className="font-mono text-[10px] text-gray-400 truncate max-w-[100px]">
                                {exec.midnightMirrorTxHash.substring(0, 14)}...
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── MODAL: EMIT CONFIDENTIAL SIGNAL ─────────────────────────────── */}
      {isEmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden my-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-gray-900">
                    Emit Enclave Trade Signal
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">
                    Hardware TEE Sandbox Execution Simulation
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEmitModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {emitError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-2xl flex items-center gap-2 font-medium">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{emitError}</span>
              </div>
            )}

            <form onSubmit={handleEmitSignal} className="space-y-4">
              {/* Strategy Selector */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Target Strategy
                </label>
                <select
                  value={selectedStrategyId}
                  onChange={(e) => setSelectedStrategyId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-indigo-500 font-medium"
                >
                  {strategies.map((strat) => (
                    <option key={strat.id} value={strat.id}>
                      {strat.name} ({strat.category}) • Fee: {strat.performanceFeePct}%
                    </option>
                  ))}
                </select>
              </div>

              {/* Hardware TEE Vendor */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Enclave Execution Environment
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['INTEL_SGX', 'AWS_NITRO', 'CLIENT_TEE'] as EnclaveVendor[]).map((vendor) => (
                    <button
                      type="button"
                      key={vendor}
                      onClick={() => setEnclaveVendor(vendor)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        enclaveVendor === vendor
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {vendor === 'INTEL_SGX' ? 'Intel SGX' : vendor === 'AWS_NITRO' ? 'AWS Nitro' : 'Client TEE'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Asset and Direction */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Asset</label>
                  <select
                    value={assetSymbol}
                    onChange={(e) => {
                      const sym = e.target.value;
                      setAssetSymbol(sym);
                      if (sym === 'BTC') {
                        setEntryPrice(68500);
                        setTargetPrice(73500);
                        setStopLossPrice(65000);
                      } else if (sym === 'ETH') {
                        setEntryPrice(3500);
                        setTargetPrice(3850);
                        setStopLossPrice(3300);
                      } else if (sym === 'SOL') {
                        setEntryPrice(155);
                        setTargetPrice(180);
                        setStopLossPrice(140);
                      } else if (sym === 'ADA') {
                        setEntryPrice(1.05);
                        setTargetPrice(1.35);
                        setStopLossPrice(0.88);
                      }
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-indigo-500 font-bold"
                  >
                    <option value="BTC">BTC / vUSD</option>
                    <option value="ETH">ETH / vUSD</option>
                    <option value="SOL">SOL / vUSD</option>
                    <option value="ADA">ADA / vUSD</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Direction</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setDirection('LONG')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                        direction === 'LONG'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white text-gray-700 border-gray-200'
                      }`}
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>LONG</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDirection('SHORT')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                        direction === 'SHORT'
                          ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                          : 'bg-white text-gray-700 border-gray-200'
                      }`}
                    >
                      <ArrowDownRight className="w-3.5 h-3.5" />
                      <span>SHORT</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Price Limits */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">Entry ($)</label>
                  <input
                    type="number"
                    step="any"
                    value={entryPrice}
                    onChange={(e) => setEntryPrice(Number(e.target.value))}
                    className="w-full px-2.5 py-2 rounded-xl border border-gray-300 text-xs font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">Target ($)</label>
                  <input
                    type="number"
                    step="any"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(Number(e.target.value))}
                    className="w-full px-2.5 py-2 rounded-xl border border-gray-300 text-xs font-bold text-emerald-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">Stop-Loss ($)</label>
                  <input
                    type="number"
                    step="any"
                    value={stopLossPrice}
                    onChange={(e) => setStopLossPrice(Number(e.target.value))}
                    className="w-full px-2.5 py-2 rounded-xl border border-gray-300 text-xs font-bold text-red-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Master Position Notional */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Master Position Notional ($vUSD)
                </label>
                <input
                  type="number"
                  step={1000}
                  value={masterNotional}
                  onChange={(e) => setMasterNotional(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-bold focus:outline-none focus:border-indigo-500"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">
                  Followers will automatically mirror this notional proportionally according to their vault stakes.
                </span>
              </div>

              <button
                type="submit"
                disabled={isEmitting}
                className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isEmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Broadcasting to Midnight Circuit...</span>
                  </>
                ) : (
                  <>
                    <Cpu className="w-4 h-4 text-indigo-200" />
                    <span>Emit & Auto-Mirror to Subscriber Vaults</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
