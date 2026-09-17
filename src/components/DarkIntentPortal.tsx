import React, { useState, useEffect } from 'react';
import {
  Layers,
  Shield,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Clock,
  Zap,
  EyeOff,
  Cpu,
  Lock,
  TrendingDown,
  Sparkles,
  RefreshCw,
  Award,
  Globe,
  Plus,
  AlertTriangle,
  Play,
  Check,
  ChevronRight,
  Coins,
  ShieldCheck,
  Sliders,
  DollarSign,
  Activity,
  FileText
} from 'lucide-react';
import {
  DarkIntent,
  getActiveDarkIntents,
  REGISTERED_BONDED_SOLVERS,
  BondedSolver,
  SolverBid,
  CrossChainStateProof,
  registerSolverBondStake,
  slashDelinquentSolver,
  commitDarkIntentWorkflow,
  simulateSolverExecution,
  settleDarkIntentOnMidnight
} from '../lib/solver-network';
import {
  LiquidityVenueId,
  LIQUIDITY_VENUES,
  findBestLiquidityRoute
} from '../lib/liquidity-router';
import { IntentFormulationModal } from './IntentFormulationModal';
import { formatISTDateTime } from '../utils/time';

interface DarkIntentPortalProps {
  walletConnected: boolean;
  walletAddress: string | null;
  vaultBalance: number;
  onConnectWallet: () => void;
  networkId?: string;
}

export const DarkIntentPortal: React.FC<DarkIntentPortalProps> = ({
  walletConnected,
  walletAddress,
  vaultBalance,
  onConnectWallet,
  networkId = 'preview'
}) => {
  const [intents, setIntents] = useState<DarkIntent[]>([]);
  const [selectedIntent, setSelectedIntent] = useState<DarkIntent | null>(null);
  const [isFormulateOpen, setIsFormulateOpen] = useState<boolean>(false);
  const [activeWorkflowStep, setActiveWorkflowStep] = useState<number>(1);
  const [isSimulatingAuction, setIsSimulatingAuction] = useState<boolean>(false);
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);

  // Staking Bond state
  const [solversList, setSolversList] = useState<BondedSolver[]>([...REGISTERED_BONDED_SOLVERS]);
  const [selectedSolverToStake, setSelectedSolverToStake] = useState<BondedSolver | null>(null);
  const [bondStakeAmount, setBondStakeAmount] = useState<number>(50_000);

  // Quick Formulation Preset state
  const [selectedPreset, setSelectedPreset] = useState<{
    venueId: LiquidityVenueId;
    asset: string;
    amountUsd: number;
    limitPriceUsd: number;
  } | undefined>(undefined);

  const refreshIntents = () => {
    const loaded = getActiveDarkIntents();
    setIntents(loaded);
    if (loaded.length > 0 && !selectedIntent) {
      setSelectedIntent(loaded[0]);
    }
  };

  useEffect(() => {
    refreshIntents();
  }, []);

  const totalSlippageSaved = intents.reduce((acc, i) => {
    return acc + (i.externalReceipt ? i.escrowAmountUsd * 0.045 : 0);
  }, 1_240_000);

  const totalRoutedVolume = intents.reduce((acc, i) => acc + i.escrowAmountUsd, 175_200_000);
  const totalBondedCollateral = solversList.reduce((acc, s) => acc + s.bondedCollateralUsd, 0);

  const handleOpenPreset = (preset: {
    venueId: LiquidityVenueId;
    asset: string;
    amountUsd: number;
    limitPriceUsd: number;
  }) => {
    setSelectedPreset(preset);
    setIsFormulateOpen(true);
  };

  const handleQuickDemoAuction = async () => {
    if (!walletConnected) {
      onConnectWallet();
      return;
    }

    setIsSimulatingAuction(true);
    setFeedbackBanner('Broadcasting demo Dark Intent (100,000 vUSD for SOL on Solana) to Multi-Solver RFQ...');

    try {
      const bestRoute = findBestLiquidityRoute('SOL', 100_000);
      const intent = await commitDarkIntentWorkflow(
        '0xagent_solana_demo',
        'SOL',
        100_000,
        bestRoute,
        walletAddress || undefined
      );

      refreshIntents();
      setSelectedIntent(intent);
      setFeedbackBanner('Bidding concluded. Winning solver dispatching cross-chain execution...');

      const receipt = await simulateSolverExecution(intent, bestRoute);
      refreshIntents();

      setFeedbackBanner('External execution confirmed! Settling atomically via Midnight ZK State Proof...');
      await settleDarkIntentOnMidnight(intent, receipt);

      refreshIntents();
      setFeedbackBanner('Successfully settled! 100% MEV-shielded cross-chain atomic settlement complete.');
      setTimeout(() => setFeedbackBanner(null), 5000);
    } catch (err: any) {
      console.error('[Quick Demo Error]', err);
      setFeedbackBanner(err?.message || 'Failed to simulate multi-solver demo auction.');
      setTimeout(() => setFeedbackBanner(null), 5000);
    } finally {
      setIsSimulatingAuction(false);
    }
  };

  const handleStakeBond = (solverId: string) => {
    if (bondStakeAmount <= 0) return;
    const res = registerSolverBondStake(solverId, bondStakeAmount);
    setSolversList([...REGISTERED_BONDED_SOLVERS]);
    setSelectedSolverToStake(null);
    setFeedbackBanner(`Deposited $${bondStakeAmount.toLocaleString()} bond into ${res.name}. New total bond: $${res.bondedCollateralUsd.toLocaleString()} USD.`);
    setTimeout(() => setFeedbackBanner(null), 4000);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto font-sans">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 light-glass border border-white/40 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-400/10 blur-3xl rounded-full -mr-24 -mt-24 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-amber-400/10 blur-3xl rounded-full -ml-20 -mb-20 pointer-events-none" />

        <div className="space-y-3 z-10 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase bg-orange-100 text-orange-900 border border-orange-200 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-orange-600" />
              ZK-Dark Intent Solver Network (DIN)
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-900 text-white uppercase tracking-wider">
              Cross-Chain Liquidity
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
            Institutional Liquidity without Leaking Intent.
          </h1>
          <p className="text-sm text-gray-600 font-medium leading-relaxed">
            Break through the "Island Liquidity" trap. Formulate zero-knowledge trade intents on Midnight and settle against deep order books on <strong className="text-gray-900">Cardano, Ethereum, Hyperliquid, and Solana</strong> via bonded competitive solvers.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 z-10 shrink-0">
          <button
            onClick={() => {
              setSelectedPreset(undefined);
              setIsFormulateOpen(true);
            }}
            className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Formulate Dark Intent
          </button>

          <button
            onClick={handleQuickDemoAuction}
            disabled={isSimulatingAuction}
            className="px-4 py-3.5 rounded-2xl bg-white/70 hover:bg-white border border-gray-200/80 text-gray-800 font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 text-orange-600 ${isSimulatingAuction ? 'animate-spin' : ''}`} />
            Demo Solana RFQ
          </button>
        </div>
      </div>

      {/* Feedback Alert if available */}
      {feedbackBanner && (
        <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 text-orange-950 text-xs font-semibold flex items-center gap-3 shadow-sm animate-in fade-in">
          <Activity className="w-4 h-4 text-orange-600 shrink-0 animate-pulse" />
          <span>{feedbackBanner}</span>
        </div>
      )}

      {/* Executive KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="light-glass border border-white/60 rounded-3xl p-5 shadow-sm space-y-1 relative overflow-hidden group">
          <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-orange-500" />
            Routed Volume
          </div>
          <div className="text-2xl font-black text-gray-900 font-mono">
            ${(totalRoutedVolume / 1_000_000).toFixed(1)}M
          </div>
          <div className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
            +${(totalSlippageSaved / 1_000_000).toFixed(2)}M slippage saved
          </div>
        </div>

        {/* KPI 2 */}
        <div className="light-glass border border-white/60 rounded-3xl p-5 shadow-sm space-y-1 relative overflow-hidden group">
          <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-500" />
            Bonded Solver Collateral
          </div>
          <div className="text-2xl font-black text-gray-900 font-mono">
            ${(totalBondedCollateral / 1_000_000).toFixed(2)}M
          </div>
          <div className="text-[11px] text-gray-600 font-medium">
            Across 5 bonded institutional nodes
          </div>
        </div>

        {/* KPI 3 */}
        <div className="light-glass border border-white/60 rounded-3xl p-5 shadow-sm space-y-1 relative overflow-hidden group">
          <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-blue-500" />
            Avg Execution Latency
          </div>
          <div className="text-2xl font-black text-gray-900 font-mono">
            185ms
          </div>
          <div className="text-[11px] text-emerald-700 font-bold">
            Sub-second Solana & Arbitrum finality
          </div>
        </div>

        {/* KPI 4 */}
        <div className="light-glass border border-white/60 rounded-3xl p-5 shadow-sm space-y-1 relative overflow-hidden group">
          <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
            <EyeOff className="w-4 h-4 text-purple-500" />
            External Anonymity
          </div>
          <div className="text-2xl font-black text-gray-900 font-mono">
            99.8%
          </div>
          <div className="text-[11px] text-purple-700 font-bold">
            Zero intent leakage to public chain
          </div>
        </div>
      </div>

      {/* 4-Step Cross-Chain Settlement Flow Architecture */}
      <div className="light-glass border border-white/60 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-500" />
              Atomic 4-Step Cross-Chain Settlement Lifecycle
            </h3>
            <p className="text-xs text-gray-600 font-medium">
              How Vogue solves deep liquidity without compromising Midnight's zero-knowledge shield.
            </p>
          </div>
          <span className="text-[11px] font-bold text-orange-800 bg-orange-100 px-3 py-1 rounded-full border border-orange-200">
            Cryptographically Bonded Solvers
          </span>
        </div>

        {/* Interactive Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Step 1 */}
          <div
            onClick={() => setActiveWorkflowStep(1)}
            className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
              activeWorkflowStep === 1
                ? 'bg-orange-500/10 border-orange-500 ring-1 ring-orange-500 shadow-md'
                : 'bg-white/60 border-gray-200/80 hover:bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="w-7 h-7 rounded-full bg-orange-500 text-white font-black text-xs flex items-center justify-center">
                1
              </span>
              <span className="text-[10px] font-bold text-gray-500 uppercase">MIDNIGHT</span>
            </div>
            <h4 className="text-sm font-extrabold text-gray-900 mb-1">Intent Commitment</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Trader commits shielded vUSD and encrypted limit constraints into Midnight's ZK circuit.
            </p>
            <div className="mt-3 pt-3 border-t border-gray-200/50 text-[10px] text-emerald-700 font-bold">
              ? Portfolio & size 100% hidden
            </div>
          </div>

          {/* Step 2 */}
          <div
            onClick={() => setActiveWorkflowStep(2)}
            className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
              activeWorkflowStep === 2
                ? 'bg-orange-500/10 border-orange-500 ring-1 ring-orange-500 shadow-md'
                : 'bg-white/60 border-gray-200/80 hover:bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="w-7 h-7 rounded-full bg-orange-500 text-white font-black text-xs flex items-center justify-center">
                2
              </span>
              <span className="text-[10px] font-bold text-gray-500 uppercase">OFF-CHAIN</span>
            </div>
            <h4 className="text-sm font-extrabold text-gray-900 mb-1">Competitive RFQ</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Bonded solvers bid competitively on price improvement, execution latency, and bond coverage.
            </p>
            <div className="mt-3 pt-3 border-t border-gray-200/50 text-[10px] text-orange-700 font-bold">
              ? Multi-solver price auction
            </div>
          </div>

          {/* Step 3 */}
          <div
            onClick={() => setActiveWorkflowStep(3)}
            className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
              activeWorkflowStep === 3
                ? 'bg-orange-500/10 border-orange-500 ring-1 ring-orange-500 shadow-md'
                : 'bg-white/60 border-gray-200/80 hover:bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="w-7 h-7 rounded-full bg-orange-500 text-white font-black text-xs flex items-center justify-center">
                3
              </span>
              <span className="text-[10px] font-bold text-gray-500 uppercase">EXTERNAL CHAIN</span>
            </div>
            <h4 className="text-sm font-extrabold text-gray-900 mb-1">External Fill</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Winning solver fills order on Cardano, Solana, Ethereum, or Hyperliquid with state receipts.
            </p>
            <div className="mt-3 pt-3 border-t border-gray-200/50 text-[10px] text-blue-700 font-bold">
              ? Deep CLMM / CLOB liquidity
            </div>
          </div>

          {/* Step 4 */}
          <div
            onClick={() => setActiveWorkflowStep(4)}
            className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
              activeWorkflowStep === 4
                ? 'bg-orange-500/10 border-orange-500 ring-1 ring-orange-500 shadow-md'
                : 'bg-white/60 border-gray-200/80 hover:bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="w-7 h-7 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                4
              </span>
              <span className="text-[10px] font-bold text-gray-500 uppercase">MIDNIGHT ZK</span>
            </div>
            <h4 className="text-sm font-extrabold text-gray-900 mb-1">Atomic Settlement</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Midnight circuit verifies external Merkle root and oracle attestation, releasing escrow to solver.
            </p>
            <div className="mt-3 pt-3 border-t border-gray-200/50 text-[10px] text-emerald-700 font-bold">
              ? Zero-counterparty risk
            </div>
          </div>
        </div>
      </div>

      {/* One-Click Presets for Fast Formulation */}
      <div className="light-glass border border-white/60 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              <Globe className="w-4 h-4 text-orange-500" />
              Fast-Fill Intent Presets Across External Chains
            </h3>
            <p className="text-xs text-gray-600 font-medium">
              Click any verified institutional route to populate the formulation circuit with pre-calibrated limits.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Preset 1: Cardano */}
          <button
            onClick={() =>
              handleOpenPreset({
                venueId: 'minswap',
                asset: 'ADA',
                amountUsd: 50_000,
                limitPriceUsd: 0.82
              })
            }
            className="p-4 rounded-2xl bg-white/70 hover:bg-white border border-gray-200/80 hover:border-blue-300 text-left transition-all cursor-pointer shadow-sm group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-blue-100 text-blue-800 border border-blue-200">
                Cardano eUTxO
              </span>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-1" />
            </div>
            <div className="font-extrabold text-sm text-gray-900">50,000 vUSD ? ADA</div>
            <div className="text-xs text-gray-500 font-mono mt-0.5">Limit: $0.82 on Minswap</div>
            <div className="mt-2 text-[10px] text-emerald-700 font-bold">
              +$2,150 AMM slippage saved
            </div>
          </button>

          {/* Preset 2: Solana */}
          <button
            onClick={() =>
              handleOpenPreset({
                venueId: 'jupiter_solana',
                asset: 'SOL',
                amountUsd: 100_000,
                limitPriceUsd: 145.0
              })
            }
            className="p-4 rounded-2xl bg-white/70 hover:bg-white border border-gray-200/80 hover:border-purple-300 text-left transition-all cursor-pointer shadow-sm group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-purple-100 text-purple-800 border border-purple-200">
                Solana CLMM
              </span>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-transform group-hover:translate-x-1" />
            </div>
            <div className="font-extrabold text-sm text-gray-900">100,000 vUSD ? SOL</div>
            <div className="text-xs text-gray-500 font-mono mt-0.5">Limit: $145.00 via Jito Relayer</div>
            <div className="mt-2 text-[10px] text-emerald-700 font-bold">
              +$4,820 slippage & anti-sandwich
            </div>
          </button>

          {/* Preset 3: Ethereum */}
          <button
            onClick={() =>
              handleOpenPreset({
                venueId: 'uniswap_v3',
                asset: 'ETH',
                amountUsd: 250_000,
                limitPriceUsd: 2750.0
              })
            }
            className="p-4 rounded-2xl bg-white/70 hover:bg-white border border-gray-200/80 hover:border-indigo-300 text-left transition-all cursor-pointer shadow-sm group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-indigo-100 text-indigo-800 border border-indigo-200">
                Ethereum EVM
              </span>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 transition-transform group-hover:translate-x-1" />
            </div>
            <div className="font-extrabold text-sm text-gray-900">250,000 vUSD ? ETH</div>
            <div className="text-xs text-gray-500 font-mono mt-0.5">Limit: $2,750 on Uniswap v3</div>
            <div className="mt-2 text-[10px] text-emerald-700 font-bold">
              +$11,200 cross-rollup savings
            </div>
          </button>

          {/* Preset 4: Hyperliquid */}
          <button
            onClick={() =>
              handleOpenPreset({
                venueId: 'hyperliquid',
                asset: 'BTC',
                amountUsd: 150_000,
                limitPriceUsd: 64200.0
              })
            }
            className="p-4 rounded-2xl bg-white/70 hover:bg-white border border-gray-200/80 hover:border-emerald-300 text-left transition-all cursor-pointer shadow-sm group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                Hyperliquid CLOB
              </span>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 transition-transform group-hover:translate-x-1" />
            </div>
            <div className="font-extrabold text-sm text-gray-900">150,000 vUSD ? BTC</div>
            <div className="text-xs text-gray-500 font-mono mt-0.5">Limit: $64,200 Prime Orderbook</div>
            <div className="mt-2 text-[10px] text-emerald-700 font-bold">
              +$6,400 CLOB deep fill
            </div>
          </button>
        </div>
      </div>

      {/* Active & Historical Dark Intents & RFQ Bidding Monitor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Dark Intents List */}
        <div className="lg:col-span-2 light-glass border border-white/60 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                <Activity className="w-4 h-4 text-orange-500" />
                Active & Historical Dark Intents ({intents.length})
              </h3>
              <p className="text-xs text-gray-600 font-medium">
                Real-time tracking of zero-knowledge limit intent fulfillment.
              </p>
            </div>
            <button
              onClick={refreshIntents}
              className="p-2 rounded-xl bg-white/60 hover:bg-white border border-gray-200 text-gray-600 hover:text-gray-900 transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {intents.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-white/40 border border-gray-200/60 space-y-3">
              <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
                <Layers className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-extrabold text-gray-900">No Active Dark Intents</h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Formulate a new trade intent to route capital across external chains without leaking order size or stop loss triggers.
              </p>
              <button
                onClick={() => setIsFormulateOpen(true)}
                className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <Plus className="w-3.5 h-3.5" /> Formulate First Intent
              </button>
            </div>
          ) : (
            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {intents.map((intent) => {
                const isSelected = selectedIntent?.intentId === intent.intentId;
                const venue = LIQUIDITY_VENUES[intent.venueId] || LIQUIDITY_VENUES.minswap;

                return (
                  <div
                    key={intent.intentId}
                    onClick={() => setSelectedIntent(intent)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-orange-500/10 border-orange-500 ring-1 ring-orange-500 shadow-sm'
                        : 'bg-white/70 border-gray-200/80 hover:bg-white'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-gray-900">
                          {intent.intentId}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-orange-100 text-orange-900 border border-orange-200">
                          {intent.asset} {intent.direction}
                        </span>
                        <span className="text-[10px] text-gray-500 font-medium">
                          {formatISTDateTime(intent.createdAt)}
                        </span>
                      </div>

                      <div className="text-xs text-gray-600 flex items-center gap-3">
                        <span>
                          Escrow: <strong className="font-mono text-gray-900">${intent.escrowAmountUsd.toLocaleString()} vUSD</strong>
                        </span>
                        <span>?</span>
                        <span>
                          Target: <strong className="text-gray-900">{venue.name}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                      <div className="text-right">
                        <div className="text-[10px] font-bold text-gray-500 uppercase">Solver Status</div>
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase border ${
                            intent.status === 'SETTLED_MIDNIGHT'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : intent.status === 'FILLED_EXTERNAL'
                              ? 'bg-blue-100 text-blue-800 border-blue-300'
                              : 'bg-amber-100 text-amber-800 border-amber-300'
                          }`}
                        >
                          {intent.status.replace('_', ' ')}
                        </span>
                      </div>

                      {intent.externalReceipt?.chainExplorerUrl && (
                        <a
                          href={intent.externalReceipt.chainExplorerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                          title="View External Chain Proof"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 1 Col: Selected Intent Cryptographic Inspector */}
        <div className="light-glass border border-white/60 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              <Cpu className="w-4 h-4 text-orange-500" />
              ZK State Proof Inspector
            </h3>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Midnight Validated
            </span>
          </div>

          {selectedIntent ? (
            <div className="space-y-4 text-xs font-sans">
              <div className="p-3.5 rounded-2xl bg-white/70 border border-gray-200/80 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Intent ID:</span>
                  <span className="font-mono font-bold text-gray-900">{selectedIntent.intentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Matched Solver:</span>
                  <span className="font-bold text-gray-900 truncate max-w-[140px]">
                    {selectedIntent.solver?.name || 'Amber Arbitrum Relayer'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Solver Bond:</span>
                  <span className="font-mono font-bold text-emerald-700">
                    ${((selectedIntent.solver?.bondedCollateralUsd || 350_000) / 1000).toFixed(0)}k USD
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Execution Slippage:</span>
                  <span className="font-mono font-bold text-emerald-700">
                    {selectedIntent.externalReceipt?.slippagePct.toFixed(3) || '0.045'}%
                  </span>
                </div>
              </div>

              {/* State Proof Merkle Tree Receipt */}
              <div className="p-3.5 rounded-2xl bg-gray-900 text-gray-200 font-mono text-[11px] space-y-2">
                <div className="text-[10px] uppercase font-bold tracking-widest text-orange-400">
                  Cross-Chain State Proof (Receipt)
                </div>
                <div className="break-all text-[10px] text-gray-400">
                  Root: {selectedIntent.stateProof?.merkleRoot || '0x4f88ba019ec8c11e74109bcae984f88102a'}
                </div>
                <div className="break-all text-[10px] text-gray-400">
                  Hash: {selectedIntent.stateProof?.stateProofHash || '0xproof_fill_state_98012ba'}
                </div>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1.5 pt-1">
                  <Check className="w-3.5 h-3.5" />
                  Constraints verified against Midnight limit
                </div>
              </div>

              {/* Live RFQ bids received */}
              {selectedIntent.solverBids && selectedIntent.solverBids.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                    Solver RFQ Quotes ({selectedIntent.solverBids.length})
                  </span>
                  {selectedIntent.solverBids.map((bid) => (
                    <div
                      key={bid.bidId}
                      className={`p-2 rounded-xl border flex items-center justify-between text-[10px] ${
                        bid.isWinningBid ? 'bg-emerald-50 border-emerald-300' : 'bg-white/50 border-gray-200'
                      }`}
                    >
                      <span className="font-bold text-gray-800">{bid.solver.name.substring(0, 18)}...</span>
                      <span className="font-mono font-bold text-emerald-800">
                        +{(bid.priceImprovementBps).toFixed(0)} bps (${bid.bidPriceUsd.toFixed(2)})
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-gray-400">
              Select an intent to inspect cryptographic execution proofs.
            </div>
          )}
        </div>
      </div>

      {/* Bonded Solver Directory & Collateral Management */}
      <div className="light-glass border border-white/60 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              <Shield className="w-4 h-4 text-orange-500" />
              Bonded Solver Network Directory
            </h3>
            <p className="text-xs text-gray-600 font-medium">
              Registered decentralized nodes bonded with on-chain collateral to execute cross-chain intents.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-gray-700 bg-white/60 px-3 py-1.5 rounded-2xl border border-gray-200">
            Slashing Penalty: Up to 100% of Bond
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {solversList.map((solver) => {
            const venue = LIQUIDITY_VENUES[solver.specializedVenue] || LIQUIDITY_VENUES.minswap;

            return (
              <div
                key={solver.id}
                className="p-5 rounded-2xl bg-white/70 border border-gray-200/80 hover:border-orange-300 shadow-sm transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-extrabold text-sm text-gray-900 tracking-tight">{solver.name}</h4>
                    <span className="text-[10px] text-gray-500 font-mono">{solver.id}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-gray-100 text-gray-800 border border-gray-200">
                    {venue.chain}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2 rounded-xl bg-gray-50 border border-gray-200/60">
                    <span className="text-[10px] text-gray-500 font-sans block">Bonded Collateral</span>
                    <span className="font-extrabold text-gray-900">
                      ${(solver.bondedCollateralUsd / 1000).toFixed(0)}k USD
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-gray-50 border border-gray-200/60">
                    <span className="text-[10px] text-gray-500 font-sans block">Success Rate</span>
                    <span className="font-extrabold text-emerald-700">
                      {solver.successRatePct.toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-gray-600 flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="font-sans font-medium">Volume Filled:</span>
                  <span className="font-mono font-bold">${(solver.totalVolumeFilledUsd / 1_000_000).toFixed(1)}M USD</span>
                </div>

                <button
                  onClick={() => setSelectedSolverToStake(solver)}
                  className="w-full py-2 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-900 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <DollarSign className="w-3.5 h-3.5 text-orange-600" />
                  Top-up Collateral Stake
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stake Bond Modal */}
      {selectedSolverToStake && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-gray-200 space-y-4 font-sans">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-base text-gray-900">
                Deposit Bond Collateral
              </h3>
              <button
                onClick={() => setSelectedSolverToStake(null)}
                className="text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                ?
              </button>
            </div>

            <p className="text-xs text-gray-600">
              Posting collateral for <strong className="text-gray-900">{selectedSolverToStake.name}</strong> on Midnight. Bonded capital guarantees execution solvency and is eligible for slashing if constraints fail.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase">
                Bond Deposit Amount ($ USD)
              </label>
              <input
                type="number"
                value={bondStakeAmount}
                onChange={(e) => setBondStakeAmount(Number(e.target.value))}
                step={10000}
                min={10000}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm font-mono font-bold"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setSelectedSolverToStake(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 font-bold text-xs text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleStakeBond(selectedSolverToStake.id)}
                className="flex-1 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Deposit Bond
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Formulation Modal Component */}
      <IntentFormulationModal
        isOpen={isFormulateOpen}
        onClose={() => setIsFormulateOpen(false)}
        walletConnected={walletConnected}
        walletAddress={walletAddress}
        vaultBalance={vaultBalance}
        onConnectWallet={onConnectWallet}
        onIntentCreated={(newIntent) => {
          refreshIntents();
          setSelectedIntent(newIntent);
          setIsFormulateOpen(false);
          setFeedbackBanner(`Intent ${newIntent.intentId} formulated and settled atomically on Midnight!`);
          setTimeout(() => setFeedbackBanner(null), 4000);
        }}
        initialPreset={selectedPreset}
      />
    </div>
  );
};
