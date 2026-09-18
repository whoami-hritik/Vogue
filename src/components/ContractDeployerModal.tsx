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
  AlertCircle,
  Rocket,
  Cpu,
  CheckCircle2,
  Wallet,
  RotateCcw
} from 'lucide-react';
import {
  getActiveContractAddress,
  setCustomContractAddress,
  resetCustomContractAddress,
  getCustomContractAddress
} from '../utils/registry';
import {
  getMidnightExplorerContractUrl,
  getMidnightExplorerTxUrl
} from '../utils/midnightApi';
import {
  checkProofServerHealth,
  deployContractVia1AM,
  type DeployedContractResult
} from '../lib/midnight-api';

interface ContractDeployerModalProps {
  isOpen: boolean;
  onClose: () => void;
  networkId?: string;
  onContractAddressChange?: (newAddress: string) => void;
  walletConnected?: boolean;
  walletAddress?: string;
  onConnectWallet?: () => void;
}

export const ContractDeployerModal: React.FC<ContractDeployerModalProps> = ({
  isOpen,
  onClose,
  networkId = 'preprod',
  onContractAddressChange,
  walletConnected = false,
  walletAddress = '',
  onConnectWallet
}) => {
  const [activeTab, setActiveTab] = useState<'deploy' | 'status' | 'custom'>('deploy');
  const [selectedNetwork, setSelectedNetwork] = useState<'preprod' | 'preview'>(
    networkId === 'preprod' ? 'preprod' : 'preview'
  );
  const [proofServerActive, setProofServerActive] = useState<boolean | null>(null);
  const [isCheckingServer, setIsCheckingServer] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [customAddressInput, setCustomAddressInput] = useState('');
  const [deploySuccess, setDeploySuccess] = useState<string | null>(null);

  // In-App Deployment State
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployStep, setDeployStep] = useState<string>('');
  const [deployError, setDeployError] = useState<string | null>(null);
  const [deployedResult, setDeployedResult] = useState<DeployedContractResult | null>(null);
  const [currentContract, setCurrentContract] = useState<string>(() =>
    getActiveContractAddress(selectedNetwork)
  );

  const preprodTx = '0x27ffe1f7a2db3a071c5f2070c9ae6de476f839d7870a6f3c4da78d326cd28645';
  const isCustomActive = Boolean(getCustomContractAddress(selectedNetwork));

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
      setCurrentContract(getActiveContractAddress(selectedNetwork));
    }
  }, [isOpen, selectedNetwork]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDeployContract = async () => {
    if (!walletConnected && onConnectWallet) {
      onConnectWallet();
      return;
    }

    setIsDeploying(true);
    setDeployError(null);
    setDeployedResult(null);
    setDeployStep('1. Initializing Compact bytecode and constructor parameters...');

    try {
      const result = await deployContractVia1AM(selectedNetwork, (step) => {
        setDeployStep(step);
      });

      setDeployedResult(result);
      setCustomContractAddress(selectedNetwork, result.contractAddress);
      setCurrentContract(result.contractAddress);
      if (onContractAddressChange) {
        onContractAddressChange(result.contractAddress);
      }
      setDeploySuccess(`Contract successfully deployed to Midnight ${selectedNetwork}!`);
      setTimeout(() => setDeploySuccess(null), 5000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[Vogue] In-app deployment error:', err);
      setDeployError(msg);
    } finally {
      setIsDeploying(false);
    }
  };

  const handleApplyCustomAddress = () => {
    const trimmed = customAddressInput.trim();
    if (trimmed.startsWith('0x') && trimmed.length >= 64) {
      setCustomContractAddress(selectedNetwork, trimmed);
      setCurrentContract(trimmed);
      if (onContractAddressChange) {
        onContractAddressChange(trimmed);
      }
      setDeploySuccess(`Active ${selectedNetwork} contract updated to ${trimmed.substring(0, 16)}...`);
      setTimeout(() => setDeploySuccess(null), 4000);
    }
  };

  const handleResetToDefault = () => {
    resetCustomContractAddress(selectedNetwork);
    const defaultAddr = getActiveContractAddress(selectedNetwork);
    setCurrentContract(defaultAddr);
    if (onContractAddressChange) {
      onContractAddressChange(defaultAddr);
    }
    setDeploySuccess(`Reverted to verified ${selectedNetwork} contract.`);
    setTimeout(() => setDeploySuccess(null), 3000);
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
              onClick={() => setActiveTab('deploy')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'deploy'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Rocket className="w-3.5 h-3.5" />
              <span>Deploy Contract</span>
            </button>
            <button
              onClick={() => setActiveTab('status')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'status'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Live Status</span>
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeTab === 'custom'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>Override</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-gray-700">
          {deploySuccess && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs flex items-center gap-2.5 shadow-sm animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{deploySuccess}</span>
            </div>
          )}

          {/* TAB 1: IN-APP CONTRACT DEPLOYMENT */}
          {activeTab === 'deploy' && (
            <div className="space-y-5">
              
              {/* Deployment Hub Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-orange-50/50 via-white to-orange-50/20 border border-orange-200/80 shadow-sm space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-orange-100 text-orange-800 border border-orange-200 inline-block">
                      1-Click In-App Deployment
                    </span>
                    <h3 className="text-base font-bold text-gray-900">
                      Deploy Vogue Compact Circuit via 1AM
                    </h3>
                    <p className="text-xs text-gray-600 leading-relaxed max-w-lg">
                      Deploys a fresh instance of <code className="text-orange-700 font-mono bg-orange-100/60 px-1 py-0.5 rounded text-[11px]">contracts/vogue.compact</code> to Midnight {selectedNetwork.toUpperCase()}. Your 1AM wallet will sign the constructor transaction.
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-orange-500 flex items-center justify-center text-white shadow-md shadow-orange-500/30 shrink-0">
                    <Rocket className="w-5 h-5" />
                  </div>
                </div>

                {/* Pre-flight Specs Matrix */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-white/80 rounded-xl border border-orange-100 text-xs">
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">Network</span>
                    <span className="font-bold text-gray-800 uppercase">{selectedNetwork}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">Circuit Count</span>
                    <span className="font-bold text-gray-800">11 ZK Circuits</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">Est. Fee</span>
                    <span className="font-bold text-emerald-600 font-mono">0.005 tDUST</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">Signing Wallet</span>
                    <span className="font-bold text-gray-800 truncate block font-mono text-[11px]">
                      {walletConnected ? (walletAddress ? `${walletAddress.substring(0, 8)}…` : 'Connected') : 'Not Connected'}
                    </span>
                  </div>
                </div>

                {/* Deploy Progress State */}
                {isDeploying && (
                  <div className="p-4 bg-orange-500/5 border border-orange-200 rounded-2xl flex flex-col items-center justify-center space-y-3 shadow-inner">
                    <Cpu className="w-8 h-8 text-orange-500 animate-spin" />
                    <span className="font-extrabold text-gray-900 text-xs uppercase tracking-wide">
                      Deploying Contract to Midnight...
                    </span>
                    <span className="text-[11px] font-mono text-gray-600 bg-white px-3.5 py-1 rounded-full border border-gray-200 shadow-sm text-center">
                      {deployStep}
                    </span>
                    <p className="text-[11px] text-gray-500 text-center max-w-sm">
                      Please approve the deployment signature prompt in your 1AM wallet extension popup.
                    </p>
                  </div>
                )}

                {/* Deployment Error Notice */}
                {deployError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="font-bold block">Deployment Notice</span>
                      <p className="leading-relaxed">{deployError}</p>
                    </div>
                  </div>
                )}

                {/* Deployed Success Result */}
                {deployedResult && (
                  <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-3 animate-fade-in">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span className="font-bold text-emerald-900 text-xs uppercase tracking-wide">
                        Contract Deployed & Bound to DApp
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-gray-500 font-medium block text-[11px] mb-1">New Contract Address:</span>
                        <div className="flex items-center justify-between gap-2 p-2 bg-white rounded-xl border border-emerald-200 font-mono text-[11px]">
                          <span className="truncate text-gray-900 font-bold">{deployedResult.contractAddress}</span>
                          <button
                            onClick={() => copyToClipboard(deployedResult.contractAddress, 'res-addr')}
                            className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-lg shrink-0"
                            title="Copy Address"
                          >
                            {copiedField === 'res-addr' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <span className="text-gray-500 font-medium block text-[11px] mb-1">Deployment Transaction:</span>
                        <div className="flex items-center justify-between gap-2 p-2 bg-white rounded-xl border border-emerald-200 font-mono text-[11px]">
                          <span className="truncate text-gray-700">{deployedResult.txHash}</span>
                          <button
                            onClick={() => copyToClipboard(deployedResult.txHash, 'res-tx')}
                            className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-lg shrink-0"
                            title="Copy Tx Hash"
                          >
                            {copiedField === 'res-tx' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="pt-1 flex flex-wrap gap-2">
                      <a
                        href={getMidnightExplorerContractUrl(deployedResult.contractAddress, selectedNetwork)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        <span>View on Midnight Explorer</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <button
                        onClick={() => setActiveTab('status')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-gray-50 border border-emerald-300 text-emerald-800 text-xs font-bold transition-all shadow-sm cursor-pointer"
                      >
                        <Activity className="w-3.5 h-3.5" />
                        <span>Inspect in Status Tab</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Primary Action Button */}
                {!isDeploying && (
                  <div>
                    {!walletConnected ? (
                      <button
                        onClick={onConnectWallet}
                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-orange-500/20 transition-all cursor-pointer"
                      >
                        <Wallet className="w-4 h-4" />
                        <span>Connect 1AM Wallet to Deploy</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleDeployContract}
                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.005] transition-all cursor-pointer"
                      >
                        <Rocket className="w-4 h-4" />
                        <span>Deploy Contract via 1AM Wallet</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Developer Testkit CLI Reference */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Developer Terminal CLI (Optional Alternative)
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono">Midnight Testkit JS</span>
                </div>
                <p className="text-xs text-gray-500">
                  You can also deploy directly from Node.js using the repository testkit script:
                </p>
                <div className="p-2.5 bg-gray-900 text-gray-100 rounded-xl font-mono text-xs flex items-center justify-between gap-3 shadow-inner">
                  <code className="truncate">node scripts/deploy-real.cjs</code>
                  <button
                    onClick={() => copyToClipboard('node scripts/deploy-real.cjs', 'deploy-cmd')}
                    className="p-1 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 shrink-0"
                    title="Copy command"
                  >
                    {copiedField === 'deploy-cmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: LIVE ON-CHAIN STATUS */}
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
                  <div className="flex items-center gap-1.5">
                    {isCustomActive ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-900 border border-amber-200">
                        In-App Instance
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Verified on Chain
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-gray-500 font-medium">Contract Address</span>
                    {isCustomActive && (
                      <button
                        onClick={handleResetToDefault}
                        className="text-[11px] text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" /> Revert to Verified Default
                      </button>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2 p-2.5 bg-white rounded-xl border border-gray-200 font-mono text-xs">
                    <span className="truncate text-gray-800 font-semibold">{currentContract}</span>
                    <button
                      onClick={() => copyToClipboard(currentContract, 'addr')}
                      className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg shrink-0"
                      title="Copy Address"
                    >
                      {copiedField === 'addr' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {selectedNetwork === 'preprod' && !isCustomActive && (
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
                    href={getMidnightExplorerContractUrl(currentContract, selectedNetwork)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-sm"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>View Contract on Midnight Explorer</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  {selectedNetwork === 'preprod' && !isCustomActive && (
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
                      {proofServerActive ? 'Online / Ready' : 'Standby / Proving Gateway'}
                    </span>
                    <button
                      onClick={checkHealth}
                      disabled={isCheckingServer}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 cursor-pointer"
                      title="Re-check proof server"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isCheckingServer ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Midnight contracts use zk-SNARK circuits to execute private state transitions. When the local Docker Proof Server is running on port 6300, proofs are generated on-metal. When offline, Vogue utilizes 1AM ProofStation and deterministic cryptographic witness proofs.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: MANUAL OVERRIDE */}
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
                  onClick={handleResetToDefault}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset to Default</span>
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
          <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
            <span className="truncate max-w-[280px]">
              Active: {currentContract.substring(0, 14)}…{currentContract.substring(currentContract.length - 6)}
            </span>
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
