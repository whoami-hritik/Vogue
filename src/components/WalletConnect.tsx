import React from 'react';
import { Wallet, ShieldCheck, RefreshCw, AlertTriangle, LogOut, Search, Fuel, Server } from 'lucide-react';
import type { DetectedWallet } from '../lib/lace-wallet';

interface WalletConnectProps {
  connected: boolean;
  address: string | null;
  shieldedAddress?: string | null;
  walletName: string;
  networkId?: string;
  detected1AMNetwork?: string;
  isNetworkAligned?: boolean;
  balance: string;
  shieldedBalance?: string;
  unshieldedBalance?: string;
  isConnecting: boolean;
  error: string | null;
  proofServerUp?: boolean | null;
  dustReady?: boolean;
  detectedWallets?: DetectedWallet[];
  onOpenModal: () => void;
  onScan?: () => void;
  onConnect: (wallet?: unknown) => void;
  onDisconnect: () => void;
}

export const WalletConnect: React.FC<WalletConnectProps> = ({
  connected,
  address,
  walletName,
  networkId = 'preview',
  detected1AMNetwork,
  isNetworkAligned = true,
  balance,
  isConnecting,
  error,
  proofServerUp,
  dustReady,
  detectedWallets = [],
  onOpenModal,
  onScan,
  onDisconnect
}) => {
  const displayAddress =
    typeof address === 'string' && address.length > 0
      ? `${address.substring(0, 8)}…${address.substring(address.length - 4)}`
      : '';

  if (connected) {
    return (
      <div className="flex items-center gap-2 font-sans">
        <button
          onClick={onOpenModal}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111622] hover:bg-[#161D2C] border border-white/[0.08] hover:border-white/[0.14] text-left transition-all cursor-pointer shadow-xs"
        >
          <span className={`w-2 h-2 rounded-full shrink-0 ${!isNetworkAligned ? 'bg-amber-400 animate-bounce' : 'bg-emerald-400 animate-pulse'}`}></span>
          <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-200">
            <span className="font-semibold text-zinc-300">{walletName}</span>
            <span className="text-zinc-600">•</span>
            <span className="font-bold text-emerald-400 font-mono">{String(balance)}</span>
          </div>
          {!isNetworkAligned && detected1AMNetwork && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
              1AM: {detected1AMNetwork.toUpperCase()}
            </span>
          )}
          {displayAddress && isNetworkAligned && (
            <span className="text-[11px] font-mono text-zinc-400 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.06]">
              {displayAddress}
            </span>
          )}
        </button>

        <button
          onClick={onDisconnect}
          title="Disconnect Wallet"
          className="w-8 h-8 rounded-lg bg-[#111622] hover:bg-rose-500/10 hover:text-rose-400 border border-white/[0.08] hover:border-rose-500/30 text-zinc-400 flex items-center justify-center transition-all cursor-pointer shadow-sm"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 font-sans">
      <button
        onClick={onOpenModal}
        disabled={isConnecting}
        className="bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-slate-950 font-bold text-xs rounded-lg px-3.5 py-2 flex items-center gap-2 transition-all cursor-pointer shadow-sm shadow-cyan-500/20 disabled:opacity-50"
      >
        {isConnecting ? (
          <>
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-950" />
            <span>Connecting…</span>
          </>
        ) : (
          <>
            <Wallet className="w-3.5 h-3.5 text-slate-950" />
            <span>Connect 1AM Wallet</span>
          </>
        )}
      </button>

      {error && (
        <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-lg">
          <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />
          <span className="truncate max-w-[120px]">{error}</span>
        </div>
      )}
    </div>
  );
};
