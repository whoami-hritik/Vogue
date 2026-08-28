import React from 'react';
import { Users, AlertCircle, Loader2 } from 'lucide-react';
import { useMetrics } from '../hooks/useMetrics';

const TARGET = 50;

export const PreprodCounter: React.FC = () => {
  const { preprodUsers, totalOps, successRate, loading, unavailable } = useMetrics();

  if (loading) {
    return (
      <div className="bg-white border border-gray-200/80 rounded-2xl p-4 sm:p-5 shadow-sm flex items-center gap-3">
        <Loader2 className="w-4 h-4 text-gray-400 animate-spin shrink-0" />
        <span className="text-xs text-gray-500">Loading Preprod metrics…</span>
      </div>
    );
  }

  if (unavailable) {
    return (
      <div className="bg-white border border-gray-200/80 rounded-2xl p-4 sm:p-5 shadow-sm flex items-center gap-3">
        <AlertCircle className="w-4 h-4 text-gray-400 shrink-0" />
        <span className="text-xs text-gray-400">Preprod metrics unavailable</span>
      </div>
    );
  }

  const pct = Math.min(100, Math.round((preprodUsers / TARGET) * 100));
  const reached = preprodUsers >= TARGET;

  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-orange-500" />
          <span className="text-xs font-extrabold text-gray-900 uppercase tracking-wide">Preprod Users</span>
        </div>
        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
          reached ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-50 text-orange-700 border border-orange-200'
        }`}>
          {reached ? '✓ TARGET MET' : 'LEVEL 5'}
        </span>
      </div>
      <div className="flex items-end gap-1">
        <span className="text-3xl font-extrabold text-gray-900 tabular-nums leading-none">{preprodUsers}</span>
        <span className="text-sm font-bold text-gray-400 mb-0.5">/ {TARGET}</span>
        <span className="text-xs text-gray-500 ml-1 mb-0.5">real wallets on Preprod</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${
            reached ? 'bg-emerald-500' : 'bg-orange-500'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="grid grid-cols-2 gap-2 pt-1">
        <div className="bg-gray-50 rounded-xl p-2.5">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Total Ops</p>
          <p className="text-sm font-bold text-gray-900 tabular-nums">{totalOps.toLocaleString()}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-2.5">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Success Rate</p>
          <p className="text-sm font-bold text-gray-900 tabular-nums">
            {totalOps > 0 ? `${(successRate * 100).toFixed(1)}%` : '—'}
          </p>
        </div>
      </div>
      <p className="text-[10px] text-gray-400">
        Each wallet performed a real transaction on Midnight Preprod. Verifiable on{' '}
        <a href="https://explorer.1am.xyz?network=preprod" target="_blank" rel="noreferrer" className="text-orange-500 hover:underline">
          explorer.1am.xyz
        </a>.
      </p>

    </div>
  );
};