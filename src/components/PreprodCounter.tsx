import React from 'react';
import { Users, AlertCircle, Loader2 } from 'lucide-react';
import { useMetrics } from '../hooks/useMetrics';

const TARGET = 50;

export const PreprodCounter: React.FC = () => {
  const { preprodUsers, totalOps, successRate, loading, unavailable } = useMetrics();

  if (loading) {
    return (
      <div className="liquid-glass p-4 sm:p-5 flex items-center gap-3">
        <Loader2 className="w-4 h-4 text-zinc-400 animate-spin shrink-0" />
        <span className="text-xs font-mono text-zinc-400">Loading Preprod metrics…</span>
      </div>
    );
  }

  if (unavailable) {
    return (
      <div className="liquid-glass p-4 sm:p-5 flex items-center gap-3">
        <AlertCircle className="w-4 h-4 text-zinc-400 shrink-0" />
        <span className="text-xs font-mono text-zinc-400">Preprod metrics unavailable</span>
      </div>
    );
  }

  const pct = Math.min(100, Math.round((preprodUsers / TARGET) * 100));
  const reached = preprodUsers >= TARGET;

  return (
    <div className="liquid-glass p-5 space-y-3 font-sans">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-white" />
          <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">Preprod Users</span>
        </div>
        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider ${
          reached ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/[0.06] text-zinc-300 border border-white/10'
        }`}>
          {reached ? '✓ TARGET MET' : 'LEVEL 5'}
        </span>
      </div>
      <div className="flex items-end gap-1.5 pt-1">
        <span className="text-3xl font-extrabold text-white font-mono tabular-nums leading-none">{preprodUsers}</span>
        <span className="text-sm font-bold text-zinc-400 font-mono mb-0.5">/ {TARGET}</span>
        <span className="text-xs text-zinc-400 font-mono ml-1 mb-0.5">real wallets on Preprod</span>
      </div>
      <div className="w-full bg-white/[0.06] rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-1.5 rounded-full transition-all duration-500 ${
            reached ? 'bg-emerald-400' : 'bg-white'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="grid grid-cols-2 gap-2 pt-1">
        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-2.5">
          <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider font-medium">Total Ops</p>
          <p className="text-sm font-bold text-white font-mono tabular-nums">{totalOps.toLocaleString()}</p>
        </div>
        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-2.5">
          <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider font-medium">Success Rate</p>
          <p className="text-sm font-bold text-white font-mono tabular-nums">
            {totalOps > 0 ? `${(successRate * 100).toFixed(1)}%` : '—'}
          </p>
        </div>
      </div>
      <p className="text-[10px] text-zinc-500 font-mono">
        Each wallet performed a real transaction on Midnight Preprod. Verifiable on{' '}
        <a href="https://explorer.1am.xyz?network=preprod" target="_blank" rel="noreferrer" className="text-zinc-300 hover:text-white underline">
          explorer.1am.xyz
        </a>.
      </p>
    </div>
  );
};