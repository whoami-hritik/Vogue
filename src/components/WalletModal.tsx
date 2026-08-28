import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, ShieldCheck, RefreshCw, Trash2 } from 'lucide-react';
import type { MidnightNetwork } from '../lib/lace-wallet';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  connected: boolean;
  isConnecting: boolean;
  unshieldedAddress: string | null;
  shieldedAddress: string | null;
  shieldedBalance: string;
  unshieldedBalance: string;
  dustBalance: string;
  networkId: MidnightNetwork;
  detected1AMNetwork?: MidnightNetwork;
  isNetworkAligned?: boolean;
  onSelectNetwork: (net: MidnightNetwork) => void;
  onConnect: () => void;
  onDisconnect: () => void;
  onClearCache?: () => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  connected,
  isConnecting,
  unshieldedAddress,
  shieldedAddress,
  shieldedBalance,
  unshieldedBalance,
  dustBalance,
  networkId,
  detected1AMNetwork,
  isNetworkAligned = true,
  onSelectNetwork,
  onConnect,
  onDisconnect,
  onClearCache
}) => {
  const [copiedAddr, setCopiedAddr] = useState<boolean>(false);
  const [copiedShielded, setCopiedShielded] = useState<boolean>(false);
  const [cacheCleared, setCacheCleared] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleClearCache = () => {
    if (onClearCache) {
      onClearCache();
    } else {
      onDisconnect();
    }
    setCacheCleared(true);
    setTimeout(() => {
      setCacheCleared(false);
      onClose();
    }, 1200);
  };

  const copyToClipboard = (text: string, isShielded: boolean) => {
    navigator.clipboard.writeText(text);
    if (isShielded) {
      setCopiedShielded(true);
      setTimeout(() => setCopiedShielded(false), 2000);
    } else {
      setCopiedAddr(true);
      setTimeout(() => setCopiedAddr(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-lg bg-white border border-gray-200/90 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6 relative text-gray-900 font-sans">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <img
            src="/vogue-logo.png"
            alt="Vogue Logo"
            className="w-10 h-10 rounded-full object-cover shadow-sm bg-gray-900 shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold tracking-tight text-gray-900">1AM Midnight Wallet</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-900 text-white uppercase tracking-wider">
                {networkId}
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium">
              Private moves. Public proof.
            </p>
          </div>
        </div>

        {/* CONNECTED STATE */}
        {connected ? (
          <div className="space-y-4">
            {/* Status Header */}
            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-2xl border border-gray-200/80">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-bold text-gray-900">Session Connected</span>
              </div>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Real DApp Extension
              </span>
            </div>

            {/* UNSHIELDED ADDRESS CARD */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Unshielded Address
              </label>
              <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl p-3 font-mono text-xs text-gray-900">
                <span className="truncate max-w-[340px] text-gray-700 font-medium">
                  {unshieldedAddress || '—'}
                </span>
                <button
                  onClick={() => copyToClipboard(unshieldedAddress || '', false)}
                  className="p-1 text-gray-400 hover:text-gray-900 transition-colors cursor-pointer shrink-0"
                >
                  {copiedAddr ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* SHIELDED KEY COMMITMENT CARD */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Shielded Key Commitment
              </label>
              <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl p-3 font-mono text-xs text-gray-900">
                <span className="truncate max-w-[340px] text-emerald-700 font-medium">
                  {shieldedAddress || '—'}
                </span>
                <button
                  onClick={() => copyToClipboard(shieldedAddress || '', true)}
                  className="p-1 text-gray-400 hover:text-gray-900 transition-colors cursor-pointer shrink-0"
                >
                  {copiedShielded ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* BALANCE CARDS GRID */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  Live Balances ({networkId})
                </span>
                <button
                  onClick={() => onSelectNetwork(networkId)}
                  className="text-[11px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Sync Balance</span>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3.5 space-y-1">
                  <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">tNIGHT Balance</div>
                  <div className="text-sm font-extrabold text-gray-900">
                    {shieldedBalance}
                  </div>
                  <div className="text-[11px] text-gray-500 font-mono">
                    {unshieldedBalance} public
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3.5 space-y-1">
                  <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">tDUST Reserve</div>
                  <div className="text-sm font-extrabold text-emerald-700">{dustBalance}</div>
                  <div className="text-[11px] text-gray-500">ProofStation Ready</div>
                </div>
              </div>
            </div>

            {/* NETWORK SELECTOR */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  Target Network
                </label>
                <span className="text-[10px] font-bold text-orange-600 capitalize">
                  Active: {networkId}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 p-1 bg-gray-100 rounded-xl">
                {(['preview', 'preprod', 'undeployed'] as MidnightNetwork[]).map((net) => (
                  <button
                    key={net}
                    onClick={() => onSelectNetwork(net)}
                    className={`py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                      networkId === net
                        ? 'bg-white text-gray-900 shadow-sm border border-gray-200 font-bold'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {net}
                  </button>
                ))}
              </div>
            </div>

            {/* NETWORK MISMATCH ALERT BANNER */}
            {!isNetworkAligned && detected1AMNetwork && (
              <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3.5 space-y-2 text-amber-950">
                <div className="flex items-start gap-2.5">
                  <span className="text-base">⚠️</span>
                  <div className="text-xs space-y-0.5">
                    <p className="font-bold text-amber-900">
                      1AM Extension Running on Midnight {detected1AMNetwork.toUpperCase()}
                    </p>
                    <p className="text-amber-800 leading-relaxed text-[11px]">
                      Your 1AM extension dropdown is set to <strong>{detected1AMNetwork.toUpperCase()}</strong>, while Vogue is targeting <strong>{networkId.toUpperCase()}</strong>.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onSelectNetwork(detected1AMNetwork)}
                  className="w-full py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Switch Vogue Target to {detected1AMNetwork.toUpperCase()}</span>
                </button>
              </div>
            )}

            {/* 1AM Extension Network Alignment Notice */}
            <div className="bg-orange-50/80 border border-orange-200 rounded-xl p-3 text-[11px] text-orange-900 leading-relaxed">
              <span className="font-bold">💡 1AM Extension Tip: </span>
              <span>Open your 1AM extension from your browser toolbar and ensure the top network dropdown matches <strong className="capitalize">{networkId}</strong> to sync your {networkId} address and balance.</span>
            </div>

            {/* BUTTONS */}
            <div className="space-y-2 pt-1">
              <a
                href={networkId === 'preprod' ? 'https://faucet.preprod.midnight.network' : 'https://faucet.preview.midnight.network'}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 rounded-full bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-800 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Get {networkId === 'preprod' ? 'Preprod' : 'Preview'} Tokens (Midnight Faucet)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleClearCache}
                  className="py-2.5 px-3 rounded-full bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-700 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5 text-gray-500" />
                  <span>{cacheCleared ? 'Cache Cleared!' : 'Clear All Cache'}</span>
                </button>

                <button
                  onClick={() => {
                    onDisconnect();
                    onClose();
                  }}
                  className="py-2.5 px-3 rounded-full bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-bold transition-all cursor-pointer"
                >
                  Disconnect
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* DISCONNECTED / CONNECTING STATE */
          <div className="space-y-5">
            <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-5 text-center space-y-4">
              {isConnecting ? (
                <div className="space-y-3 py-4">
                  <RefreshCw className="w-8 h-8 text-[#F26522] animate-spin mx-auto" />
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-gray-900">Connecting to 1AM Extension</p>
                    <p className="text-xs text-gray-500">Please approve in your wallet popup window...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center mx-auto shadow-md">
                    <ShieldCheck className="w-6 h-6 text-orange-400" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-gray-900">Connect 1AM Midnight Wallet</h3>
                    <p className="text-xs text-gray-600 leading-relaxed max-w-sm mx-auto">
                      Connect your 1AM browser extension to prove shielded trades and manage your private vault on Midnight Preprod & Preview.
                    </p>
                  </div>
                </div>
              )}

              {/* NETWORK SELECTOR */}
              <div className="space-y-1.5 text-left pt-2">
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  Target Network
                </label>
                <div className="grid grid-cols-3 gap-2 p-1 bg-gray-100 rounded-xl">
                  {(['preview', 'preprod', 'undeployed'] as MidnightNetwork[]).map((net) => (
                    <button
                      key={net}
                      onClick={() => onSelectNetwork(net)}
                      className={`py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                        networkId === net
                          ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {net}
                    </button>
                  ))}
                </div>
              </div>

              {!isConnecting && (
                <div className="space-y-2 pt-1">
                  <button
                    onClick={onConnect}
                    className="w-full py-3 rounded-full bg-[#F26522] hover:bg-[#e05a1a] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    Connect 1AM Extension
                  </button>

                  <button
                    onClick={handleClearCache}
                    className="w-full py-2 rounded-full bg-white hover:bg-gray-100 border border-gray-200 text-gray-600 text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-gray-400" />
                    <span>{cacheCleared ? 'Wallet Cache Cleared!' : 'Clear All Wallet Cache & Reset'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
