import React, { useState, useEffect } from 'react';
import {
  Shuffle,
  Clock,
  ShieldCheck,
  TrendingDown,
  DollarSign,
  Play,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Zap,
  Activity,
  Layers,
  ArrowUpRight,
  Eye,
  Sliders,
  Plus,
  RefreshCw,
  X
} from 'lucide-react';
import {
  IcebergOrder,
  IcebergSlice,
  getAllIcebergOrders,
  dispatchIcebergSlice,
  cancelIcebergOrder,
  createIcebergOrder,
} from '../lib/iceberg-engine';
import { IcebergRelayerModal } from './IcebergRelayerModal';

interface IcebergMonitorProps {
  walletConnected: boolean;
  walletAddress: string | null;
  vaultBalance: number;
  onConnectWallet: () => void;
  onRefreshVault?: () => void;
}

export const IcebergMonitor: React.FC<IcebergMonitorProps> = ({
  walletConnected,
  walletAddress,
  vaultBalance,
  onConnectWallet,
  onRefreshVault,
}) => {
  const [orders, setOrders] = useState<IcebergOrder[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dispatchingOrderId, setDispatchingOrderId] = useState<string | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const loadOrders = () => {
    setOrders(getAllIcebergOrders());
  };

  useEffect(() => {
    loadOrders();
  }, [walletAddress]);

  // Aggregate metrics
  const activeOrders = orders.filter((o) => o.status === 'ACTIVE');
  const totalActiveCapital = activeOrders.reduce((sum, o) => sum + o.remainingNotionalUsd, 0);

  const totalFilledSlices = orders.flatMap((o) => o.slices).filter((s) => s.status === 'FILLED');
  const totalMevSaved = totalFilledSlices.reduce((sum, s) => sum + (s.mevSavedUsd || 0), 0);

  const handleDispatchNextSlice = async (order: IcebergOrder) => {
    setDispatchingOrderId(order.orderId);
    setActionSuccessMsg(null);

    try {
      const fillPrice = Number(order.maxPriceLimitUsd.toFixed(2));

      const res = await dispatchIcebergSlice(order.orderId, fillPrice);
      loadOrders();
      if (onRefreshVault) onRefreshVault();

      setActionSuccessMsg(
        `Micro-Slice #${res.slice.sliceIndex + 1} filled at $${fillPrice.toLocaleString()}! MEV Saved: $${res.mevSavedUsd} vUSD.`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(msg);
    } finally {
      setDispatchingOrderId(null);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Cancel this ZK-Iceberg order and refund unspent collateral to your shielded vault?')) {
      return;
    }

    try {
      const res = await cancelIcebergOrder(orderId);
      loadOrders();
      if (onRefreshVault) onRefreshVault();
      setActionSuccessMsg(`Order cancelled. $${res.refundedAmountUsd.toLocaleString()} vUSD refunded to your Shielded Vault.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(msg);
    }
  };

  const handleSeedDemoOrder = async () => {
    if (!walletAddress) {
      onConnectWallet();
      return;
    }

    try {
      await createIcebergOrder({
        traderAddress: walletAddress,
        assetSymbol: 'BTC',
        totalNotionalUsd: Math.min(vaultBalance, 60000) || 60000,
        timeHorizonHours: 24,
        sliceCount: 6,
        timeVariancePct: 35,
        sizeVariancePct: 25,
        maxPriceLimitUsd: 69500,
        dipBuyerActive: true,
      });

      loadOrders();
      if (onRefreshVault) onRefreshVault();
    } catch (err) {
      console.warn('Seed error:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 font-sans pb-16">
      {/* Hero Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-gray-200/80">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-bold shadow-xs">
            <Shuffle className="w-3.5 h-3.5 text-indigo-600" />
            <span>Anti-MEV Institutional Execution Protocol</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            ZK-Iceberg & Temporal Shuffling Relayer
          </h1>
          <p className="text-sm text-gray-600 font-medium max-w-2xl leading-relaxed">
            Execute large capital orders without front-running decay. Midnight zero-knowledge proofs
            authorize randomized, un-linkable on-chain micro-slices across time, neutralizing MEV sandwich bots.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {orders.length === 0 && (
            <button
              onClick={handleSeedDemoOrder}
              className="py-2.5 px-4 rounded-2xl bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Seed Demo Iceberg</span>
            </button>
          )}

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-indigo-200" />
            <span>Create ZK-Iceberg Order</span>
          </button>
        </div>
      </div>

      {/* Protocol Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="light-glass border border-white/80 rounded-2xl p-4 space-y-1 shadow-xs">
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">
            ACTIVE ICEBERG CAPITAL
          </span>
          <span className="text-2xl font-black text-gray-900">
            ${totalActiveCapital.toLocaleString()}
          </span>
          <span className="text-[10px] text-indigo-600 font-semibold block">
            {activeOrders.length} Active Parent Orders
          </span>
        </div>
        <div className="light-glass border border-white/80 rounded-2xl p-4 space-y-1 shadow-xs">
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">
            MEV SLIPPAGE SAVED
          </span>
          <span className="text-2xl font-black text-emerald-600">
            ${totalMevSaved.toLocaleString()}
          </span>
          <span className="text-[10px] text-emerald-700 font-semibold block">
            ~3.2% vs. Public DEX TWAP
          </span>
        </div>
        <div className="light-glass border border-white/80 rounded-2xl p-4 space-y-1 shadow-xs">
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">
            MICRO-SLICES SETTLED
          </span>
          <span className="text-2xl font-black text-gray-900">
            {totalFilledSlices.length}
          </span>
          <span className="text-[10px] text-gray-500 font-semibold block">
            Poisson-Jittered Time Slots
          </span>
        </div>
        <div className="light-glass border border-white/80 rounded-2xl p-4 space-y-1 shadow-xs">
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">
            ANTI-AUTOCORRELATION
          </span>
          <span className="text-2xl font-black text-indigo-600">100%</span>
          <span className="text-[10px] text-indigo-700 font-semibold block">
            Zero Periodic Signal Leakage
          </span>
        </div>
      </div>

      {/* Success Banner */}
      {actionSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-2xl text-xs flex items-center justify-between font-semibold shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-950">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Educational Anti-MEV Comparison Visualizer */}
      <div className="light-glass border border-white/80 rounded-3xl p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-600" />
            <span>Temporal Shuffling Defense vs. Toxic Sandwich MEV</span>
          </h3>
          <span className="text-[11px] font-bold text-gray-500 bg-white/70 px-2.5 py-1 rounded-full border border-gray-200">
            Cryptographic Comparison
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Public TWAP (Vulnerable) */}
          <div className="bg-red-50/60 border border-red-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-red-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                Transparent Public TWAP (Ethereum / Solana)
              </span>
              <span className="text-[10px] font-mono text-red-700 bg-red-100 px-2 py-0.5 rounded font-bold">
                HIGH MEV LEAKAGE
              </span>
            </div>
            <p className="text-[11px] text-red-800 leading-relaxed">
              Deterministic orders fire at fixed 15-minute intervals. MEV bots detect the repeating timer,
              front-run liquidity, and sandwich every micro-fill, imposing 3% to 7% cumulative slippage decay.
            </p>
            {/* Visual fixed bars */}
            <div className="flex items-center justify-between pt-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className="w-8 h-8 rounded-lg bg-red-200 border border-red-400 flex items-center justify-center font-mono text-[10px] text-red-900 font-bold">
                    15m
                  </div>
                  <span className="text-[9px] text-red-600 font-mono">Slice {i}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Vogue ZK-Temporal Shuffling (Protected) */}
          <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-emerald-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Vogue ZK-Temporal Shuffling (Midnight)
              </span>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-bold">
                100% MEV NEUTRALIZED
              </span>
            </div>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              Both time intervals (Poisson jitter) and slice sizes are randomized. Each fill is authorized via
              a Midnight zero-knowledge balance proof, appearing to forensics as disjoint, unrelated swaps.
            </p>
            {/* Visual jittered bars */}
            <div className="flex items-center justify-between pt-2">
              {[
                { time: '11m', h: 'h-6' },
                { time: '23m', h: 'h-9' },
                { time: '14m', h: 'h-7' },
                { time: '31m', h: 'h-10' },
                { time: '17m', h: 'h-5' },
                { time: '19m', h: 'h-8' },
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1">
                  <div className={`w-8 ${item.h} rounded-lg bg-emerald-300 border border-emerald-500 flex items-center justify-center font-mono text-[10px] text-emerald-950 font-bold`}>
                    {item.time}
                  </div>
                  <span className="text-[9px] text-emerald-700 font-mono">Slot {idx + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Orders List & Slices Monitor */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>Active ZK-Iceberg Orders ({orders.length})</span>
          </h3>
          <button
            onClick={loadOrders}
            className="text-xs text-gray-500 hover:text-gray-800 flex items-center gap-1 font-medium transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="light-glass border border-white/80 rounded-3xl p-12 text-center space-y-4 max-w-md mx-auto">
            <div className="w-14 h-14 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
              <Shuffle className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-extrabold text-gray-900">No Active ZK-Iceberg Orders</h3>
            <p className="text-xs text-gray-600 font-medium leading-relaxed">
              Create an institutional iceberg order to break large executions into randomized, un-linkable micro-slices across time.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={handleSeedDemoOrder}
                className="py-2.5 px-5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Seed Demo Iceberg Order
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="py-2.5 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Create Custom Order
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const fillPct = Math.min(100, Math.round((order.filledNotionalUsd / order.totalNotionalUsd) * 100));
              const nextPendingSlice = order.slices.find((s) => s.status === 'PENDING');

              return (
                <div
                  key={order.orderId}
                  className={`light-glass border ${
                    order.status === 'ACTIVE'
                      ? 'border-indigo-200/90 shadow-sm'
                      : order.status === 'COMPLETED'
                      ? 'border-emerald-200'
                      : 'border-gray-200'
                  } rounded-3xl p-6 space-y-5 transition-all`}
                >
                  {/* Order Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-extrabold text-gray-900">
                          {order.assetSymbol}/vUSD • ${order.totalNotionalUsd.toLocaleString()} vUSD
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 border border-indigo-200 text-indigo-700 font-mono">
                          {order.timeHorizonHours}H Horizon
                        </span>
                        {order.dipBuyerActive && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-800">
                            Dip-Buyer Active
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-[10px] text-gray-400">
                        Order ID: {order.orderId} • Commitment: {order.commitmentHash.substring(0, 24)}...
                      </span>
                    </div>

                    {/* Status & Cancel Action */}
                    <div className="flex items-center gap-3">
                      {order.status === 'ACTIVE' ? (
                        <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 border border-blue-200 text-blue-800 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                          RELAYING ({fillPct}%)
                        </span>
                      ) : order.status === 'COMPLETED' ? (
                        <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          COMPLETED (100%)
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-gray-100 text-gray-700">
                          CANCELLED
                        </span>
                      )}

                      {order.status === 'ACTIVE' && (
                        <button
                          onClick={() => handleCancelOrder(order.orderId)}
                          className="py-1.5 px-3 rounded-xl bg-white hover:bg-red-50 border border-gray-200 hover:border-red-200 text-gray-700 hover:text-red-700 text-xs font-bold transition-all cursor-pointer"
                        >
                          Cancel & Refund
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Financial Stats & Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-gray-700">
                      <span>Execution Progress ({fillPct}%)</span>
                      <span>
                        Filled: ${order.filledNotionalUsd.toLocaleString()} / Remaining: ${order.remainingNotionalUsd.toLocaleString()} vUSD
                      </span>
                    </div>
                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${fillPct}%` }}
                        className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-500"
                      />
                    </div>
                  </div>

                  {/* Execution Metrics Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/70 border border-gray-100 rounded-2xl p-3 text-center">
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold block uppercase">EXECUTED VWAP</span>
                      <span className="text-sm font-black text-gray-900">
                        {order.averageExecutedVwapUsd > 0 ? `$${order.averageExecutedVwapUsd.toLocaleString()}` : '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold block uppercase">MAX LIMIT PRICE</span>
                      <span className="text-sm font-black text-indigo-600">
                        ${order.maxPriceLimitUsd.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold block uppercase">SLICES COUNT</span>
                      <span className="text-sm font-black text-gray-900">
                        {order.slices.filter((s) => s.status === 'FILLED').length} / {order.slices.length}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold block uppercase">ESTIMATED MEV SAVED</span>
                      <span className="text-sm font-black text-emerald-600">
                        ${order.slices.reduce((sum, s) => sum + (s.mevSavedUsd || 0), 0).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Quick Dispatch Action (if active) */}
                  {order.status === 'ACTIVE' && nextPendingSlice && (
                    <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="space-y-0.5">
                        <span className="font-bold text-indigo-950 flex items-center gap-1.5">
                          <Play className="w-3.5 h-3.5 text-indigo-600" />
                          Next Scheduled Micro-Slice: #{nextPendingSlice.sliceIndex + 1} (${nextPendingSlice.plannedNotionalUsd.toLocaleString()} vUSD)
                        </span>
                        <p className="text-[11px] text-indigo-700">
                          Dispatched through disjoint temporal nullifier path with zero public mempool exposure.
                        </p>
                      </div>

                      <button
                        onClick={() => handleDispatchNextSlice(order)}
                        disabled={dispatchingOrderId === order.orderId}
                        className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                      >
                        {dispatchingOrderId === order.orderId ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Proving Slice...</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5" />
                            <span>Dispatch Next Slice</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Micro-Slices Queue */}
                  <div className="space-y-2 pt-1">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                      Micro-Slice Execution Timeline ({order.slices.length} Slices)
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {order.slices.map((slice) => (
                        <div
                          key={slice.sliceId}
                          className={`p-3 rounded-2xl border text-xs space-y-1.5 ${
                            slice.status === 'FILLED'
                              ? 'bg-emerald-50/60 border-emerald-200'
                              : slice.status === 'PENDING'
                              ? 'bg-white border-gray-200'
                              : 'bg-gray-50 border-gray-200 opacity-60'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-gray-900">
                              Slice #{slice.sliceIndex + 1}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                slice.status === 'FILLED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : slice.status === 'PENDING'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-200 text-gray-700'
                              }`}
                            >
                              {slice.status}
                            </span>
                          </div>

                          <div className="flex justify-between font-semibold text-gray-700">
                            <span>Notional:</span>
                            <span className="font-mono font-bold">${slice.plannedNotionalUsd.toLocaleString()}</span>
                          </div>

                          {slice.status === 'FILLED' ? (
                            <div className="space-y-0.5 pt-1 border-t border-emerald-200/60">
                              <div className="flex justify-between text-[11px] text-emerald-800">
                                <span>Fill Price:</span>
                                <span className="font-mono font-bold">${slice.fillPriceUsd?.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between text-[10px] text-emerald-700">
                                <span>MEV Saved:</span>
                                <span className="font-bold">+${slice.mevSavedUsd}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="text-[10px] text-gray-400 font-mono">
                              Interval: ~{Math.round(slice.delayIntervalSeconds / 60)}m jitter
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Order Modal */}
      <IcebergRelayerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        walletConnected={walletConnected}
        walletAddress={walletAddress}
        vaultBalance={vaultBalance}
        onConnectWallet={onConnectWallet}
        onOrderCreated={loadOrders}
      />
    </div>
  );
};
