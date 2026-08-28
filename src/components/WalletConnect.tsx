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
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200/80 border border-gray-300/80 text-left transition-all cursor-pointer shadow-xs"
        >
          <span className={`w-2 h-2 rounded-full shrink-0 ${!isNetworkAligned ? 'bg-amber-500 animate-bounce' : 'bg-emerald-500 animate-pulse'}`}></span>
          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-900">
            <span className="font-semibold">{walletName}</span>
            <span className="text-gray-400">•</span>
            <span className="font-bold text-gray-800">{String(balance)}</span>
          </div>
          {!isNetworkAligned && detected1AMNetwork && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
              1AM: {detected1AMNetwork.toUpperCase()}
            </span>
          )}
          {displayAddress && isNetworkAligned && (
            <span className="text-[11px] font-mono text-gray-600 bg-white px-2 py-0.5 rounded-full border border-gray-200 shadow-2xs">
              {displayAddress}
            </span>
          )}
        </button>

        <button
          onClick={onDisconnect}
          title="Disconnect Wallet"
          className="w-8 h-8 rounded-full bg-gray-900 hover:bg-black text-white flex items-center justify-center transition-all cursor-pointer shadow-sm"
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
        className="bg-gray-900 hover:bg-black text-white text-xs font-medium rounded-full px-4 py-2 flex items-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-50"
      >
        {isConnecting ? (
          <>
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-orange-400" />
            <span>Connecting…</span>
          </>
        ) : (
          <>
            <Wallet className="w-3.5 h-3.5 text-orange-400" />
            <span>Connect 1AM Wallet</span>
          </>
        )}
      </button>

      {error && (
        <div className="hidden lg:flex items-center gap-1 text-[11px] text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full">
          <AlertTriangle className="w-3 h-3 text-red-500 shrink-0" />
          <span className="truncate max-w-[120px]">{error}</span>
        </div>
      )}
    </div>
  );
};
