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
import { getMidnightExplorerContractUrl } from '../utils/midnightApi';
import { getActiveContractAddress } from '../utils/registry';
import { LiquidGlassButton } from './ui/LiquidGlassButton';

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
    <div className="liquid-glass p-6 sm:p-7 space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/15 flex items-center justify-center text-white">
              <Cpu className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              Active Strategy Commitments
            </h2>
            <span className="liquid-glass-pill px-2.5 py-0.5 text-[10px] text-zinc-300 font-mono font-bold uppercase">
              {activeStrategies.length} ACTIVE
            </span>
          </div>
          <p className="text-xs text-zinc-400 font-normal">
            Zero-knowledge cryptographic bounds enforcing autonomous execution limits on Midnight.
          </p>
        </div>

        <LiquidGlassButton
          onClick={() => onNavigateTab('strategy-builder')}
          variant="primary"
          icon={<PlusCircle className="w-4 h-4" />}
        >
          <span>Lock New Strategy</span>
        </LiquidGlassButton>
      </div>

      {/* Strategies List */}
      {activeStrategies.length === 0 ? (
        <div className="p-12 text-center space-y-4 liquid-glass rounded-2xl">
          <div className="w-14 h-14 rounded-full bg-white/[0.05] border border-white/15 flex items-center justify-center mx-auto text-zinc-400">
            <Cpu className="w-7 h-7 text-zinc-400" />
          </div>
          <div className="space-y-1.5">
            <h4 className="text-lg font-bold text-white">No Active Commitments</h4>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
              Lock your risk bounds into the Midnight ZK circuit before dispatching trades.
            </p>
          </div>
          <div className="pt-2">
            <LiquidGlassButton
              onClick={() => onNavigateTab('strategy-builder')}
              variant="primary"
            >
              Create Shielded Strategy
            </LiquidGlassButton>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {displayedStrategies.map((strat, idx) => {
            const maxAllowed = Math.floor((vaultBalance * strat.params.maxPositionPct) / 100);
            return (
              <div
                key={strat.id || idx}
                className="liquid-glass p-5 sm:p-6 space-y-5 group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="liquid-glass-pill px-3 py-1 text-xs font-mono font-bold text-white">
                      Strategy #{idx + 1}
                    </span>
                    <span className="text-xs font-mono text-zinc-400 flex items-center gap-2">
                      Agent: <code className="font-mono text-zinc-200 bg-white/[0.06] px-2 py-0.5 rounded border border-white/10">{strat.agentId}</code>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="liquid-glass-pill px-3 py-1 text-[11px] text-emerald-400 font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      ACTIVE ON CHAIN
                    </span>
                  </div>
                </div>

                {/* Risk Parameters Matrix */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="rounded-xl bg-white/[0.03] border border-white/[0.08] p-4 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] text-zinc-400 font-mono font-bold uppercase tracking-wider mb-1">Max Position</span>
                    <span className="text-3xl font-extrabold text-white font-mono">{strat.params.maxPositionPct}%</span>
                    <span className="text-[10px] text-zinc-400 font-mono mt-1">${maxAllowed} max</span>
                  </div>
                  <div className="rounded-xl bg-rose-500/5 border border-rose-500/20 p-4 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] text-rose-300 font-mono font-bold uppercase tracking-wider mb-1">Stop-Loss</span>
                    <span className="text-3xl font-extrabold text-rose-400 font-mono">-{strat.params.stopLossPct}%</span>
                    <span className="text-[10px] text-rose-400 font-mono mt-1">ZK Enforced</span>
                  </div>
                  <div className="rounded-xl bg-white/[0.03] border border-white/[0.08] p-4 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] text-zinc-400 font-mono font-bold uppercase tracking-wider mb-1">Duration</span>
                    <span className="text-3xl font-extrabold text-white font-mono">{strat.params.timelineDays}d</span>
                    <span className="text-[10px] text-zinc-400 font-mono mt-1">Time Lock</span>
                  </div>
                  <div className="rounded-xl bg-white/[0.03] border border-white/[0.08] p-4 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] text-zinc-400 font-mono font-bold uppercase tracking-wider mb-1">Committed (IST)</span>
                    <span className="text-sm font-bold text-white mt-1 font-mono">
                      {formatISTDateTime(strat.createdAt).split(' ')[0]}
                    </span>
                    <span className="text-xs text-zinc-400 font-mono">
                      {formatISTDateTime(strat.createdAt).split(' ')[1]}
                    </span>
                  </div>
                </div>

                {/* Public Commitment Hash + CTA */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-white/10">
                  <div className="text-xs font-mono text-zinc-400 flex items-center gap-2 liquid-glass-pill px-3 py-1.5 max-w-[220px] sm:max-w-md">
                    <span className="font-bold text-white shrink-0">ZK Hash:</span>
                    <span className="truncate">{strat.commitmentHash}</span>
                    <a
                      href={getMidnightExplorerContractUrl(getActiveContractAddress(networkId), networkId)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-zinc-300 hover:text-white inline-flex items-center gap-0.5 font-bold shrink-0 ml-1"
                      title="View contract on Midnight Explorer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <LiquidGlassButton
                    onClick={() => onNavigateTab('market-insights')}
                    variant="primary"
                    icon={<Zap className="w-3.5 h-3.5" />}
                  >
                    <span>Execute Trades</span>
                  </LiquidGlassButton>
                </div>
              </div>
            );
          })}

          {/* Show More / Show Less Toggle Button */}
          {activeStrategies.length > 3 && (
            <div className="pt-2 text-center">
              <button
                onClick={() => setShowAll((prev) => !prev)}
                className="liquid-glass-btn-secondary px-6 py-2.5 text-xs font-mono uppercase tracking-widest cursor-pointer"
              >
                <span>{showAll ? 'Collapse to Top 3' : `View All ${activeStrategies.length}`}</span>
                {showAll ? <ChevronUp className="w-3.5 h-3.5 ml-2" /> : <ChevronDown className="w-3.5 h-3.5 ml-2" />}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
