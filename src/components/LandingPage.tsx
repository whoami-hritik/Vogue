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
          <h2 className="text-[clamp(1.75rem,7vw,4.2rem)] sm:text-[clamp(2.5rem,5vw,4.2rem)] font-medium leading-[1.08] tracking-[-0.03em] text-gray-900 px-5 sm:px-8 lg:px-12 mb-10 sm:mb-14 lg:mb-16 max-w-5xl">
            Unleash the full power of <br className="hidden md:block"/> Vogue capabilities.
          </h2>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 lg:gap-7 px-5 sm:px-8 lg:px-12">
            
            {/* Card 1: Shielded Strategy Builder */}
            <div className="flex flex-col bg-white border border-gray-200/80 rounded-3xl p-8 space-y-6 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 font-bold text-gray-900">
                  <div className="p-2 bg-orange-100 rounded-lg text-orange-600"><Layers className="w-6 h-6" /></div>
                  <span className="text-xl">Shielded Strategy Builder</span>
                </div>
                <span className="text-[10px] bg-gray-100 text-gray-800 px-3 py-1 rounded-full font-bold tracking-wider">MODULE 01</span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Synthesize high-frequency parameters from natural language prompts. Strategy hashes are committed to Midnight's ledger while threshold witnesses remain decrypted strictly on your device.
              </p>
              
              <div className="flex-1 mt-4 p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Cpu className="w-24 h-24" />
                </div>
                <div className="space-y-3 relative z-10">
                  <div className="flex items-center justify-between text-xs font-mono border-b border-gray-200 pb-2">
                    <span className="text-gray-500">Target Asset</span>
                    <span className="font-bold text-gray-900">BTC/vUSD</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono border-b border-gray-200 pb-2">
                    <span className="text-gray-500">Commitment Hash</span>
                    <span className="font-bold text-orange-600">0x811c9dc5…d9</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-gray-500">Witness Storage</span>
                    <span className="font-bold text-emerald-600 flex items-center gap-1"><Lock className="w-3 h-3"/> Local Device</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: 1AM Wallet & Midnight Explorer */}
            <div className="flex flex-col bg-white border border-gray-200/80 rounded-3xl p-8 space-y-6 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 font-bold text-gray-900">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><Zap className="w-6 h-6" /></div>
                  <span className="text-xl">1AM Wallet & ProofStation</span>
                </div>
                <span className="text-[10px] bg-gray-100 text-gray-800 px-3 py-1 rounded-full font-bold tracking-wider">MODULE 02</span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Direct integration with Midnight's 1AM wallet. Execute zero-gas sponsored transactions via ProofStation and track real-time confirmations on the 1AM Explorer.
              </p>
              
              <div className="flex-1 mt-4 p-5 bg-gradient-to-br from-[#0B0F19] to-[#1A2333] rounded-2xl border border-gray-800 text-gray-300 relative">
                <div className="space-y-4 font-mono text-xs">
                  <div className="flex flex-col gap-1">
                    <span className="text-gray-500">Status</span>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span className="text-emerald-400">Connected to Preprod</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-gray-500">Gas Model</span>
                    <span className="text-blue-400 font-bold">ProofStation Sponsored (0 tDUST)</span>
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-700/50">
                    <a href="https://explorer.1am.xyz?network=preprod" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white">
                      View on Explorer <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Shielded Vault (vUSD) */}
            <div className="flex flex-col bg-white border border-gray-200/80 rounded-3xl p-8 space-y-6 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 font-bold text-gray-900">
                  <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600"><Shield className="w-6 h-6" /></div>
                  <span className="text-xl">Shielded Vault (vUSD)</span>
                </div>
                <span className="text-[10px] bg-gray-100 text-gray-800 px-3 py-1 rounded-full font-bold tracking-wider">MODULE 03</span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Convert public tNIGHT collateral into private USDC-equivalent vault notes. Deposit, trade, and withdraw without linking your public wallet address to trading history.
              </p>
              
              <div className="flex-1 mt-4 p-5 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100/50">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-gray-700">Vault Balance</span>
                  <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded font-bold">Hidden</span>
                </div>
                <div className="text-3xl font-black text-gray-900 mb-4 font-mono tracking-tight">
                  $**.** <span className="text-lg text-gray-500 font-medium">vUSD</span>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 py-2 bg-emerald-600 text-white text-center text-xs font-bold rounded-lg cursor-pointer hover:bg-emerald-700 transition-colors">Shield</div>
                  <div className="flex-1 py-2 bg-white border border-gray-200 text-gray-700 text-center text-xs font-bold rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">Unshield</div>
                </div>
              </div>
            </div>

            {/* Card 4: Gemini Market Intelligence */}
            <div className="flex flex-col bg-white border border-gray-200/80 rounded-3xl p-8 space-y-6 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 font-bold text-gray-900">
                  <div className="p-2 bg-purple-100 rounded-lg text-purple-600"><Activity className="w-6 h-6" /></div>
                  <span className="text-xl">Gemini Intelligence</span>
                </div>
                <span className="text-[10px] bg-gray-100 text-gray-800 px-3 py-1 rounded-full font-bold tracking-wider">MODULE 04</span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Live cryptocurrency price feeds and automated technical analysis generated by Gemini 2.5 Flash with custom prompt queries and risk metrics.
              </p>
              
              <div className="flex-1 mt-4 p-5 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border border-purple-100/50">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2 bg-white/60 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-xs font-bold">BTC</div>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-gray-900">Strong Buy Signal</div>
                      <div className="text-[10px] text-gray-500">RSI oversold • MACD crossover</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-white/60 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">ETH</div>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-gray-900">Hold Position</div>
                      <div className="text-[10px] text-gray-500">Approaching resistance at $3,500</div>
                    </div>
                  </div>
                </div>
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
            <img src="/vogue-logo.svg" alt="Vogue Trade" className="w-6 h-6 rounded-full object-cover shadow-2xs" />
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
