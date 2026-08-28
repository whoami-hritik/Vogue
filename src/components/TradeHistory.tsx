import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  ExternalLink,
  Zap,
  CheckCircle2,
  XCircle,
  TrendingUp,
  TrendingDown,
  Shield,
  Filter,
  Globe,
  Layers,
  RefreshCw,
  Terminal
} from 'lucide-react';
import type { TradeRecord } from '../utils/contract';
import {
  getMidnightExplorerTxUrl,
  getMidnightExplorerContractUrl,
  fetchRecentMidnightTransactions,
  type MidnightApiTransaction
} from '../utils/midnightApi';
import { formatISTDateTime } from '../utils/time';

interface TradeHistoryProps {
  trades: TradeRecord[];
  onExecuteTrade: (asset: string, amountUsd: number) => Promise<unknown>;
  isProofGenerating: boolean;
  walletConnected: boolean;
  onConnectWallet: () => void;
  networkId: string;
  vaultBalance?: number;
  onNavigateTab?: (tab: string) => void;
}

export const TradeHistory: React.FC<TradeHistoryProps> = ({
  trades,
  onExecuteTrade,
  isProofGenerating,
  walletConnected,
  onConnectWallet,
  networkId,
  vaultBalance = 0,
  onNavigateTab
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'executed' | 'rejected'>('all');
  const [viewMode, setViewMode] = useState<'zk-circuits' | '1am-explorer'>('zk-circuits');
  const [explorerTxs, setExplorerTxs] = useState<MidnightApiTransaction[]>([]);
  const [isLoadingExplorer, setIsLoadingExplorer] = useState<boolean>(false);

  const net = networkId === 'mainnet' ? 'preview' : (networkId as 'preview' | 'preprod');

  const loadExplorerTxs = () => {
    setIsLoadingExplorer(true);
    fetchRecentMidnightTransactions(net).then((txs) => {
      setExplorerTxs(txs);
      setIsLoadingExplorer(false);
    });
  };

  useEffect(() => {
    if (viewMode === '1am-explorer') {
      loadExplorerTxs();
    }
  }, [viewMode, net]);

  const filteredTrades = trades.filter((trade) => {
    const matchesSearch =
      trade.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trade.asset.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trade.commitmentHash.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (trade.txHash && trade.txHash.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || trade.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-sans text-gray-900 relative z-10">
      {/* Header Bar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 light-glass border border-white/60 rounded-[2rem] p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-400/10 blur-3xl rounded-full -mr-10 -mt-10 pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-3">
            <History className="w-6 h-6 text-orange-500" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Midnight Explorer Logs</h1>
            <span className="text-[10px] bg-white/60 text-gray-800 border border-white/80 px-3 py-1 rounded-full font-extrabold uppercase tracking-widest shadow-sm">
              {networkId} TESTNET
            </span>
          </div>
          <p className="text-sm text-gray-600 font-medium">
            Real-time on-chain transaction hashes & strategy commitments logged via Midnight Explorer API.
          </p>
        </div>

        {/* View Mode Toggle & Execute Button */}
        <div className="flex flex-wrap items-center gap-4 relative z-10">
          <div className="flex bg-white/40 rounded-[1rem] p-1.5 border border-white/60 shadow-sm">
            <button
              onClick={() => setViewMode('zk-circuits')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold tracking-widest uppercase transition-all cursor-pointer flex items-center gap-2 ${
                viewMode === 'zk-circuits'
                  ? 'bg-white shadow-sm text-gray-900 scale-105'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <Layers className="w-4 h-4 text-orange-500" />
              <span>ZK Circuits</span>
            </button>
            <button
              onClick={() => setViewMode('1am-explorer')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold tracking-widest uppercase transition-all cursor-pointer flex items-center gap-2 ${
                viewMode === '1am-explorer'
                  ? 'bg-white shadow-sm text-gray-900 scale-105'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <Globe className="w-4 h-4 text-emerald-600" />
              <span>Explorer Feed</span>
            </button>
          </div>

          <a
            href={networkId === 'preprod' ? 'https://explorer.1am.xyz/contract/2428cd4ae7c2cd0bb501e1e9162de3003b103c1063c220e0d5cfc3f0b438e524?network=preprod' : 'https://explorer.1am.xyz/contract/33eb41d22028264e9e8bbe7f95b3089cece6e3c2a53008535e72a9f3350d3e30?network=preview'}
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/60 hover:bg-white border border-white/80 text-gray-800 text-xs font-extrabold tracking-widest uppercase transition-all shadow-sm cursor-pointer"
          >
            <Globe className="w-4 h-4 text-orange-500" />
            <span>1AM Contract Explorer</span>
            <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
          </a>

          <button
            onClick={() => {
              if (!walletConnected) {
                onConnectWallet();
              } else if (vaultBalance < 1200 && onNavigateTab) {
                onNavigateTab('withdraw');
              } else {
                onExecuteTrade('ADA', 1200);
              }
            }}
            disabled={isProofGenerating || (walletConnected && vaultBalance < 1200 && !onNavigateTab)}
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-full font-extrabold tracking-widest uppercase text-xs shadow-md transition-all shrink-0 cursor-pointer ${
              !walletConnected || vaultBalance >= 1200
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:scale-[1.02] text-white shadow-orange-500/20'
                : 'bg-amber-600 hover:bg-amber-700 text-white'
            }`}
          >
            <Zap className="w-4 h-4 text-white" />
            <span>
              {!walletConnected
                ? 'Connect Wallet'
                : isProofGenerating
                ? 'Proving Circuit...'
                : vaultBalance < 1200
                ? `Insufficient Vault ($${vaultBalance}/$1,200) — Mint vUSD`
                : 'Execute $1,200 ZK Trade'}
            </span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 light-glass border border-white/60 rounded-[2rem] p-5 shadow-sm relative z-10">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-gray-500 absolute left-4 top-3.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Trade ID, Asset, or Hash..."
            className="w-full bg-white/40 border border-white/60 rounded-[1.5rem] pl-11 pr-4 py-3 text-sm font-medium text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 font-sans shadow-inner transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-xs text-gray-600 font-extrabold uppercase tracking-widest">Status:</span>
          <div className="flex bg-white/40 rounded-[1rem] p-1.5 border border-white/60 shadow-sm">
            {(['all', 'executed', 'rejected'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-4 py-1.5 rounded-xl text-[11px] font-extrabold uppercase tracking-widest transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-white shadow-sm text-gray-900 scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: ZK CIRCUIT TRADES TABLE */}
      {viewMode === 'zk-circuits' && (
        <div className="light-glass border border-white/60 rounded-[2rem] overflow-hidden shadow-sm relative z-10">
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-white/60 border-b border-white/60 uppercase font-extrabold text-[10px] tracking-widest text-gray-500">
                <tr>
                  <th className="p-5">Trade ID</th>
                  <th className="p-5">Timestamp</th>
                  <th className="p-5">Asset & Type</th>
                  <th className="p-5">Size & Price</th>
                  <th className="p-5">P&L</th>
                  <th className="p-5">Midnight Explorer URL</th>
                  <th className="p-5">Proof Time</th>
                  <th className="p-5">RPC Status</th>
                  <th className="p-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/40 text-sm font-medium text-gray-800">
                {filteredTrades.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-10 text-center text-gray-500 font-medium">
                      No trade records matching filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredTrades.map((trade) => {
                    const isExecuted = trade.status === 'executed';
                    const isProfit = (trade.pnlUsd || 0) >= 0;
                    const hasRealTx = Boolean(trade.txHash && trade.txHash.length > 20);
                    const cleanTx = hasRealTx && trade.txHash ? trade.txHash.replace(/^0x/, '') : '';
                    const explorerUrl = cleanTx
                      ? `https://explorer.1am.xyz/tx/${cleanTx}?network=${net}`
                      : `https://explorer.1am.xyz?network=${net}`;
                    const displayLabel = cleanTx ? `Tx: ${cleanTx.substring(0, 12)}…` : '1AM Explorer';


                    return (
                      <tr key={trade.id} className="hover:bg-gray-50/80 transition-colors">
                        {/* Trade ID */}
                        <td className="p-4 font-bold text-gray-900 flex items-center gap-1.5 font-mono">
                          <Shield className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                          <span>{trade.id}</span>
                        </td>

                        {/* Timestamp (IST) */}
                        <td className="p-4 text-gray-500 font-mono text-[11px] whitespace-nowrap">
                          {formatISTDateTime(trade.timestamp)}
                        </td>

                        {/* Asset & Type */}
                        <td className="p-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-gray-900">{trade.asset}</span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                trade.type === 'BUY'
                                   ? 'bg-emerald-100 text-emerald-800'
                                  : trade.type === 'STOP_LOSS'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {trade.type || 'BUY'}
                            </span>
                          </div>
                        </td>

                        {/* Size & Price */}
                        <td className="p-4">
                          <div className="font-bold text-gray-900">${trade.sizeUsd ? trade.sizeUsd.toLocaleString() : '1,200'}</div>
                          <div className="text-[11px] text-gray-500">@ ${trade.priceUsd ? trade.priceUsd.toLocaleString() : '0.421'}</div>
                        </td>

                        {/* P&L */}
                        <td className="p-4">
                          {isExecuted ? (
                            <div className={`font-bold flex items-center gap-0.5 ${isProfit ? 'text-emerald-700' : 'text-red-600'}`}>
                              {isProfit ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                              <span>{isProfit ? '+' : ''}${trade.pnlUsd?.toFixed(2) || '0.00'}</span>
                              <span className="text-[10px] opacity-80">({isProfit ? '+' : ''}{trade.pnlPct || 0}%)</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>

                        {/* Midnight Explorer Link */}
                        <td className="p-4">
                          <div className="flex flex-col gap-1 font-mono">
                            <a
                              href={explorerUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-orange-600 hover:text-orange-700 hover:underline flex items-center gap-1 text-[11px] font-bold"
                              title={`Open ${net === 'preprod' ? 'Preprod' : 'Preview'} Midnight Explorer for ${displayLabel}`}
                            >
                              <span>{displayLabel}</span>
                              <ExternalLink className="w-3 h-3 shrink-0 text-orange-500" />
                            </a>
                          </div>
                        </td>

                        {/* Proof Time */}
                        <td className="p-4 text-gray-500 font-mono">{trade.proofTimeMs} ms</td>

                        {/* RPC Status */}
                        <td className="p-4">
                          {trade.rpcStatus === 'confirmed' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Confirmed
                            </span>
                          ) : trade.rpcStatus === 'failed' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-800 bg-red-100 px-2 py-0.5 rounded-full">
                              <XCircle className="w-3 h-3 text-red-600" /> Failed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-800 bg-orange-100 px-2 py-0.5 rounded-full">
                              <RefreshCw className="w-3 h-3 animate-spin text-orange-600" /> Pending
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="p-4">
                          {isExecuted ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Executed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                              <XCircle className="w-3 h-3 text-red-600" />
                              Rejected
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: EXPLORER LIVE NETWORK FEED */}
      {viewMode === '1am-explorer' && (
        <div className="light-glass border border-white/60 rounded-[2rem] p-6 sm:p-8 space-y-6 shadow-sm relative z-10">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                <Globe className="w-6 h-6 text-orange-500" />
                Live Explorer Stream ({net})
              </h2>
              <p className="text-sm text-gray-600 font-medium">
                Direct RPC feed from <span className="bg-white/60 px-1 py-0.5 rounded">Midnight Explorer API</span>
              </p>
            </div>

            <button
              onClick={loadExplorerTxs}
              disabled={isLoadingExplorer}
              className="p-3 rounded-full bg-white/60 hover:bg-white border border-white/80 text-gray-700 transition-all cursor-pointer shadow-sm disabled:opacity-50"
              title="Refresh Explorer Feed"
            >
              <RefreshCw className={`w-5 h-5 ${isLoadingExplorer ? 'animate-spin text-orange-500' : ''}`} />
            </button>
          </div>

          <div className="bg-white/40 border border-white/60 rounded-[1.5rem] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono">
                <thead className="bg-white/60 border-b border-white/60 font-sans uppercase text-[10px] tracking-widest font-extrabold text-gray-500">
                  <tr>
                    <th className="p-5">Transaction Hash</th>
                    <th className="p-5">Block Height</th>
                    <th className="p-5">Circuit Action</th>
                    <th className="p-5">Network Fee</th>
                    <th className="p-5">Midnight Explorer Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/40 text-sm font-medium text-gray-800">
                  {explorerTxs.map((tx) => {
                    const cleanTx = tx.txHash.replace(/^0x/, '');
                    const url = `https://explorer.1am.xyz/tx/${cleanTx}?network=${net}`;
                    return (
                      <tr key={tx.txHash} className="hover:bg-white/50 transition-colors">
                        <td className="p-5 font-extrabold text-gray-900 truncate max-w-[200px]">
                          {tx.txHash}
                        </td>
                        <td className="p-5 text-emerald-700 font-extrabold">
                          #{tx.blockHeight.toLocaleString()}
                        </td>
                        <td className="p-5">
                          <span className="px-3 py-1 rounded-md text-[11px] font-extrabold bg-white/60 text-gray-900 border border-white/60 uppercase tracking-widest font-sans">
                            {tx.circuitName}
                          </span>
                        </td>
                        <td className="p-5 text-orange-700 font-extrabold">{tx.fee}</td>
                        <td className="p-5">
                          <a
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-orange-600 hover:text-orange-700 hover:underline font-extrabold text-xs font-sans tracking-wide"
                          >
                            <span>Open in 1AM Explorer</span>
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </td>
                      </tr>
                    );
                  })}

              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
