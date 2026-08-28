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
  Clock
} from 'lucide-react';

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
    executeProvenTrade
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
              {/* Top Greeting Header (Indian Standard Time - IST) */}
              {/* Top Greeting Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 light-glass border border-white/40 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-400/5 blur-3xl rounded-full -mr-20 -mt-20 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-400/5 blur-3xl rounded-full -ml-10 -mb-10 pointer-events-none" />
                
                <div className="flex items-center gap-5 z-10">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center bg-white/60 border border-white/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] backdrop-blur-md shrink-0">
                    <img
                      src="/vogue-logo.svg"
                      alt="Vogue"
                      className="w-8 h-8 object-contain"
                    />
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center flex-wrap gap-2">
                      Welcome back,
                      <span className="font-mono text-gray-700 font-medium text-lg px-3 py-1 rounded-full bg-white/50 border border-white/60 shadow-sm inline-flex items-center mt-1 sm:mt-0">
                        {displayGreetingAddr}
                      </span>
                    </h1>
                    <div className="text-[11px] sm:text-xs text-gray-500 font-medium tracking-wide flex flex-wrap items-center gap-3 mt-1">
                      <span className="flex items-center gap-1.5 text-gray-600">
                        <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                        {formatISTDate()} • {formatISTTime()}
                      </span>
                      {latestBlock && (
                        <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50/50 px-2.5 py-1 rounded-full border border-emerald-200/50">
                          <Blocks className="w-3.5 h-3.5" /> Block #{latestBlock.height.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="z-10 inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white/40 backdrop-blur-md border border-white/60 text-gray-800 text-xs font-bold tracking-widest shrink-0 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="uppercase text-[10px] text-gray-600 mt-0.5">{networkId} TESTNET</span>
                </div>
              </div>

              {/* Wallet Syncing Banner */}
              {isSyncing && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-amber-900 text-xs flex items-center gap-3 shadow-xs">
                  <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin shrink-0" />
                  <div>
                    <span className="font-bold text-amber-800 block">1AM Wallet Syncing</span>
                    <p className="leading-relaxed text-amber-700">
                      Your wallet is syncing with Midnight Preprod. Open the 1AM extension and wait for sync to finish before transacting. Balance will update automatically.
                    </p>
                  </div>
                </div>
              )}

              {/* Error Banner for ZK Risk Model or Wallet Errors */}
              {error && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-2xl text-red-900 text-xs flex items-start gap-3 shadow-xs">
                  <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-bold text-red-800 block">Notice / Risk Restriction</span>
                    <p className="leading-relaxed">{error}</p>
                  </div>
                </div>
              )}

              {/* Top Balance Cards: Public Wallet vs Shielded Vault */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="light-glass border border-white/60 rounded-[2rem] p-6 space-y-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gray-400/10 blur-2xl rounded-full -mr-8 -mt-8" />
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">WALLET TNIGHT</span>
                  <div className="flex items-baseline gap-2 min-w-0 pt-2">
                    <span className="text-3xl sm:text-4xl font-extrabold text-gray-900 truncate tracking-tight">{unshieldedBalance}</span>
                  </div>
                  <span className="text-[10px] text-gray-500 font-medium block pt-1 uppercase tracking-wider">↑ Public 1AM Wallet</span>
                </div>

                <div className="light-glass border border-white/60 rounded-[2rem] p-6 space-y-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-400/5 to-transparent pointer-events-none" />
                  <div className="absolute top-0 right-0 w-24 h-24 bg-orange-400/20 blur-3xl rounded-full -mr-8 -mt-8" />
                  <span className="text-[10px] text-orange-600 font-bold uppercase tracking-widest flex items-center gap-1.5">
                    <Lock className="w-3 h-3 text-orange-500" /> SHIELDED VAULT
                  </span>
                  <div className="flex items-baseline gap-1.5 min-w-0 pt-2">
                    <span className="text-3xl sm:text-4xl font-extrabold text-gray-900 truncate tracking-tight">${vaultBalance.toLocaleString()}</span>
                    <span className="text-xs text-orange-600 font-extrabold shrink-0 uppercase">vUSD</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-bold block pt-1 uppercase tracking-wider">
                    {vaultBalance > 0 ? '↑ Active Trading Capital' : '↑ Mint via Vault Tab'}
                  </span>
                </div>

                <div className="light-glass border border-white/60 rounded-[2rem] p-6 space-y-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-400/10 blur-2xl rounded-full -mr-8 -mt-8" />
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">SHIELDED NOTE</span>
                  <div className="flex items-baseline gap-2 min-w-0 pt-2">
                    <span className="text-3xl sm:text-4xl font-extrabold text-gray-900 truncate tracking-tight">{shieldedBalance}</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-bold block pt-1 uppercase tracking-wider">↑ Private ZK Note</span>
                </div>

                <div className="light-glass border border-white/60 rounded-[2rem] p-6 space-y-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-teal-400/10 blur-2xl rounded-full -mr-8 -mt-8" />
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">TDUST FUEL</span>
                  <div className="flex items-baseline gap-2 min-w-0 pt-2">
                    <span className="text-3xl sm:text-4xl font-extrabold text-emerald-700 truncate tracking-tight">{dustBalance}</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-bold block pt-1 uppercase tracking-wider">↑ ProofStation Ready</span>
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

        {/* 3. MARKET INSIGHTS */}
        {activeTab === 'market-insights' && (
          <MarketInsights
            onExecuteTrade={(asset, amount, agentId) =>
              executeProvenTrade(agentId || activeStrategies[0]?.agentId || '0xagent_1', amount, asset, 'BUY')
            }
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

        {/* 6. WITHDRAW & SHIELDED VAULT */}
        {activeTab === 'withdraw' && (
          <div className="max-w-4xl mx-auto space-y-6 font-sans">
            {/* Top Vault & Wallet Overview Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Lock className="w-6 h-6 text-orange-500" />
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                    Shielded Vault
                  </h1>
                </div>
                <p className="text-sm text-gray-600 font-medium max-w-xl">
                  Manage your private USDC-equivalent trading vault and review all token balances in your connected 1AM wallet.
                </p>
              </div>

              <div className="flex items-center gap-3 bg-white/40 border border-white/60 p-3 rounded-2xl text-xs shrink-0 font-mono shadow-sm">
                <span className="text-gray-500 font-bold uppercase tracking-wider">Wallet</span>
                <span className="font-extrabold text-orange-600 bg-white/60 px-3 py-1 rounded-xl">{displayGreetingAddr}</span>
              </div>
            </div>

            {/* Comprehensive Connected Wallet Token Matrix */}
            <div className="space-y-4 mb-10">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">
                  Wallet Balances
                </h3>
                <span className="text-[11px] text-gray-500 font-bold bg-white/40 px-3 py-1 rounded-full border border-white/60 shadow-sm">Auto-synced with 1AM {networkId === 'preprod' ? 'Preprod' : 'Preview'}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* 1. Public Unshielded tNIGHT */}
                <div className="light-glass border border-white/60 rounded-[2rem] p-6 space-y-4 shadow-sm overflow-hidden relative group">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gray-400/10 blur-2xl rounded-full -mr-6 -mt-6" />
                  <div className="flex items-center justify-between relative z-10">
                    <span className="text-[11px] text-gray-500 font-bold uppercase tracking-widest">TNIGHT</span>
                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-white/60 border border-gray-200 text-gray-800 font-bold shadow-sm">UNSHIELDED</span>
                  </div>
                  <div className="flex items-baseline gap-1.5 min-w-0 relative z-10">
                    <span className="text-4xl font-extrabold text-gray-900 truncate tracking-tight">{unshieldedBalance}</span>
                  </div>
                  <div className="text-[11px] text-gray-500 flex items-center justify-between pt-3 border-t border-white/40 relative z-10">
                    <span className="font-semibold">Public 1AM Key</span>
                    <button
                      onClick={() => setMintAmount('500')}
                      className="text-orange-600 hover:text-orange-700 font-bold text-[11px] cursor-pointer flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                    >
                      Shield <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* 2. Shielded Private Note */}
                <div className="light-glass border border-white/60 rounded-[2rem] p-6 space-y-4 shadow-sm overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-400/10 blur-2xl rounded-full -mr-6 -mt-6" />
                  <div className="flex items-center justify-between relative z-10">
                    <span className="text-[11px] text-gray-500 font-bold uppercase tracking-widest">TNIGHT</span>
                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold shadow-sm">ZK PRIVATE</span>
                  </div>
                  <div className="flex items-baseline gap-1.5 min-w-0 relative z-10">
                    <span className="text-4xl font-extrabold text-emerald-700 truncate tracking-tight">{shieldedBalance}</span>
                  </div>
                  <div className="text-[11px] text-emerald-700 flex items-center justify-between pt-3 border-t border-white/40 font-semibold relative z-10">
                    <span>Private State Note</span>
                    <span>Encrypted</span>
                  </div>
                </div>

                {/* 3. Shielded Trading Vault (vUSD) */}
                <div className="light-glass border border-orange-300/60 rounded-[2rem] p-6 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-400/10 to-transparent pointer-events-none" />
                  <div className="absolute top-0 right-0 w-20 h-20 bg-orange-400/20 blur-2xl rounded-full -mr-6 -mt-6" />
                  <div className="flex items-center justify-between relative z-10">
                    <span className="text-[11px] text-orange-600 font-bold uppercase tracking-widest flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-orange-500" /> VAULT
                    </span>
                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-orange-100 border border-orange-200 text-orange-800 font-bold shadow-sm">vUSD</span>
                  </div>
                  <div className="flex items-baseline gap-1.5 min-w-0 relative z-10">
                    <span className="text-4xl font-extrabold text-gray-900 truncate tracking-tight">${vaultBalance.toLocaleString()}</span>
                  </div>
                  <div className="text-[11px] text-emerald-700 flex items-center justify-between pt-3 border-t border-white/40 font-semibold relative z-10">
                    <span>Active Capital</span>
                    <span>ZK Trade Ready</span>
                  </div>
                </div>

                {/* 4. tDUST Reserve */}
                <div className="light-glass border border-white/60 rounded-[2rem] p-6 space-y-4 shadow-sm overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-teal-400/10 blur-2xl rounded-full -mr-6 -mt-6" />
                  <div className="flex items-center justify-between relative z-10">
                    <span className="text-[11px] text-gray-500 font-bold uppercase tracking-widest">TDUST</span>
                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 font-bold shadow-sm">GAS FUEL</span>
                  </div>
                  <div className="flex items-baseline gap-1.5 min-w-0 relative z-10">
                    <span className="text-4xl font-extrabold text-teal-700 truncate tracking-tight">{dustBalance}</span>
                  </div>
                  <div className="text-[11px] text-gray-500 flex items-center justify-between pt-3 border-t border-white/40 font-semibold relative z-10">
                    <span>ProofStation</span>
                    <span className="text-teal-700 font-bold">Ready</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Vault Mint / Burn Interactive Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 1. MINT CARD */}
                <div className="light-glass border border-white/60 p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden flex flex-col">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/5 to-transparent pointer-events-none" />
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 blur-3xl rounded-full -mr-10 -mt-10 pointer-events-none" />
                  
                  <div className="flex items-center justify-between mb-8 relative z-10">
                    <span className="text-sm font-extrabold text-emerald-950 flex items-center gap-2 uppercase tracking-widest">
                      <PlusCircle className="w-5 h-5 text-emerald-600" /> Mint to Vault
                    </span>
                    <span className="text-[10px] px-3 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-800 font-extrabold tracking-widest shadow-sm">
                      DEPOSIT
                    </span>
                  </div>

                  <div className="flex-1 flex flex-col items-center justify-center space-y-6 relative z-10">
                    <div className="w-full flex items-center justify-center gap-2">
                      <span className="text-4xl font-bold text-gray-400">$</span>
                      <input
                        type="number"
                        min="1"
                        value={mintAmount}
                        onChange={(e) => setMintAmount(e.target.value)}
                        className="w-48 bg-transparent text-gray-900 font-extrabold text-6xl tracking-tight text-center focus:outline-none appearance-none"
                        placeholder="0"
                      />
                    </div>
                    
                    {/* Preset Amount Chips */}
                    <div className="flex items-center justify-center gap-2 w-full">
                      {['100', '250', '500', '1000'].map((amt) => (
                        <button
                          key={amt}
                          onClick={() => setMintAmount(amt)}
                          className="px-4 py-2 rounded-xl bg-white/40 hover:bg-white/70 text-xs font-bold text-gray-700 border border-white/60 transition-all cursor-pointer shadow-sm"
                        >
                          +${amt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 relative z-10">
                    <button
                      onClick={() => mintVault(parseFloat(mintAmount) || 100)}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:scale-[1.01] text-white font-extrabold text-[13px] tracking-widest uppercase transition-all cursor-pointer shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                    >
                      <PlusCircle className="w-5 h-5" />
                      <span>Mint ${mintAmount || '0'} vUSD</span>
                    </button>
                  </div>
                </div>

                {/* 2. BURN & WITHDRAW CARD */}
                <div className="light-glass border border-white/60 p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden flex flex-col">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-400/5 to-transparent pointer-events-none" />
                  <div className="absolute top-0 right-0 w-32 h-32 bg-orange-400/10 blur-3xl rounded-full -mr-10 -mt-10 pointer-events-none" />
                  
                  <div className="flex items-center justify-between mb-8 relative z-10">
                    <span className="text-sm font-extrabold text-gray-900 flex items-center gap-2 uppercase tracking-widest">
                      <ArrowUpRight className="w-5 h-5 text-orange-500" /> Unshield & Withdraw
                    </span>
                    <span className="text-[10px] px-3 py-1.5 rounded-full bg-white/60 border border-gray-200 text-gray-800 font-extrabold tracking-widest shadow-sm">
                      WITHDRAW
                    </span>
                  </div>

                  <div className="flex-1 flex flex-col items-center justify-center space-y-6 relative z-10">
                    <div className="w-full flex items-center justify-center gap-2">
                      <span className="text-4xl font-bold text-gray-400">$</span>
                      <input
                        type="number"
                        min="1"
                        max={vaultBalance}
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className="w-48 bg-transparent text-gray-900 font-extrabold text-6xl tracking-tight text-center focus:outline-none appearance-none"
                        placeholder="0"
                      />
                    </div>
                    
                    {/* Preset Amount Chips */}
                    <div className="flex items-center justify-center gap-2 w-full">
                      {['100', '250', '500'].map((amt) => (
                        <button
                          key={amt}
                          onClick={() => setWithdrawAmount(amt)}
                          className="px-4 py-2 rounded-xl bg-white/40 hover:bg-white/70 text-xs font-bold text-gray-700 border border-white/60 transition-all cursor-pointer shadow-sm"
                        >
                          -${amt}
                        </button>
                      ))}
                      <button
                        onClick={() => setWithdrawAmount(vaultBalance.toString())}
                        className="px-4 py-2 rounded-xl bg-orange-100 hover:bg-orange-200 text-xs font-extrabold text-orange-800 border border-orange-200 transition-all cursor-pointer shadow-sm"
                      >
                        MAX
                      </button>
                    </div>
                  </div>

                  <div className="mt-8 relative z-10 space-y-4">
                    <form onSubmit={handleWithdrawSubmit} className="w-full">
                      <button
                        type="submit"
                        disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > vaultBalance}
                        className={`w-full py-4 rounded-2xl font-extrabold text-[13px] tracking-widest uppercase transition-all flex items-center justify-center gap-2 ${
                          !withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > vaultBalance
                            ? 'bg-white/40 border border-white/60 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-900 hover:bg-black text-white cursor-pointer shadow-lg hover:scale-[1.01]'
                        }`}
                      >
                        <ArrowUpRight className={`w-5 h-5 ${(!withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > vaultBalance) ? 'text-gray-400' : 'text-orange-400'}`} />
                        <span>Execute Unshield via 1AM</span>
                      </button>
                    </form>

                    {withdrawSuccess && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-emerald-50/80 backdrop-blur-md border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs flex items-center gap-3 font-semibold shadow-sm"
                      >
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
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
    </>
  );
}

export default App;

