import React, { useState } from 'react';
import {
  Cpu,
  ExternalLink,
  ShieldCheck,
  Zap,
  PlusCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import type { ActiveStrategy } from '../hooks/useMidnight';
import { formatISTDateTime } from '../utils/time';

interface OverviewStrategiesProps {
  activeStrategies: ActiveStrategy[];
  vaultBalance: number;
  networkId?: string;
  onNavigateTab: (tab: string) => void;
}

export const OverviewStrategies: React.FC<OverviewStrategiesProps> = ({
  activeStrategies,
  vaultBalance,
  networkId = 'preview',
  onNavigateTab,
}) => {
  const [showAll, setShowAll] = useState<boolean>(false);
  const displayedStrategies = showAll ? activeStrategies : activeStrategies.slice(0, 3);

  return (
    <div className="light-glass border border-gray-200/80 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/40">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-orange-500" />
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
              Active Strategy Commitments
            </h2>
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-white/60 border border-white/60 text-orange-800 font-extrabold uppercase shadow-sm">
              {activeStrategies.length} ACTIVE
            </span>
          </div>
          <p className="text-xs text-gray-600 font-medium">
            Locked zero-knowledge risk bounds applicable across all supported assets.
          </p>
        </div>

        <button
          onClick={() => onNavigateTab('strategy-builder')}
          className="self-start sm:self-auto px-5 py-2.5 rounded-full bg-gray-900 hover:bg-black text-white text-xs font-bold transition-all cursor-pointer shadow-sm hover:scale-[1.02] flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4 text-orange-400" />
          <span>Lock New Strategy</span>
        </button>
      </div>

      {/* Strategies List */}
      {activeStrategies.length === 0 ? (
        <div className="p-12 text-center space-y-4 light-glass border border-white/60 rounded-[2rem] shadow-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200/20 to-transparent pointer-events-none" />
          <div className="w-16 h-16 rounded-full bg-white border border-white/60 flex items-center justify-center mx-auto text-gray-600 shadow-sm relative z-10">
            <Cpu className="w-8 h-8 text-gray-400" />
          </div>
          <div className="space-y-2 relative z-10">
            <h4 className="text-lg font-extrabold text-gray-900">No Active Commitment</h4>
            <p className="text-xs text-gray-600 font-medium max-w-sm mx-auto">
              Lock your first multi-asset risk rules into the Midnight ZK circuit using AI natural-language parsing.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('strategy-builder')}
            className="mt-4 px-6 py-3 rounded-full bg-gray-900 hover:bg-black text-white text-sm font-bold transition-all cursor-pointer shadow-md hover:scale-[1.02] relative z-10"
          >
            Create Shielded Strategy
          </button>
        </div>
      ) : (
        <div className="space-y-6 pt-4">
          {displayedStrategies.map((strat, idx) => {
            const maxAllowed = Math.floor((vaultBalance * strat.params.maxPositionPct) / 100);
            return (
              <div
                key={strat.id || idx}
                className="light-glass hover:bg-white/50 border border-white/60 rounded-[2rem] p-6 space-y-6 transition-all shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-400/10 blur-3xl rounded-full -mr-10 -mt-10 pointer-events-none" />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/60 text-gray-900 border border-white/60 shadow-sm">
                      Strategy #{idx + 1}
                    </span>
                    <span className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      Agent: <code className="font-mono text-orange-600 bg-orange-50 px-2 py-0.5 rounded-lg border border-orange-100">{strat.agentId}</code>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 text-[11px] px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 font-extrabold uppercase tracking-widest border border-emerald-100 shadow-sm">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      ACTIVE ON CHAIN
                    </span>
                  </div>
                </div>

                {/* Risk Parameters Matrix */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10">
                  <div className="bg-white/40 border border-white/60 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Max Position</span>
                    <span className="text-3xl font-extrabold text-gray-900">{strat.params.maxPositionPct}%</span>
                    <span className="text-[10px] text-gray-500 font-semibold mt-1 bg-white/60 px-2 py-0.5 rounded-full">${maxAllowed} max</span>
                  </div>
                  <div className="bg-red-50/40 border border-red-100/60 p-4 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-red-400/5 pointer-events-none" />
                    <span className="text-[10px] text-red-700/70 font-bold uppercase tracking-wider mb-1">Stop-Loss Bound</span>
                    <span className="text-3xl font-extrabold text-red-600">-{strat.params.stopLossPct}%</span>
                    <span className="text-[10px] text-red-700/70 font-semibold mt-1 bg-red-100/50 px-2 py-0.5 rounded-full">ZK Verified</span>
                  </div>
                  <div className="bg-white/40 border border-white/60 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Duration</span>
                    <span className="text-3xl font-extrabold text-gray-900">{strat.params.timelineDays}d</span>
                    <span className="text-[10px] text-gray-500 font-semibold mt-1 bg-white/60 px-2 py-0.5 rounded-full">Time Lock Active</span>
                  </div>
                  <div className="bg-white/40 border border-white/60 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Committed (IST)</span>
                    <span className="text-sm font-bold text-gray-900 mt-2 font-mono">
                      {formatISTDateTime(strat.createdAt).split(' ')[0]}
                    </span>
                    <span className="text-xs font-bold text-gray-600 font-mono mt-1">
                      {formatISTDateTime(strat.createdAt).split(' ')[1]}
                    </span>
                  </div>
                </div>

                {/* Public Commitment Hash + CTA */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-white/40 relative z-10">
                  <div className="text-xs font-mono text-gray-500 flex items-center gap-2 bg-white/40 px-3 py-1.5 rounded-xl border border-white/60 shadow-sm max-w-[200px] sm:max-w-md">
                    <span className="font-bold text-gray-700 shrink-0">ZK Hash:</span>
                    <span className="truncate">{strat.commitmentHash}</span>
                    <a
                      href={networkId === 'preprod' ? 'https://explorer.1am.xyz/contract/2428cd4ae7c2cd0bb501e1e9162de3003b103c1063c220e0d5cfc3f0b438e524?network=preprod' : 'https://explorer.1am.xyz/contract/33eb41d22028264e9e8bbe7f95b3089cece6e3c2a53008535e72a9f3350d3e30?network=preview'}
                      target="_blank"
                      rel="noreferrer"
                      className="text-orange-600 hover:text-orange-700 hover:underline inline-flex items-center gap-0.5 font-bold shrink-0 ml-1"
                      title={`View contract on 1AM ${networkId === 'preprod' ? 'Preprod' : 'Preview'} Explorer`}
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <button
                    onClick={() => onNavigateTab('market-insights')}
                    className="px-5 py-2 rounded-full bg-gradient-to-r from-orange-400 to-amber-500 hover:scale-[1.02] text-white text-xs font-extrabold tracking-wide uppercase transition-all cursor-pointer self-start sm:self-auto flex items-center gap-2 shadow-md shadow-orange-500/20"
                  >
                    <Zap className="w-4 h-4 text-orange-100" />
                    <span>Execute Trades</span>
                  </button>
                </div>
              </div>
            );
          })}

          {/* Show More / Show Less Toggle Button */}
          {activeStrategies.length > 3 && (
            <div className="pt-4 text-center">
              <button
                onClick={() => setShowAll((prev) => !prev)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/60 hover:bg-white text-gray-900 text-xs font-extrabold tracking-widest uppercase transition-all cursor-pointer shadow-sm border border-white/60"
              >
                <span>{showAll ? 'Collapse to Top 3' : `View All ${activeStrategies.length}`}</span>
                {showAll ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
