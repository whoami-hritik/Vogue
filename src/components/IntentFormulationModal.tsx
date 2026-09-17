import React, { useState, useEffect } from 'react';
import {
  Layers,
  X,
  Shield,
  ArrowRight,
  Sparkles,
  Zap,
  TrendingDown,
  CheckCircle2,
  Clock,
  ExternalLink,
  Lock,
  Globe,
  DollarSign,
  AlertCircle,
  Activity,
  Cpu
} from 'lucide-react';
import {
  LiquidityVenueId,
  LIQUIDITY_VENUES,
  RouteQuote,
  compareLiquidityRoutes,
  findBestLiquidityRoute
} from '../lib/liquidity-router';
import {
  commitDarkIntentWorkflow,
  simulateSolverExecution,
  settleDarkIntentOnMidnight,
  DarkIntent,
  SolverBid
} from '../lib/solver-network';

interface IntentFormulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletConnected: boolean;
  walletAddress: string | null;
  vaultBalance: number;
  onConnectWallet: () => void;
  onIntentCreated?: (intent: DarkIntent) => void;
  initialPreset?: {
    venueId: LiquidityVenueId;
    asset: string;
    amountUsd: number;
    limitPriceUsd: number;
  };
}

const VENUE_OPTIONS: { id: LiquidityVenueId; label: string; chain: string; badgeColor: string }[] = [
  { id: 'minswap', label: 'Cardano (Minswap eUTxO)', chain: 'Cardano', badgeColor: 'bg-blue-100 text-blue-800 border-blue-200' },
  { id: 'jupiter_solana', label: 'Solana (Jupiter CLMM)', chain: 'Solana', badgeColor: 'bg-purple-100 text-purple-800 border-purple-200' },
  { id: 'uniswap_v3', label: 'Ethereum (Uniswap v3)', chain: 'Ethereum', badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  { id: 'hyperliquid', label: 'Hyperliquid (L1 Perps)', chain: 'Hyperliquid', badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { id: 'midnight_darkpool', label: 'Midnight P2P Darkpool', chain: 'Midnight', badgeColor: 'bg-amber-100 text-amber-800 border-amber-200' }
];

export const IntentFormulationModal: React.FC<IntentFormulationModalProps> = ({
  isOpen,
  onClose,
  walletConnected,
  walletAddress,
  vaultBalance,
  onConnectWallet,
  onIntentCreated,
  initialPreset
}) => {
  const [selectedVenue, setSelectedVenue] = useState<LiquidityVenueId>(initialPreset?.venueId || 'minswap');
  const [selectedAsset, setSelectedAsset] = useState<string>(initialPreset?.asset || 'ADA');
  const [amountUsd, setAmountUsd] = useState<number>(initialPreset?.amountUsd || 50_000);
  const [limitPriceUsd, setLimitPriceUsd] = useState<number>(initialPreset?.limitPriceUsd || 0.82);
  const [slippageTolerancePct, setSlippageTolerancePct] = useState<number>(1.5);
  const [expiryHours, setExpiryHours] = useState<number>(24);

  // Execution workflow states
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [workflowStep, setWorkflowStep] = useState<number>(0); // 0: Idle, 1: Escrow Commit, 2: RFQ Auction, 3: External Fill, 4: Settled
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [createdIntent, setCreatedIntent] = useState<DarkIntent | null>(null);
  const [activeBids, setActiveBids] = useState<SolverBid[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync supported assets when venue changes
  useEffect(() => {
    const venue = LIQUIDITY_VENUES[selectedVenue];
    if (venue && !venue.supportedAssets.includes(selectedAsset)) {
      setSelectedAsset(venue.supportedAssets[0] || 'ADA');
    }
  }, [selectedVenue]);

  // Sync preset if provided
  useEffect(() => {
    if (initialPreset) {
      setSelectedVenue(initialPreset.venueId);
      setSelectedAsset(initialPreset.asset);
      setAmountUsd(initialPreset.amountUsd);
      setLimitPriceUsd(initialPreset.limitPriceUsd);
    }
  }, [initialPreset]);

  if (!isOpen) return null;

  const currentVenue = LIQUIDITY_VENUES[selectedVenue];
  const comparison = compareLiquidityRoutes(selectedAsset, amountUsd);
  const targetRoute = comparison.routes.find((r) => r.venue.id === selectedVenue) || comparison.optimalRoute;

  const handleFormulateAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletConnected) {
      onConnectWallet();
      return;
    }

    if (amountUsd <= 0) {
      setErrorMessage('Please enter a valid capital allocation greater than $0.');
      return;
    }

    if (amountUsd > vaultBalance) {
      setErrorMessage(
        `Insufficient Shielded Vault balance ($${vaultBalance.toLocaleString()} vUSD available vs $${amountUsd.toLocaleString()} vUSD requested). Please adjust allocation or shield additional funds.`
      );
      return;
    }

    setErrorMessage(null);
    setIsExecuting(true);
    setWorkflowStep(1);
    setStatusMessage('1/4 Committing shielded vUSD escrow to Midnight ZK consensus...');

    try {
      // Step 1: Commit intent to Midnight with escrow
      const intent = await commitDarkIntentWorkflow(
        '0xagent_institutional',
        selectedAsset,
        amountUsd,
        targetRoute,
        walletAddress || undefined
      );
      setCreatedIntent(intent);
      setActiveBids(intent.solverBids || []);

      // Step 2: RFQ Auction
      setWorkflowStep(2);
      setStatusMessage('2/4 Multi-solver RFQ auction matching optimal bonded node...');
      await new Promise<void>((resolve) => setTimeout(resolve, 600));

      // Step 3: External Fill
      setWorkflowStep(3);
      setStatusMessage(`3/4 Winning solver executing fill on ${currentVenue.chain} with cross-chain state proof...`);
      const receipt = await simulateSolverExecution(intent, targetRoute);

      // Step 4: Midnight ZK Atomic Settlement
      setWorkflowStep(4);
      setStatusMessage('4/4 Midnight verifying cross-chain state proof and releasing vUSD escrow...');
      const settleTx = await settleDarkIntentOnMidnight(intent, receipt);

      setStatusMessage('Atomic Cross-Chain Settlement Confirmed on Midnight!');
      if (onIntentCreated) {
        onIntentCreated({
          ...intent,
          status: 'SETTLED_MIDNIGHT',
          externalReceipt: receipt,
          midnightSettleTxHash: settleTx
        });
      }
    } catch (err: any) {
      console.error('[DIN Formulation Error]', err);
      setErrorMessage(err?.message || 'Failed to formulate and execute dark intent.');
      setWorkflowStep(0);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleResetModal = () => {
    setWorkflowStep(0);
    setCreatedIntent(null);
    setActiveBids([]);
    setErrorMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-white/95 border border-white/80 rounded-[2.2rem] shadow-2xl overflow-hidden font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200/80 bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">
                  Formulate Dark Intent (DIN)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase bg-orange-100 text-orange-900 border border-orange-200">
                  Cross-Chain Solver
                </span>
              </div>
              <p className="text-xs text-gray-600 font-medium">
                Bridge Midnight privacy to Cardano, Solana, Ethereum & Hyperliquid liquidity without leaking intent.
              </p>
            </div>
          </div>

          <button
            onClick={handleResetModal}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-800 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <div>
                <span className="font-bold">Intent Formulation Error: </span>
                {errorMessage}
              </div>
            </div>
          )}

          {/* If Execution is Complete or In-Flight */}
          {workflowStep > 0 ? (
            <div className="space-y-5">
              {/* Stepper Display */}
              <div className="bg-orange-50/60 border border-orange-200/80 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-orange-950 uppercase tracking-wider flex items-center gap-2">
                    <Activity className="w-4 h-4 text-orange-600 animate-pulse" />
                    Cross-Chain Settlement Progress
                  </span>
                  <span className="text-xs font-mono font-bold text-orange-800">
                    Step {workflowStep} of 4
                  </span>
                </div>

                {/* Step Pills */}
                <div className="grid grid-cols-4 gap-2">
                  <div className={`p-2.5 rounded-xl border text-center text-[11px] font-bold ${workflowStep >= 1 ? 'bg-orange-600 text-white border-orange-600' : 'bg-white/60 text-gray-400 border-gray-200'}`}>
                    1. Escrow Lock
                  </div>
                  <div className={`p-2.5 rounded-xl border text-center text-[11px] font-bold ${workflowStep >= 2 ? 'bg-orange-600 text-white border-orange-600' : 'bg-white/60 text-gray-400 border-gray-200'}`}>
                    2. RFQ Auction
                  </div>
                  <div className={`p-2.5 rounded-xl border text-center text-[11px] font-bold ${workflowStep >= 3 ? 'bg-orange-600 text-white border-orange-600' : 'bg-white/60 text-gray-400 border-gray-200'}`}>
                    3. External Fill
                  </div>
                  <div className={`p-2.5 rounded-xl border text-center text-[11px] font-bold ${workflowStep >= 4 ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white/60 text-gray-400 border-gray-200'}`}>
                    4. ZK Settled
                  </div>
                </div>

                <p className="text-xs text-orange-900 font-medium text-center">
                  {statusMessage}
                </p>
              </div>

              {/* Bids received */}
              {activeBids.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Bonded Solver RFQ Bids ({activeBids.length} nodes)
                  </h4>
                  <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                    {activeBids.map((b) => (
                      <div
                        key={b.bidId}
                        className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${b.isWinningBid ? 'bg-emerald-50/80 border-emerald-300' : 'bg-white/60 border-gray-200'}`}
                      >
                        <div className="flex items-center gap-2">
                          {b.isWinningBid && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          )}
                          <div>
                            <div className="font-bold text-gray-900">{b.solver.name}</div>
                            <div className="text-[10px] text-gray-500 font-mono">
                              Bond: ${(b.bondedCollateralUsd / 1000).toFixed(0)}k | Latency: {b.executionLatencyMs}ms
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-bold text-gray-900">${b.bidPriceUsd.toFixed(4)}</div>
                          <span className="text-[10px] text-emerald-700 font-bold">
                            +{b.priceImprovementBps} bps improvement
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Final Success Summary */}
              {workflowStep === 4 && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    Trade Successfully Proven & Settled Atomically!
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                    <div className="p-2 bg-white/70 rounded-xl border border-emerald-100">
                      <div className="text-[10px] text-gray-500 font-sans">Execution Venue</div>
                      <div className="font-bold text-gray-900">{currentVenue.name}</div>
                    </div>
                    <div className="p-2 bg-white/70 rounded-xl border border-emerald-100">
                      <div className="text-[10px] text-gray-500 font-sans">Winning Solver</div>
                      <div className="font-bold text-gray-900 truncate">{createdIntent?.solver?.name || 'Amber Relayer'}</div>
                    </div>
                    <div className="p-2 bg-white/70 rounded-xl border border-emerald-100">
                      <div className="text-[10px] text-gray-500 font-sans">Effective Fill</div>
                      <div className="font-bold text-emerald-700">${targetRoute.executionPriceUsd.toFixed(4)}</div>
                    </div>
                    <div className="p-2 bg-white/70 rounded-xl border border-emerald-100">
                      <div className="text-[10px] text-gray-500 font-sans">Slippage Saved</div>
                      <div className="font-bold text-emerald-700">${comparison.totalSlippageSavedUsd.toFixed(0)}</div>
                    </div>
                  </div>

                  <button
                    onClick={handleResetModal}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    Close & View in DIN Dashboard
                  </button>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleFormulateAndSubmit} className="space-y-5">
              {/* Venue Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center justify-between">
                  <span>1. Select Target External Venue & Chain</span>
                  <span className="text-[10px] text-orange-600 font-medium lowercase">Cross-chain atomic</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {VENUE_OPTIONS.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVenue(v.id)}
                      className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        selectedVenue === v.id
                          ? 'bg-orange-500/10 border-orange-500 text-gray-900 ring-1 ring-orange-500 shadow-sm'
                          : 'bg-white/60 border-gray-200/80 hover:bg-white text-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Globe className="w-4 h-4 text-orange-500" />
                        <div>
                          <div className="text-xs font-bold">{v.label}</div>
                          <div className="text-[10px] text-gray-500 font-medium">{v.chain}</div>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${v.badgeColor}`}>
                        {LIQUIDITY_VENUES[v.id]?.executionType || 'AMM'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Asset & Allocation Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Asset */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    2. Target Asset
                  </label>
                  <select
                    value={selectedAsset}
                    onChange={(e) => setSelectedAsset(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {currentVenue.supportedAssets.map((ast) => (
                      <option key={ast} value={ast}>
                        {ast} (on {currentVenue.name})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Capital Allocation */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      3. Capital Allocation ($ vUSD)
                    </label>
                    <span className="text-[10px] text-gray-500 font-mono">
                      Vault: ${vaultBalance.toLocaleString()} vUSD
                    </span>
                  </div>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="number"
                      value={amountUsd}
                      onChange={(e) => setAmountUsd(Number(e.target.value))}
                      step={1000}
                      min={1000}
                      className="w-full pl-8 pr-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-bold font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="50000"
                    />
                  </div>
                </div>
              </div>

              {/* Execution Constraints: Limit Price & Expiry */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-600 uppercase">
                    Max Limit Price ($)
                  </label>
                  <input
                    type="number"
                    value={limitPriceUsd}
                    onChange={(e) => setLimitPriceUsd(Number(e.target.value))}
                    step={0.01}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-mono font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-600 uppercase">
                    Max Slippage Cap
                  </label>
                  <select
                    value={slippageTolerancePct}
                    onChange={(e) => setSlippageTolerancePct(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value={0.5}>0.5% (Strict Limit)</option>
                    <option value={1.0}>1.0% (Balanced)</option>
                    <option value={1.5}>1.5% (Institutional Standard)</option>
                    <option value={3.0}>3.0% (Deep Liquidity Sweep)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-600 uppercase">
                    Schedule Expiry
                  </label>
                  <select
                    value={expiryHours}
                    onChange={(e) => setExpiryHours(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value={1}>1 Hour</option>
                    <option value={4}>4 Hours</option>
                    <option value={24}>24 Hours</option>
                    <option value={48}>48 Hours (Full TWAP)</option>
                  </select>
                </div>
              </div>

              {/* Cryptographic Privacy Guarantees Box */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
                  <Lock className="w-3.5 h-3.5 text-orange-500" />
                  <span>Midnight Zero-Knowledge Intent Guarantees</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div className="p-2 rounded-xl bg-white border border-gray-200/60">
                    <span className="text-gray-500 block text-[10px]">Order Book Leaks</span>
                    <span className="font-bold text-emerald-700">0% (Shielded)</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-gray-200/60">
                    <span className="text-gray-500 block text-[10px]">Estimated Output</span>
                    <span className="font-bold text-gray-900 font-mono">
                      ~{(amountUsd / targetRoute.executionPriceUsd).toFixed(2)} {selectedAsset}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-gray-200/60">
                    <span className="text-gray-500 block text-[10px]">Est. Venue Slippage</span>
                    <span className="font-bold text-emerald-700 font-mono">
                      {targetRoute.priceImpactPct.toFixed(3)}%
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-gray-200/60">
                    <span className="text-gray-500 block text-[10px]">AMM Savings vs Isolated</span>
                    <span className="font-bold text-emerald-700 font-mono">
                      +${comparison.totalSlippageSavedUsd.toFixed(0)}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed pt-1">
                  Your overarching portfolio balance, stop-loss trigger, and execution schedule are encrypted in zero knowledge on Midnight. Solvers only receive the atomic state proof constraint.
                </p>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isExecuting}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-sm shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {walletConnected ? (
                  <>
                    <Zap className="w-4 h-4 fill-current" />
                    Commit Private Intent & Broadcast RFQ Auction
                  </>
                ) : (
                  'Connect Wallet to Formulate Dark Intent'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
