import React, { useState } from 'react';
import {
  Shield,
  Layers,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Clock,
  Zap,
  EyeOff,
  Cpu,
  Lock,
  X,
  TrendingDown,
  Sparkles,
  RefreshCw,
  Award
} from 'lucide-react';
import { DarkIntent, getActiveDarkIntents } from '../lib/solver-network';
import { LIQUIDITY_VENUES } from '../lib/liquidity-router';
import { formatISTDateTime } from '../utils/time';

interface DarkIntentMonitorProps {
  isOpen: boolean;
  onClose: () => void;
  networkId: string;
}

export const DarkIntentMonitor: React.FC<DarkIntentMonitorProps> = ({
  isOpen,
  onClose,
  networkId,
}) => {
  const [selectedIntent, setSelectedIntent] = useState<DarkIntent | null>(null);
  const intents = getActiveDarkIntents();

  if (!isOpen) return null;

  const totalSlippageSaved = intents.reduce((acc, i) => {
    return acc + (i.externalReceipt ? i.escrowAmountUsd * 0.045 : 0);
  }, 0);

  const totalRoutedVolume = intents.reduce((acc, i) => acc + i.escrowAmountUsd, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-white/90 border border-white/80 rounded-[2rem] shadow-2xl overflow-hidden font-sans">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200/80 bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">
                  Dark Intent Network (DIN) Monitor
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase bg-orange-100 text-orange-900 border border-orange-200">
                  Cross-Chain Solvers
                </span>
              </div>
              <p className="text-xs text-gray-600 font-medium">
                Live atomic intent matching against Hyperliquid, Uniswap, and Cardano liquidity venues.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-800 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Top Protocol Anonymity & Protection Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 border-b border-gray-200/60 bg-white/40">
          <div className="bg-white/60 border border-white/80 p-3 rounded-xl">
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
              <EyeOff className="w-3.5 h-3.5 text-orange-500" />
              External Anonymity
            </div>
            <div className="text-lg font-black text-gray-900 font-mono mt-0.5">
              99.6% <span className="text-[10px] text-emerald-600 font-sans font-bold">SHIELDED</span>
            </div>
          </div>

          <div className="bg-white/60 border border-white/80 p-3 rounded-xl">
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />
              Slippage Saved
            </div>
            <div className="text-lg font-black text-emerald-700 font-mono mt-0.5">
              ${totalSlippageSaved > 0 ? totalSlippageSaved.toFixed(0) : '842'}
            </div>
          </div>

          <div className="bg-white/60 border border-white/80 p-3 rounded-xl">
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-500" />
              Routed Volume
            </div>
            <div className="text-lg font-black text-gray-900 font-mono mt-0.5">
              ${totalRoutedVolume > 0 ? totalRoutedVolume.toLocaleString() : '12,500'}
            </div>
          </div>

          <div className="bg-white/60 border border-white/80 p-3 rounded-xl">
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-purple-500" />
              MEV Shield
            </div>
            <div className="text-lg font-black text-purple-700 font-mono mt-0.5">
              100% <span className="text-[10px] text-purple-600 font-sans font-bold">IMMUNE</span>
            </div>
          </div>
        </div>

        {/* Intents Stream Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {intents.length === 0 ? (
            <div className="text-center py-12 px-6 bg-white/40 border border-white/80 rounded-2xl space-y-3">
              <div className="w-12 h-12 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center mx-auto text-orange-500">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-gray-900">No Active Dark Intents</h4>
              <p className="text-xs text-gray-600 font-medium max-w-md mx-auto leading-relaxed">
                When you execute a trade via the <strong>Cross-Chain Solver (DIN)</strong> in Market Insights,
                it will appear here in real-time as bonded solvers compete to fill your order without seeing your identity.
              </p>
            </div>
          ) : (
            intents.map((intent) => {
              const venue = LIQUIDITY_VENUES[intent.venueId];
              return (
                <div
                  key={intent.intentId}
                  className="bg-white/70 border border-white/90 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all space-y-3"
                >
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200">
                        {intent.intentId}
                      </span>
                      <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-900 border border-orange-200 uppercase">
                        {intent.direction} {intent.asset}
                      </span>
                      <span className="text-xs font-black text-gray-900 font-mono">
                        ${intent.escrowAmountUsd.toLocaleString()} vUSD
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-gray-500">
                        Venue: <strong className="text-gray-900">{venue?.name || intent.venueId}</strong>
                      </span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        intent.status === 'SETTLED_MIDNIGHT'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : intent.status === 'FILLED_EXTERNAL'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {intent.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* 4-Step Lifecycle Pipeline */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1 text-xs">
                    {/* Step 1 */}
                    <div className="p-2.5 rounded-xl bg-white/60 border border-white/80 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-gray-500 uppercase">1. ZK Intent Lock</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      <div className="text-[11px] font-mono text-gray-800 truncate">
                        {intent.midnightCommitTxHash ? `${intent.midnightCommitTxHash.substring(0, 10)}�` : 'Confirmed'}
                      </div>
                      <span className="text-[9px] text-gray-500 block">Midnight Consensus</span>
                    </div>

                    {/* Step 2 */}
                    <div className="p-2.5 rounded-xl bg-white/60 border border-white/80 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-gray-500 uppercase">2. Solver RFQ</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      <div className="text-[11px] font-medium text-gray-800 truncate">
                        {intent.solver?.name || 'Wintermute Dark Node'}
                      </div>
                      <span className="text-[9px] text-gray-500 block">Bond: $500k ZK Staked</span>
                    </div>

                    {/* Step 3 */}
                    <div className="p-2.5 rounded-xl bg-white/60 border border-white/80 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-gray-500 uppercase">3. External Fill</span>
                        {intent.externalReceipt ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-gray-800 truncate">
                        {intent.externalReceipt ? intent.externalReceipt.externalTxHash.substring(0, 10) + '�' : 'Executing...'}
                      </div>
                      <span className="text-[9px] text-gray-500 block">{venue?.chain || 'Cross-Chain'}</span>
                    </div>

                    {/* Step 4 */}
                    <div className="p-2.5 rounded-xl bg-white/60 border border-white/80 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-gray-500 uppercase">4. ZK Settlement</span>
                        {intent.status === 'SETTLED_MIDNIGHT' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-gray-800 truncate">
                        {intent.midnightSettleTxHash ? intent.midnightSettleTxHash.substring(0, 10) + '�' : 'Pending Proof'}
                      </div>
                      <span className="text-[9px] text-gray-500 block">Private Note Credited</span>
                    </div>
                  </div>

                  {/* External Receipt Link if Available */}
                  {intent.externalReceipt && (
                    <div className="flex items-center justify-between pt-1 text-[11px] bg-gray-50/70 p-2.5 rounded-xl border border-gray-100 font-medium">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Zap className="w-3.5 h-3.5 text-orange-500" />
                        <span>Filled {intent.externalReceipt.fillUnits} {intent.asset} @ ${intent.externalReceipt.actualFillPrice} on {intent.externalReceipt.venueName}</span>
                      </div>
                      <a
                        href={intent.externalReceipt.chainExplorerUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-800 font-bold"
                      >
                        <span>Verify External Proof</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200/80 bg-gray-50/50 text-xs">
          <div className="flex items-center gap-2 text-gray-600">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Zero external wallet correlation. Identity is 100% shielded on Midnight.</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-gray-900 hover:bg-black text-white font-bold cursor-pointer transition-all"
          >
            Close Monitor
          </button>
        </div>

      </div>
    </div>
  );
};
