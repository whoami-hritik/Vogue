import { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { LandingPage } from './components/LandingPage';
import { StrategyBuilder } from './components/StrategyBuilder';
import { WalletModal } from './components/WalletModal';
import { ProtocolLog } from './components/ProtocolLog';
import { MarketInsights } from './components/MarketInsights';
import { Portfolio } from './components/Portfolio';
import { TradeHistory } from './components/TradeHistory';
import { MarketChart } from './components/MarketChart';
import { OverviewStrategies } from './components/OverviewStrategies';
import { DarkIntentMonitor } from './components/DarkIntentMonitor';
import { AlphaMarketplace } from './components/AlphaMarketplace';
import { InstitutionalCompliance } from './components/InstitutionalCompliance';
import { IcebergMonitor } from './components/IcebergMonitor';
import { DarkIntentPortal } from './components/DarkIntentPortal';
import { formatISTDate, formatISTTime } from './utils/time';
import { useMidnight } from './hooks/useMidnight';
import { PreprodCounter } from './components/PreprodCounter';
import {
  Shield,
  ArrowUpRight,
  TrendingUp,
  Cpu,
  Zap,
  CheckCircle2,
  ExternalLink,
  Blocks,
  AlertTriangle,
  Lock,
  PlusCircle,
  MinusCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('landing');

  const {
    detectedWallets,
    scanWallets,
    walletConnected,
    walletAddress,
    shieldedAddress,
    walletName,
    networkId,
    detected1AMNetwork,
    isNetworkAligned,
    balance,
    shieldedBalance,
    unshieldedBalance,
    dustBalance,
    vaultBalance,
    isConnecting,
    error,
    proofServerUp,
    dustReady,
    isSyncing,
    isModalOpen,
    setIsModalOpen,
    protocolLogs,
    latestBlock,
    handleSelectNetwork,
    connectWallet,
    disconnectWallet,
    clearWalletCache,
    mintVault,
    burnVault,
    activeStrategies,
    trades,
    isProofGenerating,
    proofStep,
    isAnalyzing,
    recommendationMap,
    analyzeStrategy,
    commitStrategyCircuit,
    executeProvenTrade,
    executeDarkIntentTrade,
    isDarkIntentModalOpen,
    setIsDarkIntentModalOpen,
  } = useMidnight();

  const [withdrawAmount, setWithdrawAmount] = useState<string>('500');
  const [mintAmount, setMintAmount] = useState<string>('250');
  const [withdrawSuccess, setWithdrawSuccess] = useState<boolean>(false);

  // Auto-navigate to dashboard when wallet connects
  useEffect(() => {
    if (walletConnected && activeTab === 'landing') {
      setActiveTab('overview');
    }
  }, [walletConnected]);

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(withdrawAmount) || 0;
    if (amt <= 0 || amt > vaultBalance) {
      return; // Validation prevents invalid submits
    }
    await burnVault(amt);
    setWithdrawSuccess(true);
    setWithdrawAmount(''); // Reset input field
    setTimeout(() => setWithdrawSuccess(false), 3000);
  };

  const displayGreetingAddr = walletAddress
    ? walletAddress.length > 20
      ? `${walletAddress.substring(0, 16)}...${walletAddress.substring(walletAddress.length - 6)}`
      : walletAddress
    : 'Connect 1AM Wallet';

  const explorerBaseUrl = networkId === 'preprod' ? 'https://preprod.midnightexplorer.com' : 'https://preview.midnightexplorer.com';

  return (
    <>
      {activeTab === 'landing' ? (
        <LandingPage
          onConnectWallet={() => setIsModalOpen(true)}
          onEnterDashboard={() => setActiveTab('overview')}
          walletConnected={walletConnected}
          walletAddress={walletAddress}
        />
      ) : (
        <Layout
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          walletConnected={walletConnected}
          walletAddress={walletAddress}
          shieldedAddress={shieldedAddress}
          walletName={walletName}
          networkId={networkId}
          detected1AMNetwork={detected1AMNetwork}
          isNetworkAligned={isNetworkAligned}
          balance={balance}
          shieldedBalance={shieldedBalance}
          unshieldedBalance={unshieldedBalance}
          dustBalance={dustBalance}
          isConnecting={isConnecting}
          error={error}
          proofServerUp={proofServerUp}
          dustReady={dustReady}
          latestBlockHeight={latestBlock?.height}
          detectedWallets={detectedWallets}
          onOpenModal={() => setIsModalOpen(true)}
          onScan={scanWallets}
          onConnect={connectWallet}
          onDisconnect={disconnectWallet}
        >
          {/* 1. OVERVIEW / HOME */}
          {activeTab === 'overview' && (
            <div className="space-y-6 max-w-6xl mx-auto font-sans">
              {/* Top Greeting Header (Liquid Glass) */}
              <div className="liquid-glass p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
                <div className="flex items-center gap-5 z-10">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white/[0.06] border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] backdrop-blur-md shrink-0">
                    <img
                      src="/vogue-logo.svg"
                      alt="Vogue"
                      className="w-7 h-7 object-contain"
                    />
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center flex-wrap gap-2">
                      Welcome back,
                      <span className="font-mono text-zinc-200 font-medium text-base px-3 py-1 rounded-full bg-white/[0.06] border border-white/15 shadow-sm inline-flex items-center mt-1 sm:mt-0">
                        {displayGreetingAddr}
                      </span>
                    </h1>
                    <div className="text-[11px] sm:text-xs text-zinc-400 font-mono tracking-wide flex flex-wrap items-center gap-3 mt-0.5">
                      <span className="flex items-center gap-1.5 text-zinc-400">
                        <Clock className="w-3.5 h-3.5 text-zinc-400" />
                        {formatISTDate()} • {formatISTTime()}
                      </span>
                      {latestBlock && (
                        <span className="liquid-glass-pill px-2.5 py-0.5 text-emerald-400 flex items-center gap-1.5 font-mono">
                          <Blocks className="w-3.5 h-3.5" /> Block #{latestBlock.height.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="z-10 liquid-glass-pill px-4 py-2 inline-flex items-center gap-2.5 text-zinc-300 text-xs font-mono font-bold tracking-widest shrink-0">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="uppercase text-[10px] text-zinc-300 mt-0.5">{networkId} TESTNET</span>
                </div>
              </div>

              {/* Wallet Syncing Banner */}
              {isSyncing && (
                <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl text-amber-200 text-xs flex items-center gap-3 backdrop-blur-md">
                  <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin shrink-0" />
                  <div>
                    <span className="font-bold text-amber-300 block">1AM Wallet Syncing</span>
                    <p className="leading-relaxed text-amber-200/80">
                      Your wallet is syncing with Midnight Preprod. Balance will update automatically.
                    </p>
                  </div>
                </div>
              )}

              {/* Error Banner */}
              {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl text-rose-200 text-xs flex items-start gap-3 backdrop-blur-md">
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-bold text-rose-300 block">Notice / Risk Restriction</span>
                    <p className="leading-relaxed">{error}</p>
                  </div>
                </div>
              )}

              {/* Top Balance Cards: Public Wallet vs Shielded Vault (Liquid Glass) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="liquid-glass p-6 space-y-2.5">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest font-mono">WALLET TNIGHT</span>
                  <div className="flex items-baseline gap-2 min-w-0 pt-1">
                    <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono truncate tracking-tight">{unshieldedBalance}</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-mono block pt-1 uppercase tracking-wider">↑ Public 1AM Wallet</span>
                </div>

                <div className="liquid-glass p-6 space-y-2.5">
                  <span className="text-[10px] text-white font-bold uppercase tracking-widest flex items-center gap-1.5 font-mono">
                    <Lock className="w-3.5 h-3.5 text-zinc-300" /> SHIELDED VAULT
                  </span>
                  <div className="flex items-baseline gap-1.5 min-w-0 pt-1">
                    <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono truncate tracking-tight">${vaultBalance.toLocaleString()}</span>
                    <span className="text-xs text-zinc-300 font-extrabold font-mono shrink-0 uppercase">vUSD</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold block pt-1 uppercase tracking-wider">
                    {vaultBalance > 0 ? '↑ Active Trading Capital' : '↑ Mint via Vault Tab'}
                  </span>
                </div>

                <div className="liquid-glass p-6 space-y-2.5">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest font-mono">SHIELDED NOTE</span>
                  <div className="flex items-baseline gap-2 min-w-0 pt-1">
                    <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono truncate tracking-tight">{shieldedBalance}</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold block pt-1 uppercase tracking-wider">↑ Private ZK Note</span>
                </div>

                <div className="liquid-glass p-6 space-y-2.5">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest font-mono">TDUST FUEL</span>
                  <div className="flex items-baseline gap-2 min-w-0 pt-1">
                    <span className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-mono truncate tracking-tight">{dustBalance}</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold block pt-1 uppercase tracking-wider">↑ ProofStation Ready</span>
                </div>
              </div>

              {/* Main Overview Grid: Market Chart & Strategies Matrix + Live Protocol Log */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Columns: Live Market Interactive Chart + Active Strategies & Position Matrix */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Interactive Live Market Price & Analytics Graph */}
                  <MarketChart
                    onNavigateTab={setActiveTab}
                    vaultBalance={vaultBalance}
                  />

                  {/* Active Strategy Commitments & Position Bounds Matrix */}
                  <OverviewStrategies
                    activeStrategies={activeStrategies}
                    vaultBalance={vaultBalance}
                    networkId={networkId}
                    onNavigateTab={setActiveTab}
                  />

                  <PreprodCounter />
                </div>

                {/* Right 1 Column: Live Real-Time Protocol Event Log in IST */}
                <div className="lg:col-span-1">
                  <ProtocolLog logs={protocolLogs} networkId={networkId} />
                </div>
              </div>
            </div>
          )}

        {/* 2. STRATEGY BUILDER */}
        {activeTab === 'strategy-builder' && (
          <StrategyBuilder
            onCommit={commitStrategyCircuit}
            isProofGenerating={isProofGenerating}
            proofStep={proofStep}
            walletConnected={walletConnected}
            onConnectWallet={() => setIsModalOpen(true)}
            networkId={networkId}
            onNavigateTab={setActiveTab}
          />
        )}

        {/* 2.5 ALPHA MARKETPLACE (PROOF OF ALPHA & BLIND COPY-TRADING) */}
        {activeTab === 'alpha-marketplace' && (
          <AlphaMarketplace
            walletConnected={walletConnected}
            walletAddress={walletAddress}
            vaultBalance={vaultBalance}
            onConnectWallet={() => setIsModalOpen(true)}
            onNavigateTab={setActiveTab}
          />
        )}

        {/* 2.75 INSTITUTIONAL COMPLIANCE & SELECTIVE AUDITABILITY */}
        {activeTab === 'institutional-compliance' && (
          <InstitutionalCompliance
            walletConnected={walletConnected}
            walletAddress={walletAddress}
            vaultBalance={vaultBalance}
            onConnectWallet={() => setIsModalOpen(true)}
            onNavigateTab={setActiveTab}
          />
        )}

        {/* 2.85 ZK-ICEBERG & TEMPORAL SHUFFLING ANTI-MEV TWAP */}
        {activeTab === 'zk-iceberg' && (
          <IcebergMonitor
            walletConnected={walletConnected}
            walletAddress={walletAddress}
            vaultBalance={vaultBalance}
            onConnectWallet={() => setIsModalOpen(true)}
          />
        )}

        {/* 2.95 ZK-DARK INTENT SOLVER NETWORK (DIN) */}
        {activeTab === 'dark-intent' && (
          <DarkIntentPortal
            walletConnected={walletConnected}
            walletAddress={walletAddress}
            vaultBalance={vaultBalance}
            onConnectWallet={() => setIsModalOpen(true)}
            networkId={networkId}
          />
        )}

        {/* 3. MARKET INSIGHTS */}
        {activeTab === 'market-insights' && (
          <MarketInsights
            onExecuteTrade={(asset, amount, agentId) =>
              executeProvenTrade(agentId || activeStrategies[0]?.agentId || '0xagent_1', amount, asset, 'BUY')
            }
            onExecuteDarkIntentTrade={(agentId, asset, amount, route) =>
              executeDarkIntentTrade(agentId || activeStrategies[0]?.agentId || '0xagent_1', asset, amount, route)
            }
            onOpenDarkIntentMonitor={() => setIsDarkIntentModalOpen(true)}
            isProofGenerating={isProofGenerating}
            walletConnected={walletConnected}
            onConnectWallet={() => setIsModalOpen(true)}
            vaultBalance={vaultBalance}
            activeStrategies={activeStrategies}
            onNavigateTab={setActiveTab}
          />
        )}

        {/* 4. PORTFOLIO */}
        {activeTab === 'portfolio' && (
          <Portfolio
            walletConnected={walletConnected}
            networkId={networkId}
            balance={balance}
            shieldedBalance={shieldedBalance}
            unshieldedBalance={unshieldedBalance}
            dustBalance={dustBalance}
            activeStrategies={activeStrategies}
            trades={trades}
            onNavigateTab={setActiveTab}
          />
        )}

        {/* 5. TRADE HISTORY */}
        {activeTab === 'trade-history' && (
          <TradeHistory
            trades={trades}
            onExecuteTrade={(asset, amount) => executeProvenTrade(activeStrategies[0]?.agentId || '0xagent_1', amount, asset, 'BUY')}
            isProofGenerating={isProofGenerating}
            walletConnected={walletConnected}
            onConnectWallet={() => setIsModalOpen(true)}
            networkId={networkId}
            vaultBalance={vaultBalance}
            onNavigateTab={setActiveTab}
          />
        )}

        {/* 6. WITHDRAW & SHIELDED VAULT (Liquid Glass) */}
        {activeTab === 'withdraw' && (
          <div className="max-w-4xl mx-auto space-y-8 font-sans pb-12">
            {/* Top Vault & Wallet Overview Header */}
            <div className="liquid-glass p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/20 flex items-center justify-center text-white">
                    <Lock className="w-4 h-4" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    Shielded Vault
                  </h1>
                </div>
                <p className="text-xs sm:text-sm text-zinc-300 font-normal max-w-xl leading-relaxed">
                  Manage private USDC-equivalent trading capital (vUSD) and review cryptographic balance notes in your connected 1AM wallet.
                </p>
              </div>

              <div className="liquid-glass-pill px-4 py-2 text-xs shrink-0 font-mono flex items-center gap-2">
                <span className="text-zinc-400 uppercase tracking-wider font-bold">Wallet:</span>
                <span className="font-bold text-white">{displayGreetingAddr}</span>
              </div>
            </div>

            {/* Comprehensive Connected Wallet Token Matrix */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white uppercase tracking-widest font-mono">
                  Wallet Balances Matrix
                </h3>
                <span className="liquid-glass-pill px-3 py-1 text-[11px] text-zinc-300 font-mono">
                  Auto-synced with 1AM {networkId === 'preprod' ? 'Preprod' : 'Preview'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* 1. Public Unshielded tNIGHT */}
                <div className="liquid-glass p-6 space-y-4 group">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-widest font-mono">TNIGHT</span>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-white/15 text-zinc-300 font-mono font-bold">UNSHIELDED</span>
                  </div>
                  <div className="flex items-baseline gap-1.5 min-w-0">
                    <span className="text-4xl font-extrabold text-white font-mono truncate tracking-tight">{unshieldedBalance}</span>
                  </div>
                  <div className="text-[11px] text-zinc-400 flex items-center justify-between pt-3 border-t border-white/10">
                    <span className="font-mono">Public Key</span>
                    <button
                      onClick={() => setMintAmount('500')}
                      className="text-white hover:text-zinc-200 font-bold font-mono text-[11px] cursor-pointer flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                    >
                      Shield <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* 2. Shielded Private Note */}
                <div className="liquid-glass p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-widest font-mono">TNIGHT</span>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono font-bold">ZK PRIVATE</span>
                  </div>
                  <div className="flex items-baseline gap-1.5 min-w-0">
                    <span className="text-4xl font-extrabold text-white font-mono truncate tracking-tight">{shieldedBalance}</span>
                  </div>
                  <div className="text-[11px] text-emerald-400 flex items-center justify-between pt-3 border-t border-white/10 font-mono">
                    <span>Private Note</span>
                    <span>Encrypted</span>
                  </div>
                </div>

                {/* 3. Shielded Trading Vault (vUSD) */}
                <div className="liquid-glass p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-white font-bold uppercase tracking-widest flex items-center gap-1.5 font-mono">
                      <Lock className="w-3.5 h-3.5 text-zinc-300" /> VAULT
                    </span>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-white/15 text-white font-mono font-bold">vUSD</span>
                  </div>
                  <div className="flex items-baseline gap-1.5 min-w-0">
                    <span className="text-4xl font-extrabold text-white font-mono truncate tracking-tight">${vaultBalance.toLocaleString()}</span>
                  </div>
                  <div className="text-[11px] text-emerald-400 flex items-center justify-between pt-3 border-t border-white/10 font-mono">
                    <span>Active Capital</span>
                    <span>Ready</span>
                  </div>
                </div>

                {/* 4. tDUST Reserve */}
                <div className="liquid-glass p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-widest font-mono">TDUST</span>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-white/15 text-zinc-300 font-mono font-bold">GAS FUEL</span>
                  </div>
                  <div className="flex items-baseline gap-1.5 min-w-0">
                    <span className="text-4xl font-extrabold text-emerald-400 font-mono truncate tracking-tight">{dustBalance}</span>
                  </div>
                  <div className="text-[11px] text-zinc-400 flex items-center justify-between pt-3 border-t border-white/10 font-mono">
                    <span>ProofStation</span>
                    <span className="text-emerald-400 font-bold">Ready</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Vault Mint / Burn Interactive Section (Liquid Glass) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 1. MINT CARD */}
              <div className="liquid-glass p-8 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-8">
                  <span className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-widest font-mono">
                    <PlusCircle className="w-4 h-4 text-emerald-400" /> Mint to Vault
                  </span>
                  <span className="liquid-glass-pill px-3 py-1 text-[10px] text-emerald-400 font-mono font-bold uppercase tracking-widest">
                    DEPOSIT
                  </span>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                  <div className="w-full flex items-center justify-center gap-2">
                    <span className="text-4xl font-bold text-zinc-500 font-mono">$</span>
                    <input
                      type="number"
                      min="1"
                      value={mintAmount}
                      onChange={(e) => setMintAmount(e.target.value)}
                      className="w-48 bg-transparent text-white font-extrabold text-5xl sm:text-6xl tracking-tight text-center focus:outline-none appearance-none font-mono"
                      placeholder="0"
                    />
                  </div>
                  
                  {/* Preset Amount Chips */}
                  <div className="flex items-center justify-center gap-2 w-full flex-wrap">
                    {['100', '250', '500', '1000'].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setMintAmount(amt)}
                        className="liquid-glass-pill px-4 py-2 hover:bg-white/[0.08] text-xs font-mono font-bold text-zinc-200 transition-all cursor-pointer"
                      >
                        +${amt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-8">
                  <button
                    onClick={() => mintVault(parseFloat(mintAmount) || 100)}
                    className="liquid-glass-btn w-full py-4 text-xs font-bold font-mono tracking-widest uppercase flex items-center justify-center gap-2"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Mint ${mintAmount || '0'} vUSD</span>
                  </button>
                </div>
              </div>

              {/* 2. BURN & WITHDRAW CARD */}
              <div className="liquid-glass p-8 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-8">
                  <span className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-widest font-mono">
                    <ArrowUpRight className="w-4 h-4 text-zinc-300" /> Unshield & Withdraw
                  </span>
                  <span className="liquid-glass-pill px-3 py-1 text-[10px] text-zinc-300 font-mono font-bold uppercase tracking-widest">
                    WITHDRAW
                  </span>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                  <div className="w-full flex items-center justify-center gap-2">
                    <span className="text-4xl font-bold text-zinc-500 font-mono">$</span>
                    <input
                      type="number"
                      min="1"
                      max={vaultBalance}
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="w-48 bg-transparent text-white font-extrabold text-5xl sm:text-6xl tracking-tight text-center focus:outline-none appearance-none font-mono"
                      placeholder="0"
                    />
                  </div>
                  
                  {/* Preset Amount Chips */}
                  <div className="flex items-center justify-center gap-2 w-full flex-wrap">
                    {['100', '250', '500'].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setWithdrawAmount(amt)}
                        className="liquid-glass-pill px-4 py-2 hover:bg-white/[0.08] text-xs font-mono font-bold text-zinc-200 transition-all cursor-pointer"
                      >
                        -${amt}
                      </button>
                    ))}
                    <button
                      onClick={() => setWithdrawAmount(vaultBalance.toString())}
                      className="liquid-glass-pill px-4 py-2 bg-white/[0.08] hover:bg-white/[0.14] text-xs font-mono font-extrabold text-white transition-all cursor-pointer"
                    >
                      MAX
                    </button>
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  <form onSubmit={handleWithdrawSubmit} className="w-full">
                    <button
                      type="submit"
                      disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > vaultBalance}
                      className={`w-full py-4 rounded-full font-mono font-extrabold text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-2 ${
                        !withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > vaultBalance
                          ? 'liquid-glass-btn-secondary opacity-40 cursor-not-allowed'
                          : 'liquid-glass-btn cursor-pointer'
                      }`}
                    >
                      <ArrowUpRight className="w-4 h-4" />
                      <span>Execute Unshield via 1AM</span>
                    </button>
                  </form>

                  {withdrawSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="liquid-glass border-emerald-500/30 text-emerald-300 p-4 text-xs flex items-center gap-3 font-semibold"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Unshield successful! Value returned to public 1AM wallet balance.</span>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        </Layout>
      )}

      {/* 1AM WALLET MODAL DIALOG */}
      <WalletModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        connected={walletConnected}
        isConnecting={isConnecting}
        unshieldedAddress={walletAddress}
        shieldedAddress={shieldedAddress}
        shieldedBalance={shieldedBalance}
        unshieldedBalance={unshieldedBalance}
        dustBalance={dustBalance}
        networkId={networkId}
        detected1AMNetwork={detected1AMNetwork}
        isNetworkAligned={isNetworkAligned}
        onSelectNetwork={handleSelectNetwork}
        onConnect={connectWallet}
        onDisconnect={disconnectWallet}
        onClearCache={clearWalletCache}
      />

      {/* DARK INTENT NETWORK (DIN) SOLVER MONITOR */}
      <DarkIntentMonitor
        isOpen={isDarkIntentModalOpen}
        onClose={() => setIsDarkIntentModalOpen(false)}
        networkId={networkId}
      />
    </>
  );
}

export default App;

