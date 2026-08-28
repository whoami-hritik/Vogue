import React, { useState, useEffect } from 'react';
import { Clock, ArrowRight, Menu, X, Shield, Lock, ExternalLink, Cpu, Activity, Zap, CheckCircle2, ChevronRight, Layers } from 'lucide-react';
import ShaderShowcase from './ui/hero';

interface LandingPageProps {
  onConnectWallet: () => void;
  onEnterDashboard: () => void;
  walletConnected: boolean;
  walletAddress: string | null;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onConnectWallet,
  onEnterDashboard,
  walletConnected,
  walletAddress,
}) => {
  const [londonTime, setLondonTime] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Live London Time (HH:MM format)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeString = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/London',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(now);
      setLondonTime(timeString);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#EFEFEF] text-gray-900 font-sans selection:bg-orange-500 selection:text-white">
      {/* ========================================================================= */}
      {/* SECTION 1: HERO (Shader Showcase)                                          */}
      {/* ========================================================================= */}
      <ShaderShowcase 
        onConnectWallet={onConnectWallet} 
        onEnterDashboard={onEnterDashboard} 
        walletConnected={walletConnected} 
        walletAddress={walletAddress} 
      />

      {/* ========================================================================= */}
      {/* SECTION 2: ARCHITECTURE (White background)                                */}
      {/* ========================================================================= */}
      <section id="architecture" className="bg-white pt-16 sm:pt-20 lg:pt-32 pb-16 sm:pb-20 lg:pb-28 overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
          {/* Badge Row */}
          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gray-900 text-white text-[11px] sm:text-[12px] font-semibold flex items-center justify-center">
              1
            </div>
            <div className="text-[12px] sm:text-[13px] font-medium border border-gray-200 rounded-full px-3 sm:px-4 py-1 sm:py-1.5 text-gray-900">
              The Vogue ZK Architecture
            </div>
          </div>

          {/* Heading h2 */}
          <h2 className="text-[clamp(1.5rem,4vw,3.2rem)] font-medium leading-[1.12] tracking-[-0.02em] text-gray-900 mb-12 sm:mb-16 lg:mb-20 max-w-4xl">
            Confidential strategy execution, <br className="hidden sm:block" />
            mathematically proven on-chain.
          </h2>

          {/* 3 Pillar Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {/* Pillar 1 */}
            <div className="bg-[#F9F9F9] border border-gray-200/80 rounded-2xl p-6 sm:p-8 space-y-4 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-xs">
                <Cpu className="w-5 h-5 text-orange-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Client-Side AI Synthesis</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
                Gemini 2.5 Flash compiles natural language trading logic into local cryptographic parameters without exposing your alpha to external oracles or RPC nodes.
              </p>
              <div className="pt-2">
                <span className="text-[11px] font-semibold text-gray-900 bg-white border border-gray-200 px-2.5 py-1 rounded-full">
                  Zero Prompt Exposure
                </span>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="bg-[#F9F9F9] border border-gray-200/80 rounded-2xl p-6 sm:p-8 space-y-4 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-xs">
                <Shield className="w-5 h-5 text-orange-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Compact ZK Smart Contracts</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
                Dual-shielded state machine running natively on Midnight. Enforces risk rules and executes trades via <code className="text-gray-900 font-semibold">commitStrategy</code> and <code className="text-gray-900 font-semibold">executeTrade</code>.
              </p>
              <div className="pt-2">
                <span className="text-[11px] font-semibold text-gray-900 bg-white border border-gray-200 px-2.5 py-1 rounded-full">
                  Midnight Compact v0.24
                </span>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="bg-[#F9F9F9] border border-gray-200/80 rounded-2xl p-6 sm:p-8 space-y-4 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-xs">
                <Lock className="w-5 h-5 text-orange-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">EZKL Verifiable Risk Boundary</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
                Client-side halo2 zero-knowledge ML proofs ensure every trade respects strict volatility and drawdown limits before submitting transactions to the wallet.
              </p>
              <div className="pt-2">
                <span className="text-[11px] font-semibold text-gray-900 bg-white border border-gray-200 px-2.5 py-1 rounded-full">
                  ZK-ML Proof Verification
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3: LIVE MODULES (Light gray background)                           */}
      {/* ========================================================================= */}
      <section id="modules" className="bg-[#F5F5F5] pt-16 sm:pt-20 lg:pt-28 pb-16 sm:pb-20 lg:pb-28">
        <div className="max-w-[1440px] mx-auto">
          {/* Badge Row */}
          <div className="px-5 sm:px-8 lg:px-12 flex items-center gap-3 mb-6 sm:mb-8">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gray-900 text-white text-[11px] sm:text-[12px] font-semibold flex items-center justify-center">
              2
            </div>
            <div className="text-[12px] sm:text-[13px] font-medium border border-gray-300 rounded-full px-3 sm:px-4 py-1 sm:py-1.5 text-gray-900">
              Live Midnight Modules
            </div>
          </div>

          {/* Heading h2 */}
          <h2 className="text-[clamp(1.75rem,7vw,4.2rem)] sm:text-[clamp(2.5rem,5vw,4.2rem)] font-medium leading-[1.08] tracking-[-0.03em] text-gray-900 px-5 sm:px-8 lg:px-12 mb-10 sm:mb-14 lg:mb-16">
            Protocol capabilities
          </h2>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 lg:gap-7 px-5 sm:px-8 lg:px-12">
            {/* Card 1: Shielded Strategy Builder */}
            <div className="flex flex-col bg-white border border-gray-200/80 rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-gray-900">
                  <Layers className="w-5 h-5 text-orange-500" />
                  <span>Shielded Strategy Builder</span>
                </div>
                <span className="text-[10px] bg-gray-100 text-gray-800 px-2.5 py-0.5 rounded-full font-bold">MODULE 01</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
                Synthesize high-frequency parameters from natural language prompts. Strategy hashes are committed to Midnight's ledger while threshold witnesses remain decrypted strictly on your device.
              </p>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-xs font-mono text-gray-700 space-y-1">
                <div>Commitment Hash: <span className="text-orange-600 font-bold">0x811c9dc5…d9</span></div>
                <div>Witness Storage: <span className="text-emerald-700 font-bold">Client-Side Encrypted</span></div>
              </div>
            </div>

            {/* Card 2: 1AM Wallet & Midnight Explorer */}
            <div className="flex flex-col bg-white border border-gray-200/80 rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-gray-900">
                  <Zap className="w-5 h-5 text-orange-500" />
                  <span>1AM Wallet & ProofStation</span>
                </div>
                <span className="text-[10px] bg-gray-100 text-gray-800 px-2.5 py-0.5 rounded-full font-bold">MODULE 02</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
                Direct integration with Midnight's 1AM wallet. Execute zero-gas sponsored transactions via ProofStation and track real-time confirmations on <a href="https://explorer.1am.xyz?network=preprod" target="_blank" rel="noreferrer" className="text-orange-600 underline font-medium">1AM Preprod & Preview Explorer</a>.
              </p>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-xs font-mono text-gray-700 space-y-1">
                <div>Gas Model: <span className="text-emerald-700 font-bold">ProofStation Sponsored</span></div>
                <div>Explorer Link: <span className="text-orange-600 font-bold">explorer.1am.xyz/tx/…</span></div>
              </div>
            </div>

            {/* Card 3: Shielded Vault (vUSD) */}
            <div className="flex flex-col bg-white border border-gray-200/80 rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-gray-900">
                  <Shield className="w-5 h-5 text-orange-500" />
                  <span>Shielded Vault (vUSD)</span>
                </div>
                <span className="text-[10px] bg-gray-100 text-gray-800 px-2.5 py-0.5 rounded-full font-bold">MODULE 03</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
                Convert public tNIGHT collateral into private USDC-equivalent vault notes. Deposit, trade, and withdraw without linking your public wallet address to trading history.
              </p>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-xs font-mono text-gray-700 space-y-1">
                <div>Circuits: <span className="text-gray-900 font-bold">mintVaultBalance • burnVaultBalance</span></div>
                <div>Privacy Layer: <span className="text-emerald-700 font-bold">Zero Address Linkability</span></div>
              </div>
            </div>

            {/* Card 4: Gemini Market Intelligence */}
            <div className="flex flex-col bg-white border border-gray-200/80 rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-gray-900">
                  <Activity className="w-5 h-5 text-orange-500" />
                  <span>Gemini Technical Signals</span>
                </div>
                <span className="text-[10px] bg-gray-100 text-gray-800 px-2.5 py-0.5 rounded-full font-bold">MODULE 04</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
                Live cryptocurrency price feeds and automated technical analysis generated by Gemini 2.5 Flash with custom prompt queries and risk metrics.
              </p>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-xs font-mono text-gray-700 space-y-1">
                <div>Live Feeds: <span className="text-gray-900 font-bold">ADA • BTC • ETH • SOL • tNIGHT</span></div>
                <div>Model: <span className="text-orange-600 font-bold">Gemini 2.5 Flash</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer minimal branding bar */}
      <footer className="bg-white border-t border-gray-200 py-8 px-5 sm:px-8 lg:px-12 text-xs text-gray-500 font-sans">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img src="/vogue-logo.png" alt="Vogue Trade" className="w-6 h-6 rounded-full object-cover shadow-2xs" />
            <span className="font-bold text-gray-900">VOGUE TRADE</span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-600 font-medium">Private moves. Public proof.</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="https://explorer.1am.xyz?network=preprod" target="_blank" rel="noreferrer" className="text-gray-600 hover:text-gray-900 transition-colors">
              1AM Explorer
            </a>
            <a href="https://faucet.preview.midnight.network" target="_blank" rel="noreferrer" className="text-gray-600 hover:text-gray-900 transition-colors">
              Midnight Faucets
            </a>
            <button
              onClick={walletConnected ? onEnterDashboard : onConnectWallet}
              className="text-orange-600 hover:text-orange-700 font-bold underline cursor-pointer"
            >
              {walletConnected ? 'Launch Dashboard →' : 'Connect 1AM Wallet →'}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
