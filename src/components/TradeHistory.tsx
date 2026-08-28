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
    <div className="max-w-6xl mx-auto space-y-6 font-sans text-gray-900">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 light-glass border border-gray-200/80 rounded-2xl p-6 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-orange-500" />
            <h1 className="text-xl font-extrabold text-gray-900">Midnight Explorer Transaction Logs</h1>
            <span className="text-[10px] bg-gray-100 text-gray-800 border border-gray-200 px-2.5 py-0.5 rounded-full font-bold uppercase">
              {networkId} TESTNET LOGS
            </span>
          </div>
          <p className="text-xs text-gray-600">
            Real-time on-chain transaction hashes & strategy commitments logged via Midnight Explorer API.
          </p>
        </div>

        {/* View Mode Toggle & Execute Button */}
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-xl p-1 border border-gray-200/60">
            <button
              onClick={() => setViewMode('zk-circuits')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'zk-circuits'
                  ? 'light-glass text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-orange-500" />
              <span>ZK Circuits</span>
            </button>
            <button
              onClick={() => setViewMode('1am-explorer')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === '1am-explorer'
                  ? 'light-glass text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              <span>Explorer Feed</span>
            </button>
          </div>

          <a
            href={networkId === 'preprod' ? 'https://explorer.1am.xyz/contract/2428cd4ae7c2cd0bb501e1e9162de3003b103c1063c220e0d5cfc3f0b438e524?network=preprod' : 'https://explorer.1am.xyz/contract/33eb41d22028264e9e8bbe7f95b3089cece6e3c2a53008535e72a9f3350d3e30?network=preview'}
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2.5 rounded-full light-glass hover:bg-gray-100 border border-gray-200 text-gray-800 text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-orange-500" />
            <span>1AM Contract Explorer</span>
            <ExternalLink className="w-3 h-3 text-gray-400" />
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
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-full font-bold text-xs shadow-sm transition-all shrink-0 cursor-pointer ${
              !walletConnected || vaultBalance >= 1200
                ? 'bg-[#F26522] hover:bg-[#e05a1a] text-white'
                : 'bg-amber-600 hover:bg-amber-700 text-white'
            }`}
          >
            <Zap className="w-4 h-4 text-white" />
            <span>
              {!walletConnected
                ? 'Connect Wallet'
                : isProofGenerating
                ? 'Proving ZK Circuit...'
                : vaultBalance < 1200
                ? `Insufficient Vault ($${vaultBalance}/$1,200) — Mint vUSD`
                : 'Execute $1,200 ZK Trade'}
            </span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 light-glass border border-gray-200/80 rounded-2xl p-4 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Trade ID, Asset, or Hash..."
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 font-sans"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-gray-500" />
          <span className="text-xs text-gray-500 font-medium">Status:</span>
          <div className="flex bg-gray-100 rounded-xl p-1 border border-gray-200/60">
            {(['all', 'executed', 'rejected'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'light-glass text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
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
        <div className="light-glass border border-gray-200/80 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 border-b border-gray-200 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="p-4">Trade ID</th>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Asset & Type</th>
                  <th className="p-4">Size & Price</th>
                  <th className="p-4">P&L</th>
                  <th className="p-4">Midnight Explorer URL</th>
                  <th className="p-4">Proof Time</th>
                  <th className="p-4">RPC Status</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-800 font-medium">
                {filteredTrades.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-gray-400 font-sans">
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
        <div className="light-glass border border-gray-200/80 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Globe className="w-4 h-4 text-orange-500" />
                Live Midnight Explorer Stream ({net})
              </h2>
              <p className="text-xs text-gray-600">
                Direct RPC feed from Midnight Explorer API
              </p>
            </div>

            <button
              onClick={loadExplorerTxs}
              disabled={isLoadingExplorer}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all cursor-pointer"
              title="Refresh Explorer Feed"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingExplorer ? 'animate-spin text-orange-500' : ''}`} />
            </button>
          </div>

          <div className="light-glass border border-gray-200 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left font-mono">
              <thead className="bg-gray-50 text-gray-500 border-b border-gray-200 font-sans uppercase text-[10px]">
                <tr>
                  <th className="p-3.5">Transaction Hash</th>
                  <th className="p-3.5">Block Height</th>
                  <th className="p-3.5">Circuit Action</th>
                  <th className="p-3.5">Network Fee</th>
                  <th className="p-3.5">Midnight Explorer Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-800">
                {explorerTxs.map((tx) => {
                  const cleanTx = tx.txHash.replace(/^0x/, '');
                  const url = `https://explorer.1am.xyz/tx/${cleanTx}?network=${net}`;
                  return (
                    <tr key={tx.txHash} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-3.5 font-bold text-gray-900 truncate max-w-[200px]">
                        {tx.txHash}
                      </td>
                      <td className="p-3.5 text-emerald-700 font-bold">
                        #{tx.blockHeight.toLocaleString()}
                      </td>
                      <td className="p-3.5">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-900 border border-gray-200">
                          {tx.circuitName}
                        </span>
                      </td>
                      <td className="p-3.5 text-orange-700 font-semibold">{tx.fee}</td>
                      <td className="p-3.5">
                        <a
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-orange-600 hover:underline font-bold text-[11px]"
                        >
                          <span>Open in 1AM Explorer</span>
                          <ExternalLink className="w-3 h-3" />
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
