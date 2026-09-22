import React, { useState } from 'react';
import {
  LayoutDashboard,
  LineChart,
  Cpu,
  PieChart,
  History,
  ArrowUpRight,
  Sparkles,
  Blocks,
  Clock,
  Award,
  ShieldCheck,
  Shuffle,
  Layers,
  Server,
  Rocket,
  ExternalLink,
  Lock,
  ChevronRight,
  PanelLeft,
  PanelLeftClose
} from 'lucide-react';
import { WalletConnect } from './WalletConnect';
import type { DetectedWallet } from '../lib/lace-wallet';
import { GradientBackground } from './ui/pipo';
import { ContractDeployerModal } from './ContractDeployerModal';
import { getActiveContractAddress } from '../utils/registry';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  walletConnected: boolean;
  walletAddress: string | null;
  shieldedAddress?: string | null;
  walletName: string;
  networkId?: string;
  detected1AMNetwork?: string;
  isNetworkAligned?: boolean;
  balance: string;
  shieldedBalance?: string;
  unshieldedBalance?: string;
  dustBalance?: string;
  isConnecting: boolean;
  error: string | null;
  proofServerUp?: boolean | null;
  dustReady?: boolean;
  latestBlockHeight?: number;
  detectedWallets?: DetectedWallet[];
  onOpenModal: () => void;
  onScan?: () => void;
  onConnect: (wallet?: unknown) => void;
  onDisconnect: () => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  activeTab,
  setActiveTab,
  walletConnected,
  walletAddress,
  shieldedAddress,
  walletName,
  networkId = 'preprod',
  detected1AMNetwork,
  isNetworkAligned = true,
  balance,
  shieldedBalance,
  unshieldedBalance,
  dustBalance,
  isConnecting,
  error,
  proofServerUp,
  dustReady,
  latestBlockHeight,
  detectedWallets = [],
  onOpenModal,
  onScan,
  onConnect,
  onDisconnect
}) => {
  const [deployerModalOpen, setDeployerModalOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const activeContract = getActiveContractAddress(networkId);
  const shortContract = `${activeContract.substring(0, 6)}…${activeContract.substring(activeContract.length - 4)}`;

  const navCategories = [
    {
      category: 'Core Trading Desk',
      items: [
        { id: 'overview', label: 'Terminal Overview', icon: LayoutDashboard },
        { id: 'strategy-builder', label: 'Strategy Synthesizer', icon: Cpu, badge: 'ZK-Risk' },
        { id: 'withdraw', label: 'Shielded Vault (vUSD)', icon: ArrowUpRight },
      ]
    },
    {
      category: 'Institutional Execution',
      items: [
        { id: 'dark-intent', label: 'Dark Intent (DIN)', icon: Layers, badge: 'Cross-Chain' },
        { id: 'zk-iceberg', label: 'ZK-Iceberg TWAP', icon: Shuffle, badge: 'Anti-MEV' },
        { id: 'alpha-marketplace', label: 'Proof of Alpha (PoA)', icon: Award, badge: 'Blind Copy' },
        { id: 'institutional-compliance', label: 'Compliance & Audit', icon: ShieldCheck, badge: 'ZK-KYC' },
      ]
    },
    {
      category: 'Analytics & Forensic Logs',
      items: [
        { id: 'market-insights', label: 'Market Insights', icon: LineChart },
        { id: 'portfolio', label: 'Portfolio Analytics', icon: PieChart },
        { id: 'trade-history', label: 'Settlement History', icon: History },
      ]
    }
  ];

  const allNavItems = [
    { id: 'landing', label: 'Landing Page' },
    ...navCategories.flatMap(c => c.items)
  ];

  return (
    <div className="min-h-screen relative text-zinc-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-200 bg-[#0C0C0C]">
      <GradientBackground />

      {/* Top Trading Terminal Header */}
      <header className="w-full sticky top-0 z-50 bg-[#0C0C0C]/85 backdrop-blur-xl border-b border-white/[0.08]">
        <div className="max-w-[1560px] mx-auto px-3 sm:px-6 h-14 flex items-center justify-between gap-3">
          
          {/* Brand + Sidebar Toggle + Network + Contract Status */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Sidebar Toggle in Top Header */}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/15 text-zinc-200 hover:text-white transition-colors cursor-pointer"
              title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-label="Toggle navigation sidebar"
            >
              <PanelLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveTab('landing')}
              className="flex items-center gap-2.5 group cursor-pointer text-left"
              title="Return to Studio Home"
            >
              <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/10 bg-[#111622] flex items-center justify-center shadow-xs">
                <img
                  src="/vogue-logo.svg"
                  alt="Vogue Logo"
                  className="w-5 h-5 object-contain group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-extrabold tracking-tight text-white font-mono">
                    VOGUE
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono tracking-widest hidden sm:inline">
                    /TERMINAL
                  </span>
                </div>
              </div>
            </button>

            {/* Network Pill */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#111622] border border-white/[0.08] text-[11px] font-mono">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-emerald-400 font-bold uppercase tracking-wider text-[10px]">
                {networkId}
              </span>
            </div>

            {/* On-Chain Contract Chip with Direct Explorer Link */}
            <a
              href={`https://${networkId}.midnightexplorer.com/contracts/${activeContract}`}
              target="_blank"
              rel="noreferrer"
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#111622] hover:bg-[#161D2C] border border-white/[0.08] hover:border-cyan-500/30 text-[11px] font-mono text-zinc-400 hover:text-cyan-300 transition-colors"
              title={`Active on-chain contract: ${activeContract}`}
            >
              <Lock className="w-3 h-3 text-cyan-400" />
              <span>Contract:</span>
              <span className="font-semibold text-zinc-200">{shortContract}</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
            </a>
          </div>

          {/* Center Telemetry: Block Height & Sponsored Gas */}
          <div className="hidden xl:flex items-center gap-4 text-xs font-mono text-zinc-400">
            {latestBlockHeight && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/[0.06]">
                <Blocks className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-zinc-500">BLOCK</span>
                <span className="text-zinc-200 font-semibold text-mono-num">
                  #{latestBlockHeight.toLocaleString()}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/[0.06] border border-emerald-500/20 text-emerald-400 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>ProofStation Sponsored (0 tDUST)</span>
            </div>
          </div>

          {/* Right Header Actions: Deployer + Wallet */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setDeployerModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111622] hover:bg-[#161D2C] border border-white/[0.08] hover:border-cyan-500/30 text-zinc-200 text-xs font-medium transition-all shadow-xs cursor-pointer"
              title="Midnight Contract Deployer & Health Inspector"
            >
              <Rocket className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Contract & Deploy</span>
            </button>

            <WalletConnect
              connected={walletConnected}
              address={walletAddress}
              shieldedAddress={shieldedAddress}
              walletName={walletName}
              networkId={networkId}
              detected1AMNetwork={detected1AMNetwork}
              isNetworkAligned={isNetworkAligned}
              balance={balance}
              shieldedBalance={shieldedBalance}
              unshieldedBalance={unshieldedBalance}
              isConnecting={isConnecting}
              error={error}
              proofServerUp={proofServerUp}
              dustReady={dustReady}
              detectedWallets={detectedWallets}
              onOpenModal={onOpenModal}
              onScan={onScan}
              onConnect={onConnect}
              onDisconnect={onDisconnect}
            />
          </div>
        </div>
      </header>

      {/* Mobile Horizontal Navigation Strip */}
      <div className="md:hidden w-full bg-[#0A0D14] border-b border-white/[0.08] px-3 py-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setActiveTab('landing')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium shrink-0 transition-all cursor-pointer ${
              activeTab === 'landing'
                ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                : 'text-zinc-400 hover:text-white bg-[#111622] border border-white/[0.06]'
            }`}
          >
            Studio
          </button>
          {navCategories.flatMap(c => c.items).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-semibold'
                    : 'text-zinc-400 hover:text-white bg-[#111622] border border-white/[0.06]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-zinc-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Terminal Grid with Sidebar */}
      <div className="w-full max-w-[1560px] mx-auto flex-1 flex overflow-hidden p-3 sm:p-5 gap-5 relative z-10">
        {/* Desktop Terminal Sidebar (Always Visible, Liquid Glass with high contrast) */}
        <aside
          className={`liquid-glass shrink-0 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-2xl border border-white/[0.12] ${
            isSidebarCollapsed
              ? 'w-16 min-w-[4rem] p-2.5 items-center'
              : 'w-64 min-w-[16rem] p-4'
          }`}
        >
          <div className="space-y-3 w-full">
            {/* Quick Home Switcher */}
            <div className="flex items-center justify-between gap-1.5 pb-2 border-b border-white/[0.08]">
              <button
                onClick={() => setActiveTab('landing')}
                className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'landing'
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-[inset_0_1px_1px_rgba(56,189,248,0.2)]'
                    : 'text-zinc-200 hover:text-white hover:bg-white/[0.06] border border-transparent'
                } ${isSidebarCollapsed ? 'justify-center !px-2' : ''}`}
                title="Studio Home"
              >
                <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                {!isSidebarCollapsed && <span>Studio Home</span>}
              </button>

              {!isSidebarCollapsed && (
                <button
                  onClick={() => setIsSidebarCollapsed(true)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                  title="Collapse sidebar"
                  aria-label="Collapse sidebar"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Categorized Navigation */}
            {navCategories.map((group, groupIdx) => (
              <div key={groupIdx} className="space-y-1 w-full">
                {!isSidebarCollapsed && (
                  <div className="px-3 pt-2 pb-1 text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-bold">
                    {group.category}
                  </div>
                )}
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      title={isSidebarCollapsed ? item.label : undefined}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                        isActive
                          ? 'bg-cyan-500/15 text-cyan-200 border border-cyan-500/30 shadow-[inset_0_1px_1px_rgba(56,189,248,0.25)] font-semibold'
                          : 'text-zinc-300 hover:text-white hover:bg-white/[0.06] border border-transparent'
                      } ${isSidebarCollapsed ? 'justify-center !px-2' : ''}`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-zinc-400'}`} />
                        {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                      </div>
                      {!isSidebarCollapsed && item.badge && (
                        <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 font-bold ${
                          isActive
                            ? 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/30'
                            : 'bg-white/[0.06] text-zinc-400 border border-white/10'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Sidebar Terminal Telemetry */}
          <div className="mt-4 pt-3 border-t border-white/[0.08] space-y-2.5 font-mono text-[11px] w-full">
            {!isSidebarCollapsed ? (
              <>
                <div className="p-3 bg-white/[0.03] backdrop-blur-md rounded-xl border border-white/[0.08] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">ZK Engine</span>
                    <span className="text-zinc-200 font-bold">Compact v0.5.2</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Circuits</span>
                    <span className="text-emerald-400 font-bold">8 Core Verified</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Proof Model</span>
                    <span className="text-cyan-400 font-bold">Client-Side ZK</span>
                  </div>
                </div>

                <button
                  onClick={() => setDeployerModalOpen(true)}
                  className="w-full py-2 px-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/15 text-zinc-200 hover:text-white text-[11px] font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <Rocket className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Manage Preprod Contract</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setDeployerModalOpen(true)}
                className="w-full py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/15 text-cyan-400 flex items-center justify-center transition-all cursor-pointer"
                title="Manage Preprod Contract"
              >
                <Rocket className="w-4 h-4" />
              </button>
            )}
          </div>
        </aside>

        {/* Main Content Viewport */}
        <main className="flex-1 overflow-y-auto min-w-0 space-y-6">
          {children}
        </main>
      </div>

      {/* Footer Ticker */}
      <footer className="bg-[#0C0C0C]/85 backdrop-blur-md border-t border-white/[0.08] py-2 px-4 sm:px-6 text-[11px] font-mono text-zinc-400 relative z-10">
        <div className="max-w-[1560px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1.5 text-zinc-200">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              <span className="font-bold tracking-tight">VOGUE TERMINAL</span>
            </div>
            <span className="text-zinc-700">|</span>
            {latestBlockHeight && (
              <span className="text-emerald-400 font-medium">
                BLOCK #{latestBlockHeight.toLocaleString()}
              </span>
            )}
            <span className="text-zinc-700">|</span>
            <span className="text-zinc-400">
              CONTRACT: <a href={`https://${networkId}.midnightexplorer.com/contracts/${activeContract}`} target="_blank" rel="noreferrer" className="text-zinc-300 hover:text-cyan-400 transition-colors underline underline-offset-2">{shortContract}</a>
            </span>
            <span className="text-zinc-700">|</span>
            <span>tNIGHT: <span className="text-zinc-200 font-bold">$1.00</span></span>
            <span className="text-zinc-700">|</span>
            <span>vUSD: <span className="text-zinc-200 font-bold">$1.00</span></span>
          </div>

          <button
            onClick={() => setDeployerModalOpen(true)}
            className="flex items-center gap-1.5 text-zinc-400 hover:text-cyan-400 transition-colors cursor-pointer text-left"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Midnight Preprod Testnet • 1AM Wallet Integration</span>
          </button>
        </div>
      </footer>

      <ContractDeployerModal
        isOpen={deployerModalOpen}
        onClose={() => setDeployerModalOpen(false)}
        networkId={networkId}
        walletConnected={walletConnected}
        walletAddress={walletAddress || undefined}
        onConnectWallet={onOpenModal}
      />
    </div>
  );
};

