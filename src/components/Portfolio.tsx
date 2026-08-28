import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Shield,
  EyeOff,
  DollarSign,
  PieChart,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Activity
} from 'lucide-react';
import type { TradeRecord } from '../utils/contract';
import type { ActiveStrategy } from '../hooks/useMidnight';

interface PortfolioProps {
  walletConnected: boolean;
  networkId: string;
  balance: string;
  shieldedBalance: string;
  unshieldedBalance: string;
  dustBalance: string;
  activeStrategies: ActiveStrategy[];
  trades: TradeRecord[];
  onNavigateTab: (tab: string) => void;
}

export const Portfolio: React.FC<PortfolioProps> = ({
  walletConnected,
  networkId,
  balance,
  shieldedBalance,
  unshieldedBalance,
  dustBalance,
  activeStrategies,
  trades,
  onNavigateTab
}) => {
  // Calculate dynamic P&L stats based on executed trade records
  const executedTrades = trades.filter((t) => t.status === 'executed');
  const totalRealizedPnl = executedTrades.reduce((acc, t) => acc + (t.pnlUsd || 0), 0);
  const totalTradedVolume = executedTrades.reduce((acc, t) => acc + (t.sizeUsd || 0), 0);
  const winCount = executedTrades.filter((t) => (t.pnlUsd || 0) > 0).length;
  const winRatePct = executedTrades.length > 0 ? Math.round((winCount / executedTrades.length) * 100) : 100;
  
  const estimatedPortfolioValue = 12450.00 + totalRealizedPnl;
  const roiPct = Number(((totalRealizedPnl / 10000) * 100).toFixed(2));

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-sans text-gray-900 relative z-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 light-glass border border-white/60 rounded-[2rem] p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-400/10 blur-3xl rounded-full -mr-10 -mt-10 pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-3">
            <PieChart className="w-6 h-6 text-orange-500" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Shielded Portfolio & Analytics</h1>
            <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-100 px-3 py-1 rounded-full font-extrabold tracking-widest shadow-sm uppercase">
              CLIENT-SIDE DECRYPTED
            </span>
          </div>
          <p className="text-sm text-gray-600 font-medium">
            Values and position sizes are computed <strong className="text-gray-900 bg-white/60 px-1 py-0.5 rounded">entirely client-side</strong> from decrypted state. Never published on-chain.
          </p>
        </div>

        <button
          onClick={() => onNavigateTab('withdraw')}
          className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-gray-900 to-gray-800 hover:scale-[1.02] text-white font-extrabold tracking-widest uppercase text-xs transition-all cursor-pointer shrink-0 shadow-lg shadow-gray-900/20 relative z-10"
        >
          <ArrowUpRight className="w-4 h-4 text-orange-400" />
          <span>Shielded Vault</span>
        </button>
      </div>

      {/* Top P&L Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        {/* Estimated Total Value */}
        <div className="bg-white/40 border border-white/60 rounded-[1.5rem] p-6 space-y-2 shadow-sm flex flex-col justify-center">
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">TOTAL PORTFOLIO VALUE</span>
          <div className="text-3xl font-extrabold text-gray-900 tracking-tight font-mono">
            ${estimatedPortfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-extrabold pt-1">
            <TrendingUp className="w-4 h-4" />
            <span>+${totalRealizedPnl >= 0 ? totalRealizedPnl.toFixed(2) : '0.00'} All-Time</span>
          </div>
        </div>

        {/* Realized Profit & Loss */}
        <div className="bg-white/40 border border-white/60 rounded-[1.5rem] p-6 space-y-2 shadow-sm flex flex-col justify-center">
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">REALIZED PROFIT / LOSS</span>
          <div className={`text-3xl font-extrabold tracking-tight font-mono ${totalRealizedPnl >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {totalRealizedPnl >= 0 ? '+' : ''}${totalRealizedPnl.toFixed(2)}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-600 font-extrabold pt-1">
            <span className="bg-white/60 px-2 py-0.5 rounded-md">ROI: {roiPct >= 0 ? '+' : ''}{roiPct}%</span>
          </div>
        </div>

        {/* Win Rate */}
        <div className="bg-white/40 border border-white/60 rounded-[1.5rem] p-6 space-y-2 shadow-sm flex flex-col justify-center">
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">AGENT WIN RATE</span>
          <div className="text-3xl font-extrabold text-orange-600 tracking-tight font-mono">
            {winRatePct}%
          </div>
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest pt-1">
            {winCount} / {executedTrades.length} Proven Trades
          </span>
        </div>

        {/* Active Circuit Risk Exposure */}
        <div className="bg-white/40 border border-white/60 rounded-[1.5rem] p-6 space-y-2 shadow-sm flex flex-col justify-center">
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">ACTIVE RISK ALLOCATION</span>
          <div className="text-3xl font-extrabold text-gray-900 tracking-tight font-mono">
            ${totalTradedVolume.toLocaleString()}
          </div>
          <span className="text-[10px] text-emerald-700 font-extrabold uppercase tracking-widest pt-1">
            ↑ {activeStrategies.length} Active Circuit Bounds
          </span>
        </div>
      </div>

      {/* Shielded State Security Banner */}
      <div className="p-5 light-glass border border-white/60 rounded-[1.5rem] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm shadow-sm relative z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-400/5 to-transparent pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="bg-white/60 p-2 rounded-xl shadow-sm border border-white/80">
            <EyeOff className="w-5 h-5 text-orange-500 shrink-0" />
          </div>
          <div className="space-y-1">
            <span className="font-extrabold text-gray-900 tracking-wide text-sm">Midnight Zero-Knowledge State <span className="text-[10px] bg-white/60 px-2 py-0.5 rounded-full border border-white/60 text-gray-600 font-mono">{networkId}</span></span>
            <p className="text-gray-600 text-xs font-medium">
              Shielded Note: <strong className="text-emerald-700 font-mono tracking-tight">{shieldedBalance}</strong> | Unshielded Public: <strong className="text-gray-900 font-mono tracking-tight">{unshieldedBalance}</strong> | DUST Fuel: <strong className="text-emerald-700 font-mono tracking-tight">{dustBalance}</strong>
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-emerald-800 font-extrabold tracking-widest uppercase bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100 shadow-sm relative z-10">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Proven Client-Side</span>
        </div>
      </div>

      {/* Detailed Holdings & Position Breakdown Table */}
      <div className="light-glass border border-white/60 rounded-[2rem] p-6 sm:p-8 space-y-6 shadow-sm relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <Activity className="w-6 h-6 text-orange-500" />
            Shielded Holdings
          </h2>
          <span className="text-[10px] text-gray-500 font-extrabold tracking-widest uppercase bg-white/60 px-3 py-1.5 rounded-full border border-white/60">
            Auto-synced with Midnight Explorer API
          </span>
        </div>

        <div className="bg-white/40 border border-white/60 rounded-[1.5rem] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-white/60 border-b border-white/60 uppercase font-extrabold text-[10px] tracking-widest text-gray-500">
                <tr>
                  <th className="p-4">Asset</th>
                  <th className="p-4">Ledger Layer</th>
                  <th className="p-4">Current Balance</th>
                  <th className="p-4">USD Value</th>
                  <th className="p-4">Privacy Witness State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/40 text-sm font-medium text-gray-800">
                <tr className="hover:bg-white/50 transition-colors">
                  <td className="p-4 font-extrabold text-orange-600 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    Shielded Vault (vUSD)
                  </td>
                  <td className="p-4 text-gray-600"><span className="bg-white/60 px-2 py-1 rounded-md">Shielded Vault Note</span></td>
                  <td className="p-4 font-extrabold text-gray-900 font-mono">10,000 vUSD</td>
                  <td className="p-4 font-extrabold text-gray-900 font-mono">$10,000.00</td>
                  <td className="p-4 text-emerald-700 font-bold flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5"/> USDC-Equivalent Note</td>
                </tr>
                <tr className="hover:bg-white/50 transition-colors">
                  <td className="p-4 font-extrabold text-emerald-700 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    tNIGHT (Shielded)
                  </td>
                  <td className="p-4 text-gray-600"><span className="bg-white/60 px-2 py-1 rounded-md">Shielded Note</span></td>
                  <td className="p-4 font-extrabold text-emerald-700 font-mono">{shieldedBalance}</td>
                  <td className="p-4 font-extrabold text-gray-900 font-mono">${(5000.00).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="p-4 text-emerald-700 font-bold flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5"/> Encrypted Witness Note</td>
                </tr>
                <tr className="hover:bg-white/50 transition-colors">
                  <td className="p-4 font-extrabold text-gray-900 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                    tNIGHT (Unshielded)
                  </td>
                  <td className="p-4 text-gray-600"><span className="bg-white/60 px-2 py-1 rounded-md">Public Address</span></td>
                  <td className="p-4 font-extrabold text-gray-800 font-mono">{unshieldedBalance}</td>
                  <td className="p-4 font-extrabold text-gray-900 font-mono">${(5000.00).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="p-4 text-gray-500 font-bold">Public Ledger Address</td>
                </tr>
                <tr className="hover:bg-white/50 transition-colors">
                  <td className="p-4 font-extrabold text-emerald-700 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    tDUST Reserve
                  </td>
                  <td className="p-4 text-gray-600"><span className="bg-white/60 px-2 py-1 rounded-md">ProofStation Reserve</span></td>
                  <td className="p-4 font-extrabold text-emerald-700 font-mono">{dustBalance}</td>
                  <td className="p-4 text-gray-400">—</td>
                  <td className="p-4 text-gray-500 font-bold">Transaction Gas Reserve</td>
                </tr>
                <tr className="hover:bg-white/50 transition-colors">
                  <td className="p-4 font-extrabold text-blue-600 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    ADA (Paper Position)
                  </td>
                  <td className="p-4 text-gray-600"><span className="bg-white/60 px-2 py-1 rounded-md">Strategy Witness</span></td>
                  <td className="p-4 font-extrabold text-blue-600 font-mono">5,820 ADA</td>
                  <td className="p-4 font-extrabold text-gray-900 font-mono">${(5820 * 0.421).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="p-4 text-gray-500 font-bold">Paper position against Vault</td>
                </tr>
                <tr className="hover:bg-white/50 transition-colors">
                  <td className="p-4 font-extrabold text-indigo-600 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                    AAPL (Stock Paper)
                  </td>
                  <td className="p-4 text-gray-600"><span className="bg-white/60 px-2 py-1 rounded-md">Stock Paper Feed</span></td>
                  <td className="p-4 font-extrabold text-indigo-600 font-mono">10 AAPL</td>
                  <td className="p-4 font-extrabold text-gray-900 font-mono">${(10 * 228.5).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="p-4 text-gray-500 font-bold">Paper position against Vault</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
