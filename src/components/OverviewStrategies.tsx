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
    <div className="bg-white border border-gray-200/80 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-orange-500" />
            <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">
              Active Strategy Commitments & Position Bounds
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 font-bold uppercase">
              {activeStrategies.length} ACTIVE
            </span>
          </div>
          <p className="text-xs text-gray-500">
            Locked zero-knowledge risk bounds applicable across ADA, BTC, ETH, SOL & tNIGHT.
          </p>
        </div>

        <button
          onClick={() => onNavigateTab('strategy-builder')}
          className="self-start sm:self-auto px-4 py-2 rounded-full bg-gray-900 hover:bg-black text-white text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
        >
          <PlusCircle className="w-3.5 h-3.5 text-orange-400" />
          <span>+ Lock New Strategy</span>
        </button>
      </div>

      {/* Strategies List */}
      {activeStrategies.length === 0 ? (
        <div className="p-8 text-center space-y-3 bg-gray-50 rounded-2xl border border-gray-200/80">
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mx-auto text-gray-600 shadow-xs border border-gray-200">
            <Cpu className="w-6 h-6 text-orange-500" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-gray-900">No Active Strategy Commitment</h4>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Lock your first multi-asset risk rules into the Midnight ZK circuit using AI natural-language parsing.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('strategy-builder')}
            className="px-5 py-2.5 rounded-full bg-gray-900 hover:bg-black text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
          >
            + Create Shielded Strategy
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {displayedStrategies.map((strat, idx) => {
            const maxAllowed = Math.floor((vaultBalance * strat.params.maxPositionPct) / 100);
            return (
              <div
                key={strat.id || idx}
                className="bg-gray-50/70 hover:bg-gray-50 border border-gray-200/80 rounded-2xl p-4 space-y-3 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white text-gray-900 border border-gray-200 shadow-2xs">
                      Strategy #{idx + 1}
                    </span>
                    <span className="text-xs font-bold text-gray-900">
                      Agent ID: <code className="font-mono text-orange-600 font-semibold">{strat.agentId}</code>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold uppercase tracking-wider">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      ACTIVE ON CHAIN
                    </span>
                  </div>
                </div>

                {/* Risk Parameters Matrix */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs bg-white p-3 rounded-xl border border-gray-200/70">
                  <div>
                    <span className="text-[10px] text-gray-400 block font-medium">Max Position Size</span>
                    <span className="font-extrabold text-gray-900">{strat.params.maxPositionPct}% of Vault</span>
                    <span className="text-[10px] text-gray-500 block font-mono">(${maxAllowed} max)</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block font-medium">Stop-Loss Bound</span>
                    <span className="font-extrabold text-red-600">-{strat.params.stopLossPct}% Max Drawdown</span>
                    <span className="text-[10px] text-gray-500 block font-mono">ZK Verified</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block font-medium">Strategy Duration</span>
                    <span className="font-extrabold text-gray-900">{strat.params.timelineDays} Days</span>
                    <span className="text-[10px] text-gray-500 block font-mono">Time Lock Active</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block font-medium">Committed At (IST)</span>
                    <span className="font-bold text-gray-700 font-mono text-[11px]">
                      {formatISTDateTime(strat.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Public Commitment Hash + CTA */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                  <div className="text-[11px] font-mono text-gray-500 truncate max-w-md flex items-center gap-1.5">
                    <span className="font-semibold text-gray-700">ZK Hash:</span>
                    <span className="truncate">{strat.commitmentHash}</span>
                    <a
                      href={networkId === 'preprod' ? 'https://explorer.1am.xyz/contract/2428cd4ae7c2cd0bb501e1e9162de3003b103c1063c220e0d5cfc3f0b438e524?network=preprod' : 'https://explorer.1am.xyz/contract/33eb41d22028264e9e8bbe7f95b3089cece6e3c2a53008535e72a9f3350d3e30?network=preview'}
                      target="_blank"
                      rel="noreferrer"
                      className="text-orange-600 hover:underline inline-flex items-center gap-0.5 font-bold shrink-0"
                      title={`View contract on 1AM ${networkId === 'preprod' ? 'Preprod' : 'Preview'} Explorer`}
                    >
                      <span>1AM Explorer</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>

                  </div>

                  <button
                    onClick={() => onNavigateTab('market-insights')}
                    className="px-3.5 py-1.5 rounded-full bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 text-xs font-bold transition-all cursor-pointer self-start sm:self-auto flex items-center gap-1"
                  >
                    <Zap className="w-3.5 h-3.5 text-orange-500" />
                    <span>Execute Trades with this Strategy →</span>
                  </button>
                </div>
              </div>
            );
          })}

          {/* Show More / Show Less Toggle Button */}
          {activeStrategies.length > 3 && (
            <div className="pt-2 text-center">
              <button
                onClick={() => setShowAll((prev) => !prev)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition-all cursor-pointer"
              >
                <span>{showAll ? 'Collapse to Top 3 Strategies' : `View All ${activeStrategies.length} Active Strategies`}</span>
                {showAll ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
