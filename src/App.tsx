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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="light-glass border border-gray-200/80 rounded-2xl p-5 space-y-1 shadow-sm overflow-hidden">
                  <span className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider">WALLET TNIGHT (UNSHIELDED)</span>
                  <div className="flex items-baseline gap-2 pt-1 min-w-0">
                    <span className="text-xl sm:text-2xl font-extrabold text-gray-900 truncate">{unshieldedBalance}</span>
                  </div>
                  <span className="text-[11px] text-gray-500 font-medium block pt-1">↑ Public 1AM Wallet</span>
                </div>

                <div className="light-glass border border-orange-200/80 rounded-2xl p-5 space-y-1 shadow-sm overflow-hidden">
                  <span className="text-[11px] text-orange-600 font-semibold uppercase tracking-wider flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-orange-500" /> SHIELDED VAULT (vUSD)
                  </span>
                  <div className="flex items-baseline gap-2 pt-1 min-w-0">
                    <span className="text-xl sm:text-2xl font-extrabold text-gray-900 truncate">${vaultBalance.toLocaleString()}</span>
                    <span className="text-xs text-orange-600 font-bold shrink-0">vUSD</span>
                  </div>
                  <span className="text-[11px] text-emerald-700 font-medium block pt-1">
                    {vaultBalance > 0 ? '↑ Active Trading Capital' : '↑ Mint via Vault Tab'}
                  </span>
                </div>

                <div className="light-glass border border-gray-200/80 rounded-2xl p-5 space-y-1 shadow-sm overflow-hidden">
                  <span className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider">SHIELDED TNIGHT NOTE</span>
                  <div className="flex items-baseline gap-2 pt-1 min-w-0">
                    <span className="text-xl sm:text-2xl font-extrabold text-gray-900 truncate">{shieldedBalance}</span>
                  </div>
                  <span className="text-[11px] text-emerald-700 font-medium block pt-1">↑ Private ZK Note</span>
                </div>

                <div className="light-glass border border-gray-200/80 rounded-2xl p-5 space-y-1 shadow-sm overflow-hidden">
                  <span className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider">TDUST FUEL RESERVE</span>
                  <div className="flex items-baseline gap-2 pt-1 min-w-0">
                    <span className="text-xl sm:text-2xl font-extrabold text-emerald-700 truncate">{dustBalance}</span>
                  </div>
                  <span className="text-[11px] text-emerald-700 font-medium block pt-1">↑ ProofStation Ready</span>
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 light-glass border border-gray-200/80 rounded-2xl p-6 shadow-sm">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-orange-500" />
                  <h1 className="text-xl font-extrabold text-gray-900">
                    Shielded Vault & Wallet Token Balances
                  </h1>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 font-bold uppercase">
                    1AM ZERO-KNOWLEDGE LEDGER
                  </span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Manage your private USDC-equivalent trading vault (<code className="font-mono font-bold text-gray-900">vUSD</code>) and review all token balances in your connected 1AM wallet.
                </p>
              </div>

              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 p-2 rounded-xl text-xs shrink-0 font-mono">
                <span className="text-gray-500">Wallet:</span>
                <span className="font-bold text-orange-600">{displayGreetingAddr}</span>
              </div>
            </div>

            {/* Comprehensive Connected Wallet Token Matrix */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Connected Wallet & Shielded Token Balances
                </h3>
                <span className="text-[11px] text-gray-500">Auto-synced with 1AM Extension & Midnight {networkId === 'preprod' ? 'Preprod' : 'Preview'}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Public Unshielded tNIGHT */}
                <div className="light-glass border border-gray-200/80 rounded-2xl p-5 space-y-2 shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">WALLET TNIGHT</span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-800 font-bold">UNSHIELDED</span>
                  </div>
                  <div className="flex items-baseline gap-1.5 min-w-0">
                    <span className="text-xl sm:text-2xl font-extrabold text-gray-900 truncate">{unshieldedBalance}</span>
                  </div>
                  <div className="text-[11px] text-gray-500 flex items-center justify-between pt-1 border-t border-gray-100">
                    <span>Public 1AM Key</span>
                    <button
                      onClick={() => setMintAmount('500')}
                      className="text-orange-600 hover:underline font-bold text-[10px] cursor-pointer"
                    >
                      Shield →
                    </button>
                  </div>
                </div>

                {/* 2. Shielded Private Note */}
                <div className="light-glass border border-gray-200/80 rounded-2xl p-5 space-y-2 shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">SHIELDED TNIGHT</span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">ZK PRIVATE</span>
                  </div>
                  <div className="flex items-baseline gap-1.5 min-w-0">
                    <span className="text-xl sm:text-2xl font-extrabold text-emerald-700 truncate">{shieldedBalance}</span>
                  </div>
                  <div className="text-[11px] text-emerald-700 flex items-center justify-between pt-1 border-t border-gray-100 font-medium">
                    <span>Private State Note</span>
                    <span>Encrypted</span>
                  </div>
                </div>

                {/* 3. Shielded Trading Vault (vUSD) */}
                <div className="light-glass border border-orange-200 rounded-2xl p-5 space-y-2 shadow-sm ring-1 ring-orange-500/20 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-orange-600 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Lock className="w-3 h-3 text-orange-500" /> TRADING VAULT
                    </span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 font-bold">vUSD</span>
                  </div>
                  <div className="flex items-baseline gap-1.5 min-w-0">
                    <span className="text-xl sm:text-2xl font-extrabold text-gray-900 truncate">${vaultBalance.toLocaleString()}</span>
                    <span className="text-xs text-orange-600 font-bold shrink-0">vUSD</span>
                  </div>
                  <div className="text-[11px] text-emerald-700 flex items-center justify-between pt-1 border-t border-orange-100 font-medium">
                    <span>Active Capital</span>
                    <span>ZK Trade Ready</span>
                  </div>
                </div>

                {/* 4. tDUST Reserve */}
                <div className="light-glass border border-gray-200/80 rounded-2xl p-5 space-y-2 shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">TDUST RESERVE</span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">GAS FUEL</span>
                  </div>
                  <div className="flex items-baseline gap-1.5 min-w-0">
                    <span className="text-xl sm:text-2xl font-extrabold text-emerald-700 truncate">{dustBalance}</span>
                  </div>
                  <div className="text-[11px] text-gray-500 flex items-center justify-between pt-1 border-t border-gray-100">
                    <span>ProofStation</span>
                    <span className="text-emerald-700 font-bold">Ready</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Vault Mint / Burn Interactive Section */}
            <div className="light-glass border border-gray-200/80 rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="space-y-0.5">
                  <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <PlusCircle className="w-4 h-4 text-emerald-600" />
                    Shield & Unshield Vault Collateral
                  </h2>
                  <p className="text-xs text-gray-500">
                    Deposit public collateral into shielded <code className="font-mono text-gray-900">vUSD</code> notes or burn back to public balance.
                  </p>
                </div>

                <span className="text-xs font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-full font-mono">
                  Vault Balance: ${vaultBalance.toLocaleString()} vUSD
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
                {/* 1. MINT CARD */}
                <div className="bg-gradient-to-br from-emerald-50/40 via-white to-gray-50 p-5 rounded-2xl border border-emerald-200/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-emerald-900 flex items-center gap-1.5 uppercase tracking-wide">
                      <PlusCircle className="w-4 h-4 text-emerald-600" /> Mint to Shielded Vault
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                      DEPOSIT
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-gray-600 block">Amount to Mint (USD)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-gray-500 font-bold font-mono">$</span>
                      <input
                        type="number"
                        min="1"
                        value={mintAmount}
                        onChange={(e) => setMintAmount(e.target.value)}
                        className="w-full light-glass border border-gray-200 rounded-xl pl-7 pr-4 py-2.5 text-xs text-gray-900 font-mono font-bold focus:outline-none focus:border-emerald-500"
                        placeholder="250"
                      />
                    </div>
                  </div>

                  {/* Preset Amount Chips */}
                  <div className="flex items-center gap-1.5">
                    {['100', '250', '500', '1000'].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setMintAmount(amt)}
                        className="flex-1 py-1 rounded-lg light-glass hover:bg-emerald-50 text-[11px] font-bold text-gray-700 border border-gray-200 transition-all cursor-pointer"
                      >
                        +${amt}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => mintVault(parseFloat(mintAmount) || 100)}
                    className="w-full py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Mint ${mintAmount || '0'} vUSD to Vault</span>
                  </button>
                </div>

                {/* 2. BURN CARD */}
                <div className="bg-gradient-to-br from-red-50/40 via-white to-gray-50 p-5 rounded-2xl border border-red-200/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-red-900 flex items-center gap-1.5 uppercase tracking-wide">
                      <MinusCircle className="w-4 h-4 text-red-600" /> Burn from Shielded Vault
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-bold">
                      WITHDRAW
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-gray-600 block">Amount to Burn (USD)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-gray-500 font-bold font-mono">$</span>
                      <input
                        type="number"
                        min="1"
                        max={vaultBalance}
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className="w-full light-glass border border-gray-200 rounded-xl pl-7 pr-4 py-2.5 text-xs text-gray-900 font-mono font-bold focus:outline-none focus:border-red-500"
                        placeholder="500"
                      />
                    </div>
                  </div>

                  {/* Preset Amount Chips */}
                  <div className="flex items-center gap-1.5">
                    {['100', '250', '500'].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setWithdrawAmount(amt)}
                        className="flex-1 py-1 rounded-lg light-glass hover:bg-red-50 text-[11px] font-bold text-gray-700 border border-gray-200 transition-all cursor-pointer"
                      >
                        -${amt}
                      </button>
                    ))}
                    <button
                      onClick={() => setWithdrawAmount(vaultBalance.toString())}
                      className="flex-1 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-[11px] font-extrabold text-red-800 border border-red-200 transition-all cursor-pointer"
                    >
                      Max
                    </button>
                  </div>

                  <button
                    onClick={() => burnVault(parseFloat(withdrawAmount) || 100)}
                    disabled={vaultBalance <= 0 || parseFloat(withdrawAmount) > vaultBalance}
                    className={`w-full py-2.5 rounded-full font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 ${
                      vaultBalance > 0 && parseFloat(withdrawAmount) <= vaultBalance
                        ? 'bg-red-600 hover:bg-red-700 text-white cursor-pointer'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <MinusCircle className="w-4 h-4" />
                    <span>Burn ${withdrawAmount || '0'} vUSD from Vault</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Unshield & Withdraw Circuit Execution */}
            <div className="light-glass border border-gray-200/80 rounded-2xl p-6 space-y-4 shadow-sm">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-orange-500" />
                Unshield & Withdraw (unshieldWithdraw Compact Circuit)
              </h2>
              <p className="text-xs text-gray-600 leading-relaxed">
                Executes the on-chain <code className="text-gray-900 font-mono font-semibold">unshieldWithdraw</code> circuit. Proves ownership of a private balance note in zero-knowledge and transfers public tokens back to your 1AM wallet balance.
              </p>

              <form onSubmit={handleWithdrawSubmit} className="space-y-4 pt-1">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">Withdraw Amount (USD Value)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-900 font-mono focus:outline-none focus:border-orange-500"
                    />
                    <span className="text-xs font-mono text-gray-500 font-bold px-2">vUSD</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > vaultBalance}
                  className={`w-full py-3 rounded-full font-semibold text-xs transition-all flex items-center justify-center gap-2 ${
                    !withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > vaultBalance
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-900 hover:bg-black text-white cursor-pointer shadow-sm'
                  }`}
                >
                  <ArrowUpRight className={`w-4 h-4 ${(!withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > vaultBalance) ? 'text-gray-400' : 'text-orange-400'}`} />
                  <span>Execute Unshield Transfer via 1AM</span>
                </button>
              </form>

              {withdrawSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Unshield circuit execution successful! Value returned to public 1AM wallet balance.</span>
                </div>
              )}
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

