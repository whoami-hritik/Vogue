import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertCircle,
  Info,
  Terminal,
  Radio
} from 'lucide-react';
import { formatISTTime } from '../utils/time';

export interface ProtocolLogEntry {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  detail: string;
  timestamp: string;
}

interface ProtocolLogProps {
  logs: ProtocolLogEntry[];
  networkId?: string;
  onClearLogs?: () => void;
}

export const ProtocolLog: React.FC<ProtocolLogProps> = ({ logs, networkId = 'preview' }) => {
  const [filter, setFilter] = useState<'all' | 'success' | 'info' | 'error'>('all');
  const net = networkId === 'preprod' ? 'preprod' : 'preview';
  const explorerBase = `https://explorer.1am.xyz?network=${net}`;

  const filteredLogs = logs.filter((l) => {
    if (filter === 'all') return true;
    return l.type === filter;
  });

  return (
    <div className="liquid-glass p-5 space-y-4 font-sans sticky top-6">
      {/* Log Header */}
      <div className="space-y-3 pb-3 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative flex items-center justify-center">
              <Radio className="w-3.5 h-3.5 text-white animate-pulse" />
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            </div>
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Protocol Telemetry
            </h3>
            <span className="liquid-glass-pill px-2 py-0.5 text-[10px] text-zinc-300 font-mono font-bold">
              {logs.length}
            </span>
          </div>

          <span className="liquid-glass-pill px-2.5 py-0.5 text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-wider">
            IST LIVE
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 liquid-glass-pill p-1 text-[10px]">
          {(
            [
              { key: 'all', label: 'All' },
              { key: 'success', label: 'Verified' },
              { key: 'info', label: 'Events' },
              { key: 'error', label: 'Errors' },
            ] as const
          ).map((item) => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key)}
              className={`flex-1 py-1 rounded-full font-mono font-bold transition-all cursor-pointer text-center ${
                filter === item.key
                  ? 'bg-white text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Log Stream List */}
      <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-500 rounded-xl border border-dashed border-white/10 font-mono">
            No events match current filter.
          </div>
        ) : (
          filteredLogs.map((log) => {
            const isError = log.type === 'error';
            const isSuccess = log.type === 'success';

            return (
              <div
                key={log.id}
                className={`p-3 rounded-xl border transition-all text-xs space-y-1.5 ${
                  isError
                    ? 'bg-rose-500/10 border-rose-500/25 text-rose-200'
                    : isSuccess
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-zinc-200'
                    : 'bg-white/[0.03] border-white/10 text-zinc-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 font-bold">
                    {isError ? (
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                    ) : isSuccess ? (
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <Info className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                    )}
                    <span className="text-[11px] font-mono leading-tight font-bold text-white">{log.title}</span>
                  </div>

                  <span className="text-[10px] text-zinc-500 font-mono shrink-0 whitespace-nowrap">
                    {formatISTTime(log.timestamp)}
                  </span>
                </div>

                <p className="text-[11px] font-mono text-zinc-400 leading-relaxed pl-5 break-all">
                  {log.detail.replace(/TX:\s*(0x[a-fA-F0-9]{10})[a-fA-F0-9]{40,54}/g, 'TX: $1…')}
                </p>

                {log.detail.includes('TX:') && (() => {
                  const match = log.detail.match(/TX:\s*(0x[a-fA-F0-9]{64}|0x[a-fA-F0-9]+|[a-fA-F0-9]{32,64})/);
                  const directTx = match ? match[1] : '';
                  const targetUrl = directTx
                    ? `https://explorer.1am.xyz/tx/${directTx.replace(/^0x/, '')}?network=${net}`
                    : `https://explorer.1am.xyz?network=${net}`;
                  const shortTx = directTx ? `${directTx.replace(/^0x/, '').substring(0, 10)}…` : 'TX';
                  return (
                    <div className="pl-5 pt-0.5">
                      <a
                        href={targetUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-zinc-300 hover:text-white hover:underline"
                      >
                        <span>Verify {shortTx} on 1AM {networkId === 'preprod' ? 'Preprod' : 'Preview'} Explorer →</span>
                      </a>
                    </div>
                  );
                })()}

              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
        <a
          href={explorerBase}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 text-zinc-400 hover:text-white transition-colors"
        >
          <Terminal className="w-3 h-3 text-zinc-500" /> 1AM {networkId === 'preprod' ? 'Preprod' : 'Preview'} Live
        </a>
        <span className="text-emerald-400 font-bold">● Synchronized</span>
      </div>
    </div>
  );
};
