import React, { useState } from 'react';
import {
  Activity,
  ShieldCheck,
  AlertCircle,
  Info,
  Terminal,
  Trash2,
  CheckCircle2,
  Cpu,
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
    <div className="bg-white border border-gray-200/80 rounded-2xl p-5 space-y-4 font-sans shadow-sm sticky top-6">
      {/* Log Header */}
      <div className="space-y-3 pb-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative flex items-center justify-center">
              <Radio className="w-4 h-4 text-orange-500 animate-pulse" />
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>
            </div>
            <h3 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider">
              Protocol Telemetry
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-mono font-bold">
              {logs.length}
            </span>
          </div>

          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 uppercase tracking-wider">
            IST LIVE
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-200/60 text-[10px]">
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
              className={`flex-1 py-1 rounded-lg font-bold transition-all cursor-pointer text-center ${
                filter === item.key
                  ? 'bg-white text-gray-900 shadow-xs border border-gray-200/70'
                  : 'text-gray-500 hover:text-gray-900'
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
          <div className="p-8 text-center text-xs text-gray-400 bg-gray-50/70 rounded-xl border border-dashed border-gray-200 font-sans">
            No events match current filter.
          </div>
        ) : (
          filteredLogs.map((log) => {
            const isError = log.type === 'error';
            const isSuccess = log.type === 'success';

            return (
              <div
                key={log.id}
                className={`p-3 rounded-xl border transition-all text-xs space-y-1 ${
                  isError
                    ? 'bg-red-50/60 border-red-200 text-red-900'
                    : isSuccess
                    ? 'bg-emerald-50/50 border-emerald-200/80 text-emerald-950'
                    : 'bg-gray-50/80 border-gray-200/80 text-gray-900'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 font-bold">
                    {isError ? (
                      <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                    ) : isSuccess ? (
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <Info className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
                    )}
                    <span className="text-[11px] leading-tight font-extrabold">{log.title}</span>
                  </div>

                  <span className="text-[10px] text-gray-500 font-mono shrink-0 whitespace-nowrap">
                    {formatISTTime(log.timestamp)}
                  </span>
                </div>

                <p className="text-[11px] font-mono text-gray-600 leading-relaxed pl-5 break-all">
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
                    <div className="pl-5 pt-1">
                      <a
                        href={targetUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-600 hover:text-orange-700 hover:underline"
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
      <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-500 font-mono">
        <a
          href={explorerBase}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 text-gray-500 hover:text-orange-600 transition-colors"
        >
          <Terminal className="w-3 h-3 text-gray-400" /> 1AM {networkId === 'preprod' ? 'Preprod' : 'Preview'} Explorer Live
        </a>
        <span className="text-emerald-700 font-bold">● Synchronized</span>
      </div>
    </div>
  );
};

