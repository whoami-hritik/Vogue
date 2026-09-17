import React, { useState, useEffect } from 'react';
import {
  X,
  Server,
  ShieldCheck,
  ExternalLink,
  Copy,
  Check,
  Activity,
  Globe,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { getActiveContractAddress } from '../utils/registry';
import { getMidnightExplorerContractUrl, getMidnightExplorerTxUrl } from '../utils/midnightApi';
import { checkProofServerHealth } from '../lib/midnight-api';

interface ContractDeployerModalProps {
  isOpen: boolean;
  onClose: () => void;
  networkId?: string;
  onContractAddressChange?: (newAddress: string) => void;
}

export const ContractDeployerModal: React.FC<ContractDeployerModalProps> = ({
  isOpen,
  onClose,
  networkId = 'preprod',
  onContractAddressChange
}) => {
  const [activeTab, setActiveTab] = useState<'status' | 'deploy' | 'custom'>('status');
  const [selectedNetwork, setSelectedNetwork] = useState<'preprod' | 'preview'>(
    networkId === 'preprod' ? 'preprod' : 'preview'
  );
  const [proofServerActive, setProofServerActive] = useState<boolean | null>(null);
  const [isCheckingServer, setIsCheckingServer] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [customAddressInput, setCustomAddressInput] = useState('');
  const [deploySuccess, setDeploySuccess] = useState<string | null>(null);

  const activeContract = getActiveContractAddress(selectedNetwork);
  const preprodTx = '0x27ffe1f7a2db3a071c5f2070c9ae6de476f839d7870a6f3c4da78d326cd28645';

  const checkHealth = async () => {
    setIsCheckingServer(true);
    try {
      const isUp = await checkProofServerHealth();
      setProofServerActive(isUp);
    } catch {
      setProofServerActive(false);
    } finally {
      setIsCheckingServer(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      checkHealth();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleApplyCustomAddress = () => {
    if (customAddressInput.trim().startsWith('0x') && customAddressInput.trim().length >= 64) {
      if (onContractAddressChange) {
        onContractAddressChange(customAddressInput.trim());
      }
      setDeploySuccess(`Active ${selectedNetwork} contract updated to ${customAddressInput.trim().substring(0, 16)}...`);
      setTimeout(() => setDeploySuccess(null), 4000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-gray-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-orange-50/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-600">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Midnight Contract Deployment & Status</h2>
              <p className="text-xs text-gray-500">Live on-chain contract verification & ZK proving infrastructure</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-white/80 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Network & Navigation Tabs */}
        <div className="px-6 pt-4 pb-2 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setSelectedNetwork('preprod')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedNetwork === 'preprod'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Preprod Testnet (Persistent)
            </button>
            <button
              onClick={() => setSelectedNetwork('preview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedNetwork === 'preview'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Preview Testnet (Ephemeral)
            </button>
          </div>

          <div className="flex items-center gap-1 text-xs">
            <button
              onClick={() => setActiveTab('status')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeTab === 'status'
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Live Status
            </button>
            <button
              onClick={() => setActiveTab('deploy')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeTab === 'deploy'
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Deploy Contract
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeTab === 'custom'
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Override Address
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-gray-700">
          {deploySuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{deploySuccess}</span>
            </div>
          )}

          {activeTab === 'status' && (
            <div className="space-y-4">
              {/* Active Contract Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-orange-50/30 border border-orange-200/60 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-gray-900 text-xs uppercase tracking-wider">
                      Active Contract ({selectedNetwork.toUpperCase()})
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {selectedNetwork === 'preprod' ? 'Verified on Chain' : 'Configured'}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] text-gray-500 font-medium">Contract Address</span>
                  <div className="flex items-center justify-between gap-2 p-2.5 bg-white rounded-xl border border-gray-200 font-mono text-xs">
                    <span className="truncate text-gray-800">{activeContract}</span>
                    <button
                      onClick={() => copyToClipboard(activeContract, 'addr')}
                      className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg shrink-0"
                      title="Copy Address"
                    >
                      {copiedField === 'addr' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {selectedNetwork === 'preprod' && (
                  <div className="space-y-1">
                    <span className="text-[11px] text-gray-500 font-medium">Deployment Transaction (Block 2,098,826)</span>
                    <div className="flex items-center justify-between gap-2 p-2.5 bg-white rounded-xl border border-gray-200 font-mono text-xs">
                      <span className="truncate text-gray-800">{preprodTx}</span>
                      <button
                        onClick={() => copyToClipboard(preprodTx, 'tx')}
                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg shrink-0"
                        title="Copy Tx Hash"
                      >
                        {copiedField === 'tx' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Explorer Links */}
                <div className="pt-2 flex flex-wrap gap-2">
                  <a
                    href={getMidnightExplorerContractUrl(activeContract, selectedNetwork)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-sm"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>View Contract on 1AM Explorer</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  {selectedNetwork === 'preprod' && (
                    <a
                      href={getMidnightExplorerTxUrl(preprodTx, 'preprod')}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 text-xs font-bold transition-all shadow-sm"
                    >
                      <Activity className="w-3.5 h-3.5 text-orange-500" />
                      <span>View Deployment TX</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

              {/* Proof Server Status Card */}
              <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-gray-700" />
                    <span className="font-bold text-gray-900 text-xs uppercase tracking-wider">
                      Proof Server Status (localhost:6300)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        proofServerActive
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-gray-100 text-gray-600 border border-gray-200'
                      }`}
                    >
                      {proofServerActive ? 'Online / Ready' : 'Standby / Simulated Proofs'}
                    </span>
                    <button
                      onClick={checkHealth}
                      disabled={isCheckingServer}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                      title="Re-check proof server"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isCheckingServer ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Midnight contracts use zk-SNARK circuits to execute private state transitions. When the local Docker Proof Server is running on port 6300, proofs are generated on-metal. When offline, Vogue utilizes ProofStation and deterministic ZK-witness simulation.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'deploy' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-2">
                <div className="flex items-center gap-2 text-blue-900 font-bold text-xs">
                  <AlertCircle className="w-4 h-4 text-blue-600" />
                  <span>How Midnight Contract Deployment Works</span>
                </div>
                <p className="text-xs text-blue-800 leading-relaxed">
                  Midnight smart contracts are written in Compact DSL (`contracts/vogue.compact`) and compiled to Zero-Knowledge Intermediate Representation (ZKIR). Deploying requires compiling constructor proofs via the Midnight Proof Server and signing with a funded wallet.
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Command Line Deployment (Official Midnight Testkit)
                </span>
                <p className="text-xs text-gray-500">
                  Run this command in the terminal to deploy a fresh contract to {selectedNetwork}:
                </p>
                <div className="p-3 bg-gray-900 text-gray-100 rounded-xl font-mono text-xs flex items-center justify-between gap-3 shadow-inner">
                  <code className="truncate">node scripts/deploy-real.cjs</code>
                  <button
                    onClick={() => copyToClipboard('node scripts/deploy-real.cjs', 'deploy-cmd')}
                    className="p-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 shrink-0"
                    title="Copy command"
                  >
                    {copiedField === 'deploy-cmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Quick Deployment Steps
                </span>
                <ol className="text-xs text-gray-600 space-y-1.5 list-decimal pl-4">
                  <li>Start the proof server: <code className="bg-gray-200 px-1.5 py-0.5 rounded text-gray-800">docker run -p 6300:6300 midnightnetwork/proof-server</code></li>
                  <li>Ensure your wallet has testnet tDUST from Nethermind faucet</li>
                  <li>Execute <code className="bg-gray-200 px-1.5 py-0.5 rounded text-gray-800">node scripts/deploy-real.cjs</code></li>
                  <li>The deployed contract address will be printed and can be pasted into Vogue</li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'custom' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-900 uppercase tracking-wider block">
                  Override Active Contract Address ({selectedNetwork})
                </label>
                <p className="text-xs text-gray-500">
                  If you deployed your own version of `vogue.compact`, paste the 64-character hex address below to bind the dApp to your contract instance.
                </p>
                <input
                  type="text"
                  placeholder="0x..."
                  value={customAddressInput}
                  onChange={(e) => setCustomAddressInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setCustomAddressInput(activeContract)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  Reset to Verified
                </button>
                <button
                  onClick={handleApplyCustomAddress}
                  disabled={!customAddressInput.startsWith('0x') || customAddressInput.length < 64}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
                >
                  Apply Contract Address
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
            <span>Preprod: 0x2428cd...e524</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
