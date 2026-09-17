import React, { useState, useMemo } from 'react';
import {
  X,
  Shuffle,
  ShieldCheck,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Sliders,
  Sparkles,
  TrendingDown,
  Layers
} from 'lucide-react';
import {
  createIcebergOrder,
  generateTemporalSchedule,
} from '../lib/iceberg-engine';

interface IcebergRelayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletConnected: boolean;
  walletAddress: string | null;
  vaultBalance: number;
  onConnectWallet: () => void;
  onOrderCreated: () => void;
}

export const IcebergRelayerModal: React.FC<IcebergRelayerModalProps> = ({
  isOpen,
  onClose,
  walletConnected,
  walletAddress,
  vaultBalance,
  onConnectWallet,
  onOrderCreated,
}) => {
  const [assetSymbol, setAssetSymbol] = useState<string>('BTC');
  const [totalNotional, setTotalNotional] = useState<number>(50000);
  const [timeHorizonHours, setTimeHorizonHours] = useState<number>(24);
  const [sliceCount, setSliceCount] = useState<number>(8);
  const [timeVariancePct, setTimeVariancePct] = useState<number>(30);
  const [sizeVariancePct, setSizeVariancePct] = useState<number>(25);
  const [maxPriceLimitUsd, setMaxPriceLimitUsd] = useState<number>(69500);
  const [dipBuyerActive, setDipBuyerActive] = useState<boolean>(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Live preview of the temporal schedule
  const previewSlices = useMemo(() => {
    try {
      if (totalNotional <= 0 || sliceCount <= 0) return [];
      return generateTemporalSchedule('0xpreview', {
        totalAmount: totalNotional,
        sliceCount,
        horizonHours: timeHorizonHours,
        timeVariancePct,
        sizeVariancePct,
        startEpochMs: Date.now(),
      });
    } catch {
      return [];
    }
  }, [totalNotional, sliceCount, timeHorizonHours, timeVariancePct, sizeVariancePct]);

  if (!isOpen) return null;

  const handleAssetChange = (sym: string) => {
    setAssetSymbol(sym);
    if (sym === 'BTC') setMaxPriceLimitUsd(69500);
    else if (sym === 'ETH') setMaxPriceLimitUsd(3650);
    else if (sym === 'SOL') setMaxPriceLimitUsd(165);
    else if (sym === 'ADA') setMaxPriceLimitUsd(0.95);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletConnected || !walletAddress) {
      onConnectWallet();
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      await createIcebergOrder({
        traderAddress: walletAddress,
        assetSymbol,
        totalNotionalUsd: Number(totalNotional),
        timeHorizonHours: Number(timeHorizonHours),
        sliceCount: Number(sliceCount),
        timeVariancePct: Number(timeVariancePct),
        sizeVariancePct: Number(sizeVariancePct),
        maxPriceLimitUsd: Number(maxPriceLimitUsd),
        dipBuyerActive,
      });

      onOrderCreated();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto font-sans">
      <div className="relative w-full max-w-2xl bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden my-8 space-y-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <Shuffle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">
                Create ZK-Iceberg Order
              </h3>
              <p className="text-xs text-gray-500 font-medium">
                Temporal Shuffling & Anti-MEV Institutional TWAP Relayer
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Available Vault Balance */}
        <div className="bg-orange-50/80 border border-orange-200 rounded-2xl p-3.5 flex items-center justify-between text-xs font-medium">
          <span className="text-orange-950 flex items-center gap-1.5 font-bold">
            <Lock className="w-3.5 h-3.5 text-orange-600" />
            Shielded Vault Balance:
          </span>
          <span className="text-sm font-black text-orange-700">
            ${vaultBalance.toLocaleString()} vUSD
          </span>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-2xl flex items-center gap-2 font-medium">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Asset & Total Capital */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Target Asset</label>
              <select
                value={assetSymbol}
                onChange={(e) => handleAssetChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-bold focus:outline-none focus:border-indigo-500"
              >
                <option value="BTC">Bitcoin (BTC / vUSD)</option>
                <option value="ETH">Ethereum (ETH / vUSD)</option>
                <option value="SOL">Solana (SOL / vUSD)</option>
                <option value="ADA">Cardano (ADA / vUSD)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Total Allocation ($ vUSD)
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="number"
                  min={1000}
                  step={1000}
                  value={totalNotional}
                  onChange={(e) => setTotalNotional(Number(e.target.value))}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-bold focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Time Horizon & Slice Count */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Execution Horizon</label>
              <select
                value={timeHorizonHours}
                onChange={(e) => setTimeHorizonHours(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-xs font-bold focus:outline-none focus:border-indigo-500"
              >
                <option value={6}>6 Hours (Fast TWAP)</option>
                <option value={12}>12 Hours</option>
                <option value={24}>24 Hours (Standard)</option>
                <option value={48}>48 Hours (Institutional)</option>
                <option value={72}>72 Hours (Macro Whale)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Micro-Slices ({sliceCount})
              </label>
              <input
                type="number"
                min={3}
                max={30}
                value={sliceCount}
                onChange={(e) => setSliceCount(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-xs font-bold focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Max Price Limit ($)
              </label>
              <input
                type="number"
                step="any"
                value={maxPriceLimitUsd}
                onChange={(e) => setMaxPriceLimitUsd(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-xs font-bold focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Temporal Shuffling Jitter Sliders */}
          <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-gray-900">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                Temporal Shuffling & Anti-Correlation Jitter
              </span>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Anti-MEV Active
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <div className="flex justify-between text-[11px] font-semibold text-gray-600 mb-1">
                  <span>Time Interval Jitter:</span>
                  <span className="font-mono text-indigo-600 font-bold">±{timeVariancePct}%</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={50}
                  value={timeVariancePct}
                  onChange={(e) => setTimeVariancePct(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-semibold text-gray-600 mb-1">
                  <span>Slice Size Variance:</span>
                  <span className="font-mono text-indigo-600 font-bold">±{sizeVariancePct}%</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={40}
                  value={sizeVariancePct}
                  onChange={(e) => setSizeVariancePct(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Dip Buyer Toggle */}
            <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-gray-900 block">Dip-Buyer Volatility Guard</span>
                <span className="text-[11px] text-gray-500">
                  Delay slice executions during local price spikes to optimize VWAP.
                </span>
              </div>
              <input
                type="checkbox"
                checked={dipBuyerActive}
                onChange={(e) => setDipBuyerActive(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Schedule Visualization Preview */}
          {previewSlices.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <span>Temporal Schedule Preview ({previewSlices.length} Slices)</span>
                <span className="text-emerald-600">Sum = ${totalNotional.toLocaleString()} vUSD (100% Conserved)</span>
              </div>

              <div className="flex items-end gap-1.5 h-16 bg-white border border-gray-200 rounded-2xl p-2 overflow-x-auto">
                {previewSlices.map((slice, idx) => {
                  const maxVal = (totalNotional / sliceCount) * 1.5;
                  const heightPct = Math.min(100, Math.max(20, (slice.plannedNotionalUsd / maxVal) * 100));

                  return (
                    <div
                      key={slice.sliceId}
                      className="flex-1 min-w-[28px] flex flex-col items-center justify-end h-full group relative"
                    >
                      <div
                        style={{ height: `${heightPct}%` }}
                        className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-md transition-all group-hover:from-indigo-700 group-hover:to-indigo-500"
                      />
                      <span className="text-[9px] font-mono text-gray-400 mt-0.5">#{idx + 1}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isSubmitting || totalNotional > vaultBalance || totalNotional <= 0}
            className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Committing Shielded Iceberg Order to Midnight...</span>
              </>
            ) : totalNotional > vaultBalance ? (
              <span>Insufficient Shielded Vault Balance</span>
            ) : (
              <>
                <Shuffle className="w-4 h-4 text-indigo-200" />
                <span>Commit ZK-Iceberg Order (${totalNotional.toLocaleString()} vUSD)</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
