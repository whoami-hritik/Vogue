import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Sparkles,
  ShieldCheck,
  Lock,
  ArrowUpRight,
  TrendingUp,
  Award,
  Filter,
  ArrowDownUp,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  Info,
  DollarSign,
  Play,
  RotateCcw,
  PlusCircle,
  X,
  Cpu
} from 'lucide-react';
import {
  AlphaStrategy,
  AlphaSubscription,
  getAllAlphaStrategies,
  getActiveSubscriptions,
  subscribeToAlphaStrategy,
  settleSubscriberPerformanceFee,
  cancelAlphaSubscription,
  FeeSettlementResult
} from '../lib/alpha-engine';
import { AlphaPublisherModal } from './AlphaPublisherModal';
import { AlphaEnclaveFeed } from './AlphaEnclaveFeed';

interface AlphaMarketplaceProps {
  walletConnected: boolean;
  walletAddress: string | null;
  vaultBalance: number;
  onConnectWallet: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const AlphaMarketplace: React.FC<AlphaMarketplaceProps> = ({
  walletConnected,
  walletAddress,
  vaultBalance,
  onConnectWallet,
  onNavigateTab,
}) => {
  const [strategies, setStrategies] = useState<AlphaStrategy[]>([]);
  const [subscriptions, setSubscriptions] = useState<AlphaSubscription[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'marketplace' | 'my-subscriptions' | 'enclave-feed'>('marketplace');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'sharpe' | 'roi' | 'drawdown' | 'capital'>('sharpe');

  // Modals
  const [isPublisherOpen, setIsPublisherOpen] = useState(false);
  const [inspectStrategy, setInspectStrategy] = useState<AlphaStrategy | null>(null);
  const [subscribingStrategy, setSubscribingStrategy] = useState<AlphaStrategy | null>(null);

  // Subscribe Form State
  const [allocatedCollateral, setAllocatedCollateral] = useState<number>(500);
  const [maxTradeAllocation, setMaxTradeAllocation] = useState<number>(150);
  const [personalStopLoss, setPersonalStopLoss] = useState<number>(5);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subError, setSubError] = useState<string | null>(null);
  const [subSuccessMsg, setSubSuccessMsg] = useState<string | null>(null);

  // Trade Simulation for Followers
  const [simulationResult, setSimulationResult] = useState<{
    subId: string;
    result: FeeSettlementResult;
    pnl: number;
  } | null>(null);

  const loadData = () => {
    const all = getAllAlphaStrategies();
    setStrategies(all);
    const active = getActiveSubscriptions(walletAddress || undefined);
    setSubscriptions(active);
  };

  useEffect(() => {
    loadData();
  }, [walletAddress]);

  // Filter & Sort
  const filteredStrategies = strategies.filter((s) => {
    if (categoryFilter === 'ALL') return true;
    return s.category === categoryFilter;
  });

  const sortedStrategies = [...filteredStrategies].sort((a, b) => {
    if (sortBy === 'sharpe') return b.metrics.sharpeRatio - a.metrics.sharpeRatio;
    if (sortBy === 'roi') return b.metrics.roiPct - a.metrics.roiPct;
    if (sortBy === 'drawdown') return a.metrics.maxDrawdownPct - b.metrics.maxDrawdownPct;
    if (sortBy === 'capital') return b.totalMirroredCapitalUsd - a.totalMirroredCapitalUsd;
    return 0;
  });

  const handleOpenSubscribe = (strat: AlphaStrategy) => {
    setSubscribingStrategy(strat);
    setAllocatedCollateral(Math.max(strat.minFollowerStakeUsd, 500));
    setMaxTradeAllocation(Math.round(Math.max(strat.minFollowerStakeUsd, 500) * 0.25));
    setSubError(null);
    setSubSuccessMsg(null);
  };

  const handleExecuteSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscribingStrategy) return;
    if (!walletConnected) {
      onConnectWallet();
      return;
    }

    setSubError(null);
    setIsSubscribing(true);

    try {
      await subscribeToAlphaStrategy(
        subscribingStrategy.id,
        walletAddress || '0xanon_follower',
        allocatedCollateral,
        maxTradeAllocation,
        personalStopLoss
      );

      setSubSuccessMsg(
        `Successfully mirrored ${subscribingStrategy.name}! Your vault is now blindly copying trades.`
      );
      loadData();
      setTimeout(() => {
        setSubscribingStrategy(null);
        setActiveSubTab('my-subscriptions');
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Subscription failed';
      setSubError(msg);
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleCancelSubscription = (subId: string) => {
    const success = cancelAlphaSubscription(subId);
    if (success) {
      loadData();
    }
  };

  const handleSimulateTrade = (subId: string, pnl: number) => {
    try {
      const res = settleSubscriberPerformanceFee(subId, pnl);
      setSimulationResult({ subId, result: res, pnl });
      loadData();
    } catch (err) {
      console.warn('Simulation error:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 font-sans pb-16">
      {/* Hero Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-gray-200/80">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100/70 border border-orange-200 text-orange-800 text-xs font-bold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-orange-600" />
            <span>Zero-Knowledge Proof of Alpha (PoA) Marketplace</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Confidential Alpha & Blind Copy-Trading
          </h1>
          <p className="text-sm text-gray-600 font-medium max-w-2xl leading-relaxed">
            Follow mathematical trading track records proven by Midnight consensus circuits.
            Zero prompt disclosure, non-custodial execution, and High-Water Mark performance fees.
          </p>
        </div>

        {/* Action Buttons & Tab Switch */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="bg-white/80 border border-gray-200 p-1 rounded-2xl flex items-center shadow-xs">
            <button
              onClick={() => setActiveSubTab('marketplace')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'marketplace'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Alpha Leaderboard
            </button>
            <button
              onClick={() => setActiveSubTab('my-subscriptions')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'my-subscriptions'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span>My Subscriptions</span>
              {subscriptions.length > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                  activeSubTab === 'my-subscriptions' ? 'bg-white text-orange-600' : 'bg-orange-100 text-orange-700'
                }`}>
                  {subscriptions.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveSubTab('enclave-feed')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'enclave-feed'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Enclave Feed</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </button>
          </div>

          <button
            onClick={() => setIsPublisherOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-gray-900 hover:bg-black text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-orange-400" />
            <span>Publish Quant Strategy</span>
          </button>
        </div>
      </div>

      {/* Protocol Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="light-glass border border-white/80 rounded-2xl p-4 space-y-1 shadow-xs">
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">
            VERIFIED ALPHA VOLUME
          </span>
          <span className="text-2xl font-extrabold text-gray-900">$2,653,700</span>
          <span className="text-[10px] text-emerald-700 font-semibold block">↑ Proven On-Chain</span>
        </div>
        <div className="light-glass border border-white/80 rounded-2xl p-4 space-y-1 shadow-xs">
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">
            AVERAGE SHARPE RATIO
          </span>
          <span className="text-2xl font-extrabold text-gray-900">3.15</span>
          <span className="text-[10px] text-orange-600 font-semibold block">Institutional Tier</span>
        </div>
        <div className="light-glass border border-white/80 rounded-2xl p-4 space-y-1 shadow-xs">
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">
            TOTAL MIRRORED CAPITAL
          </span>
          <span className="text-2xl font-extrabold text-gray-900">$2.65M vUSD</span>
          <span className="text-[10px] text-indigo-600 font-semibold block">Non-Custodial Vaults</span>
        </div>
        <div className="light-glass border border-white/80 rounded-2xl p-4 space-y-1 shadow-xs">
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">
            IP LEAKAGE RATE
          </span>
          <span className="text-2xl font-extrabold text-emerald-600">0.00%</span>
          <span className="text-[10px] text-emerald-700 font-semibold block">100% ZK Concealed</span>
        </div>
      </div>

      {/* ─── TAB 1: MARKETPLACE LEADERBOARD ──────────────────────────────── */}
      {activeSubTab === 'marketplace' && (
        <div className="space-y-6">
          {/* Controls: Category Filter & Sort Dropdown */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/60 border border-gray-200/80 p-3 rounded-2xl shadow-xs">
            {/* Categories */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {['ALL', 'MOMENTUM', 'STAT_ARB', 'MEAN_REVERSION', 'MACRO', 'DELTA_NEUTRAL'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    categoryFilter === cat
                      ? 'bg-gray-900 text-white shadow-xs'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {cat.replace('_', ' ')}
                </button>
              ))}
            </div>

            {/* Sorting */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
                <ArrowDownUp className="w-3.5 h-3.5" /> Sort:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white border border-gray-300 text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none focus:border-orange-500 cursor-pointer"
              >
                <option value="sharpe">Sharpe Ratio (Highest)</option>
                <option value="roi">90D ROI % (Highest)</option>
                <option value="drawdown">Max Drawdown (Lowest)</option>
                <option value="capital">Mirrored Capital (Largest)</option>
              </select>
            </div>
          </div>

          {/* Strategy Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sortedStrategies.map((strat) => {
              const isSubscribed = subscriptions.some((sub) => sub.strategyId === strat.id);

              return (
                <div
                  key={strat.id}
                  className="light-glass border border-white/80 hover:border-orange-300/80 rounded-3xl p-6 space-y-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden group flex flex-col justify-between"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-orange-400/5 group-hover:bg-orange-400/10 blur-2xl rounded-full transition-all pointer-events-none" />

                  <div className="space-y-4">
                    {/* Top Row: Name, Creator & Badges */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-extrabold text-gray-900 group-hover:text-orange-600 transition-colors">
                            {strat.name}
                          </h3>
                          {strat.isCurated && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-orange-100 text-orange-800 border border-orange-200">
                              CURATED
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                          <span>by</span>
                          <span className="font-bold text-gray-800">{strat.creatorShort}</span>
                          <span>•</span>
                          <span className="font-mono text-[11px] text-gray-400 truncate max-w-[120px]">
                            {strat.creator.substring(0, 10)}...
                          </span>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700 border border-gray-200 shrink-0">
                        {strat.category.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-gray-600 leading-relaxed line-clamp-2 font-medium">
                      {strat.description}
                    </p>

                    {/* Execution Venues */}
                    <div className="flex flex-wrap gap-1.5">
                      {strat.executionVenues.map((v) => (
                        <span
                          key={v}
                          className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white/70 border border-gray-200 text-gray-600"
                        >
                          ⚡ {v}
                        </span>
                      ))}
                    </div>

                    {/* Glowing Core Metrics Grid */}
                    <div className="grid grid-cols-4 gap-2 bg-white/60 border border-gray-100 rounded-2xl p-3 text-center">
                      <div>
                        <span className="text-[10px] text-gray-400 font-bold block uppercase">90D ROI</span>
                        <span className="text-sm font-black text-emerald-700">+{strat.metrics.roiPct}%</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 font-bold block uppercase">SHARPE</span>
                        <span className="text-sm font-black text-gray-900">{strat.metrics.sharpeRatio}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 font-bold block uppercase">MAX DD</span>
                        <span className="text-sm font-black text-orange-600">-{strat.metrics.maxDrawdownPct}%</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 font-bold block uppercase">WIN RATE</span>
                        <span className="text-sm font-black text-teal-700">{strat.metrics.winRatePct}%</span>
                      </div>
                    </div>

                    {/* Capital & Fee Metadata */}
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-100 text-gray-500">
                      <div>
                        <span>Mirrored: </span>
                        <span className="font-bold text-gray-800">
                          ${strat.totalMirroredCapitalUsd.toLocaleString()} vUSD
                        </span>
                        <span className="text-gray-400"> ({strat.activeFollowersCount} followers)</span>
                      </div>
                      <div className="font-bold text-orange-600">
                        {strat.performanceFeePct}% HWM Fee
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center gap-3 pt-3">
                    <button
                      onClick={() => setInspectStrategy(strat)}
                      className="flex-1 py-2.5 px-3 rounded-2xl bg-white/80 hover:bg-white border border-gray-200 text-gray-700 font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Verify ZK Proof</span>
                    </button>

                    {isSubscribed ? (
                      <button
                        onClick={() => setActiveSubTab('my-subscriptions')}
                        className="flex-1 py-2.5 px-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Active Mirror</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenSubscribe(strat)}
                        className="flex-1 py-2.5 px-3 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm hover:shadow transition-all cursor-pointer"
                      >
                        <Lock className="w-3.5 h-3.5 text-orange-200" />
                        <span>Blind Mirror</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── TAB 2: MY ACTIVE SUBSCRIPTIONS ──────────────────────────────── */}
      {activeSubTab === 'my-subscriptions' && (
        <div className="space-y-6">
          {subscriptions.length === 0 ? (
            <div className="light-glass border border-white/80 rounded-3xl p-12 text-center space-y-4 max-w-md mx-auto">
              <div className="w-14 h-14 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
                <Trophy className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-extrabold text-gray-900">No Active Alpha Subscriptions</h3>
              <p className="text-xs text-gray-600 font-medium leading-relaxed">
                You are not currently mirror-trading any quant strategies. Browse the Alpha Leaderboard to allocate shielded collateral and start blind copying proven models.
              </p>
              <button
                onClick={() => setActiveSubTab('marketplace')}
                className="py-2.5 px-6 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Browse Alpha Leaderboard
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                  Active Shielded Subscriptions ({subscriptions.length})
                </h2>
                <span className="text-xs text-gray-500 font-medium">
                  Shielded Vault Balance: <strong className="text-orange-600 font-extrabold">${vaultBalance.toLocaleString()} vUSD</strong>
                </span>
              </div>

              {/* Simulation Result Alert */}
              {simulationResult && (
                <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 text-xs space-y-2">
                  <div className="flex items-center justify-between font-bold text-orange-900">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-orange-600" />
                      Trade Signal Mirrored Outcome: {simulationResult.pnl > 0 ? `+$${simulationResult.pnl}` : `-$${Math.abs(simulationResult.pnl)}`}
                    </span>
                    <button
                      onClick={() => setSimulationResult(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-gray-700">
                    <div>
                      <span className="text-gray-400 block text-[10px] font-bold">FEE DEDUCTED</span>
                      <span className="font-extrabold text-red-600">${simulationResult.result.feeDeductedUsd} vUSD</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] font-bold">NET PROFIT TO VAULT</span>
                      <span className="font-extrabold text-emerald-700">${simulationResult.result.netProfitUsd} vUSD</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] font-bold">NEW HIGH-WATER MARK</span>
                      <span className="font-extrabold text-gray-900">${simulationResult.result.newHighWaterMarkUsd} vUSD</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] font-bold">HWM BREACHED?</span>
                      <span className="font-bold text-indigo-700">{simulationResult.result.feePaid ? 'Yes (Fee Settled)' : 'No (Protected)'}</span>
                    </div>
                  </div>
                  {simulationResult.result.reason && (
                    <p className="text-[11px] text-orange-800 italic">
                      Notice: {simulationResult.result.reason}
                    </p>
                  )}
                </div>
              )}

              {/* Subscriptions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {subscriptions.map((sub) => {
                  const strat = strategies.find((s) => s.id === sub.strategyId);

                  return (
                    <div
                      key={sub.subscriptionId}
                      className="light-glass border border-white/80 rounded-3xl p-6 space-y-5 shadow-sm flex flex-col justify-between"
                    >
                      <div className="space-y-4">
                        {/* Sub Header */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <h3 className="text-lg font-extrabold text-gray-900">{sub.strategyName}</h3>
                            <span className="font-mono text-[11px] text-gray-400">ID: {sub.subscriptionId}</span>
                          </div>
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            ACTIVE MIRROR
                          </span>
                        </div>

                        {/* Financial Stats */}
                        <div className="grid grid-cols-3 gap-2 bg-white/70 border border-gray-100 rounded-2xl p-3 text-center">
                          <div>
                            <span className="text-[10px] text-gray-400 font-bold block uppercase">COLLATERAL</span>
                            <span className="text-sm font-black text-gray-900">${sub.allocatedCollateralUsd.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-400 font-bold block uppercase">CUMULATIVE PNL</span>
                            <span className={`text-sm font-black ${sub.cumulativeFollowerPnlUsd >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                              {sub.cumulativeFollowerPnlUsd >= 0 ? `+$${sub.cumulativeFollowerPnlUsd}` : `-$${Math.abs(sub.cumulativeFollowerPnlUsd)}`}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-400 font-bold block uppercase">HIGH-WATER MARK</span>
                            <span className="text-sm font-black text-orange-600">${sub.currentHighWaterMarkUsd}</span>
                          </div>
                        </div>

                        {/* Trade stats and fees */}
                        <div className="text-xs space-y-1.5 text-gray-600 font-medium">
                          <div className="flex justify-between">
                            <span>Copied Trades Executed:</span>
                            <span className="font-bold text-gray-900">{sub.totalCopiedTrades}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Performance Fees Paid:</span>
                            <span className="font-bold text-red-600">${sub.totalPerformanceFeesPaidUsd} vUSD</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Personal Risk Limits:</span>
                            <span className="font-bold text-gray-900">
                              Max ${sub.maxTradeAllocationUsd}/trade • {sub.personalStopLossPct}% Stop-Loss
                            </span>
                          </div>
                        </div>

                        {/* Interactive Trade Simulation Buttons */}
                        <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-3 space-y-2">
                          <div className="flex items-center justify-between text-[11px] font-bold text-gray-700">
                            <span className="flex items-center gap-1">
                              <Play className="w-3 h-3 text-orange-600" />
                              Simulate Mirrored Trade Signal
                            </span>
                            <span className="text-[10px] text-gray-400">Test HWM Fee Engine</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <button
                              onClick={() => handleSimulateTrade(sub.subscriptionId, 150)}
                              className="py-1.5 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-[11px] font-bold transition-all cursor-pointer"
                            >
                              +$150 Win
                            </button>
                            <button
                              onClick={() => handleSimulateTrade(sub.subscriptionId, -100)}
                              className="py-1.5 px-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-800 text-[11px] font-bold transition-all cursor-pointer"
                            >
                              -$100 Loss
                            </button>
                            <button
                              onClick={() => handleSimulateTrade(sub.subscriptionId, 300)}
                              className="py-1.5 px-2 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-800 text-[11px] font-bold transition-all cursor-pointer"
                            >
                              +$300 HWM Peak
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Cancel Subscription */}
                      <button
                        onClick={() => handleCancelSubscription(sub.subscriptionId)}
                        className="w-full mt-4 py-2.5 px-4 rounded-2xl bg-white hover:bg-red-50 border border-gray-200 hover:border-red-200 text-gray-700 hover:text-red-700 font-bold text-xs transition-colors cursor-pointer"
                      >
                        Unsubscribe & Refund Collateral to Vault
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 3: CONFIDENTIAL ENCLAVE LIVE FEED & MONITOR ─────────────── */}
      {activeSubTab === 'enclave-feed' && (
        <AlphaEnclaveFeed
          walletAddress={walletAddress}
          walletConnected={walletConnected}
          vaultBalance={vaultBalance}
          onConnectWallet={onConnectWallet}
          onRefreshVault={loadData}
        />
      )}

      {/* ─── MODAL 1: VERIFY CRYPTOGRAPHIC ALPHA ─────────────────────────── */}
      {inspectStrategy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden my-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-gray-900">
                    Cryptographic Proof of Alpha (PoA)
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">
                    Verified by Midnight Network Zero-Knowledge Compact Circuit
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectStrategy(null)}
                className="p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Certificate Meta */}
            <div className="space-y-3 font-mono text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-2xl p-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Strategy Name:</span>
                <span className="font-bold text-gray-900">{inspectStrategy.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Certificate Status:</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {inspectStrategy.certificate.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Midnight Block Height:</span>
                <span className="font-bold text-gray-900">#{inspectStrategy.certificate.verifiedBlockHeight}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Midnight Epoch:</span>
                <span className="font-bold text-gray-900">Epoch {inspectStrategy.certificate.midnightEpoch}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <span className="text-gray-500">Merkle Root Hash:</span>
                <span className="font-bold text-indigo-600 truncate max-w-[280px]">
                  {inspectStrategy.certificate.merkleProofHash}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">ZK Attestation:</span>
                <span className="font-bold text-teal-600 truncate max-w-[280px]">
                  {inspectStrategy.certificate.zkAttestationCommitment}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Circuit Contract:</span>
                <span className="font-bold text-orange-600 truncate max-w-[280px]">
                  {inspectStrategy.certificate.contractCircuitVerification}
                </span>
              </div>
            </div>

            {/* Confidentiality Guarantees */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-900 uppercase tracking-wider block">
                Zero-Knowledge Privacy Verification
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="bg-emerald-50/70 border border-emerald-200 p-2.5 rounded-xl flex items-center gap-2 text-emerald-900 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>AI Prompt & Model Weights Hidden</span>
                </div>
                <div className="bg-emerald-50/70 border border-emerald-200 p-2.5 rounded-xl flex items-center gap-2 text-emerald-900 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Indicators & Stop-Losses Shielded</span>
                </div>
                <div className="bg-emerald-50/70 border border-emerald-200 p-2.5 rounded-xl flex items-center gap-2 text-emerald-900 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Follower Vault Strictly Non-Custodial</span>
                </div>
                <div className="bg-emerald-50/70 border border-emerald-200 p-2.5 rounded-xl flex items-center gap-2 text-emerald-900 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Cryptographic HWM Fee Enforcement</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                const strat = inspectStrategy;
                setInspectStrategy(null);
                handleOpenSubscribe(strat);
              }}
              className="w-full py-3.5 px-6 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
            >
              Proceed to Blind Mirror
            </button>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: BLIND MIRROR SUBSCRIPTION ───────────────────────────── */}
      {subscribingStrategy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden my-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-gray-900">
                    Blind Mirror Strategy
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">
                    {subscribingStrategy.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSubscribingStrategy(null)}
                className="p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {subSuccessMsg ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-2xl text-xs flex items-center gap-3 font-semibold">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{subSuccessMsg}</span>
              </div>
            ) : (
              <form onSubmit={handleExecuteSubscription} className="space-y-4">
                {subError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-2xl flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{subError}</span>
                  </div>
                )}

                {/* Shielded Vault Balance Notice */}
                <div className="bg-orange-50/80 border border-orange-200 rounded-2xl p-3.5 flex items-center justify-between text-xs">
                  <span className="font-bold text-orange-900">Available Vault Balance:</span>
                  <span className="font-black text-orange-700">${vaultBalance.toLocaleString()} vUSD</span>
                </div>

                {/* Collateral Input */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-gray-700">
                      Shielded Collateral Allocation ($vUSD)
                    </label>
                    <span className="text-[11px] text-gray-400 font-medium">
                      Min: ${subscribingStrategy.minFollowerStakeUsd}
                    </span>
                  </div>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="number"
                      min={subscribingStrategy.minFollowerStakeUsd}
                      step={50}
                      value={allocatedCollateral}
                      onChange={(e) => setAllocatedCollateral(Number(e.target.value))}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-orange-500 font-bold"
                    />
                  </div>
                </div>

                {/* Max Trade Allocation & Personal Stop-Loss */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Max per Trade ($vUSD)
                    </label>
                    <input
                      type="number"
                      min={50}
                      step={25}
                      value={maxTradeAllocation}
                      onChange={(e) => setMaxTradeAllocation(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Personal Stop-Loss (%)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      step={1}
                      value={personalStopLoss}
                      onChange={(e) => setPersonalStopLoss(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                {/* Fee terms */}
                <div className="text-[11px] text-gray-500 space-y-1 bg-gray-50 p-3 rounded-2xl border border-gray-200">
                  <div className="flex justify-between font-semibold">
                    <span>Performance Fee Rate:</span>
                    <span className="text-orange-600 font-bold">{subscribingStrategy.performanceFeePct}% on Net Profit</span>
                  </div>
                  <div className="flex justify-between">
                    <span>High-Water Mark Protection:</span>
                    <span className="text-emerald-700 font-bold">Cryptographically Active</span>
                  </div>
                  <p className="text-[10px] text-gray-400 pt-1 leading-relaxed">
                    0% upfront management fee. Fees are deducted only on new all-time portfolio highs.
                  </p>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubscribing || allocatedCollateral > vaultBalance}
                  className="w-full py-3.5 px-6 rounded-2xl bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubscribing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Signing Midnight Subscription Circuit...</span>
                    </>
                  ) : allocatedCollateral > vaultBalance ? (
                    <span>Insufficient Shielded Vault Balance</span>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-orange-200" />
                      <span>Authorize Shielded Subscription</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ─── MODAL 3: PUBLISH STRATEGY MODAL ─────────────────────────────── */}
      <AlphaPublisherModal
        isOpen={isPublisherOpen}
        onClose={() => setIsPublisherOpen(false)}
        walletConnected={walletConnected}
        walletAddress={walletAddress}
        onConnectWallet={onConnectWallet}
        onStrategyPublished={() => loadData()}
      />
    </div>
  );
};
