import React from 'react';
import {
  ArrowRight,
  Shield,
  Lock,
  ExternalLink,
  Cpu,
  Layers,
  Shuffle,
  Award,
  ShieldCheck,
  Terminal,
  Blocks,
} from 'lucide-react';
import ShaderShowcase from './ui/hero';
import { LiquidGlassButton } from './ui/LiquidGlassButton';

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
  const deployedContract = '0xbe694ffc83d109ec7587e940a80aae0e7e75d1421cefc4936b593457b484e9e7';
  const shortContract = `${deployedContract.substring(0, 10)}…${deployedContract.substring(deployedContract.length - 8)}`;
  const explorerContractUrl = `https://preprod.midnightexplorer.com/contracts/${deployedContract}`;

  const circuits = [
    { name: 'commitStrategy', category: 'Core Trading', desc: 'Commits private risk bounds (max position %, stop-loss %, duration) without revealing parameters.' },
    { name: 'executeTrade', category: 'Core Trading', desc: 'Proves trade size, asset, and timestamp adhere strictly to committed risk parameters in Zero-Knowledge.' },
    { name: 'mintVaultBalance', category: 'Shielded Vault', desc: 'Converts public tNIGHT collateral into private USDC-equivalent shielded vault notes (vUSD).' },
    { name: 'burnVaultBalance', category: 'Shielded Vault', desc: 'Unshields private vault notes back to public tNIGHT collateral with zero address linkability.' },
    { name: 'unshieldWithdraw', category: 'Shielded Vault', desc: 'Authorizes cryptographic withdrawal of private balance notes back to verified wallet.' },
    { name: 'commitDarkIntent', category: 'Dark Intent (DIN)', desc: 'Locks escrowed vUSD with private limit price, min fill, and expiry bounds into Midnight state.' },
    { name: 'fulfillDarkIntent', category: 'Dark Intent (DIN)', desc: 'Atomically verifies external solver Cross-Chain State Proof (Cardano/Solana) and releases funds.' },
    { name: 'refundDarkIntent', category: 'Dark Intent (DIN)', desc: 'Guarantees automatic refund of escrowed collateral if external solver fails to fill before expiry.' },
  ];

  const handleAction = walletConnected ? onEnterDashboard : onConnectWallet;

  return (
    <div className="min-h-screen text-slate-100 font-sans selection:bg-white/20 selection:text-white bg-[#030508]">
      {/* SECTION 1: HERO (Dynamic Monochromatic WebGL Liquid Caustics & Transparent Liquid Glass Hero) */}
      <ShaderShowcase 
        onConnectWallet={onConnectWallet} 
        onEnterDashboard={onEnterDashboard} 
        walletConnected={walletConnected} 
        walletAddress={walletAddress} 
      >

        {/* SECTION 2: LIVE ON-CHAIN PROTOCOL TELEMETRY RIBBON (Liquid Glass Dock) */}
        <div className="px-4 sm:px-8 max-w-[1440px] mx-auto mb-20">
          <div className="liquid-glass p-6 sm:p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block font-semibold">
                  Verified Smart Contract
                </span>
                <a
                  href={explorerContractUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-mono font-bold text-white hover:text-zinc-300 flex items-center gap-1.5 transition-colors truncate"
                >
                  <span>{shortContract}</span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-70" />
                </a>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1.5 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Active on Midnight Preprod
                </span>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block font-semibold">
                  Proving Engine
                </span>
                <div className="text-xs font-mono font-bold text-white">Compact v0.5.2</div>
                <span className="text-[10px] text-zinc-400 font-mono">8 Core ZK Circuits Verified</span>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block font-semibold">
                  Execution Model
                </span>
                <div className="text-xs font-mono font-bold text-white">Client-Side Witness Enclave</div>
                <span className="text-[10px] text-zinc-400 font-mono">Zero Strategy Parameter Leakage</span>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block font-semibold">
                  Transaction Sponsorship
                </span>
                <div className="text-xs font-mono font-bold text-emerald-400">ProofStation Sponsored</div>
                <span className="text-[10px] text-zinc-400 font-mono">0 tDUST Gas Requirement</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: INTERACTIVE ZK EXECUTION ARCHITECTURE (Liquid Glass Cards) */}
        <section id="pipeline" className="py-16 sm:py-24 px-4 sm:px-8 max-w-[1440px] mx-auto">
          <div className="max-w-3xl mb-14">
            <div className="liquid-glass-pill px-3.5 py-1 text-[11px] font-mono text-zinc-300 uppercase tracking-widest mb-4 inline-flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
              <span>Cryptographic Execution Pipeline</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
              How Zero-Knowledge Execution Works in Vogue
            </h2>
            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-normal">
              Public mempools expose institutional strategies, stop-loss orders, and cross-chain volume to predatory sandwich bots. Vogue decouples cryptographic proof from underlying trade parameters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="liquid-glass p-6 sm:p-7 space-y-4 group">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-white font-extrabold tracking-wider">STEP 01</span>
                <Terminal className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">Natural Language Intent</h3>
              <p className="text-xs text-zinc-300 leading-relaxed font-normal">
                Trader formulates risk bounds or cross-chain limit parameters via natural language synthesis or quant terminal.
              </p>
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.1] font-mono text-[11px] text-zinc-300">
                <span className="text-zinc-500 font-bold block mb-1 uppercase tracking-wider">Local Client Bounds</span>
                Max 20% Pos • 8% SL • 30D Exp
              </div>
            </div>

            {/* Step 2 */}
            <div className="liquid-glass p-6 sm:p-7 space-y-4 group">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-white font-extrabold tracking-wider">STEP 02</span>
                <Lock className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">Shielded Witness Enclave</h3>
              <p className="text-xs text-zinc-300 leading-relaxed font-normal">
                Strategy secrets stay purely in local device RAM. Only cryptographic commitment hashes are written on-chain.
              </p>
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.1] font-mono text-[11px] text-zinc-200">
                <span className="text-zinc-500 font-bold block mb-1 uppercase tracking-wider">Witness Storage</span>
                Decrypted Strictly on Device
              </div>
            </div>

            {/* Step 3 */}
            <div className="liquid-glass p-6 sm:p-7 space-y-4 group">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-white font-extrabold tracking-wider">STEP 03</span>
                <Cpu className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">Zero-Knowledge Proving</h3>
              <p className="text-xs text-zinc-300 leading-relaxed font-normal">
                Compact circuits mathematically prove portfolio limits and risk compliance without revealing underlying parameters.
              </p>
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.1] font-mono text-[11px] text-zinc-200">
                <span className="text-zinc-500 font-bold block mb-1 uppercase tracking-wider">Prover Latency</span>
                &lt;850ms Local ZK Proof
              </div>
            </div>

            {/* Step 4 */}
            <div className="liquid-glass p-6 sm:p-7 space-y-4 group">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-white font-extrabold tracking-wider">STEP 04</span>
                <Blocks className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">Midnight Settlement</h3>
              <p className="text-xs text-zinc-300 leading-relaxed font-normal">
                Midnight Preprod ledger validates proof non-interactively and executes atomic balance note state transitions.
              </p>
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.1] font-mono text-[11px] text-emerald-400">
                <span className="text-zinc-500 font-bold block mb-1 uppercase tracking-wider">On-Chain State</span>
                Verifiable on Explorer
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: INSTITUTIONAL PROTOCOL PILLARS (Liquid Glass Panels) */}
        <section id="modules" className="py-16 sm:py-24 px-4 sm:px-8 max-w-[1440px] mx-auto">
          <div className="max-w-3xl mb-14">
            <div className="liquid-glass-pill px-3.5 py-1 text-[11px] font-mono text-zinc-300 uppercase tracking-widest mb-4 inline-flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
              <span>Enterprise Architecture</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
              Engineered for Institutional Execution
            </h2>
            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-normal">
              Four enterprise pillars solving the fundamental trilemma of on-chain trading: deep liquidity, zero information leakage, and regulatory compliance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
            {/* Module 1: DIN */}
            <div className="liquid-glass p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/20 flex items-center justify-center text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">Dark Intent Solver Network (DIN)</h3>
                    <span className="text-[11px] font-mono text-zinc-400">Cross-Chain RFQ with Bonded Solvers</span>
                  </div>
                </div>
                <span className="liquid-glass-pill px-2.5 py-0.5 text-[10px] font-mono text-zinc-400">
                  PILLAR 01
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal">
                Bridges Midnight's cryptographic privacy to deep external liquidity on Cardano (Minswap eUTxO), Solana (Jupiter / Raydium CLMM), and Ethereum. Intent parameters are locked inside Midnight, and external solvers compete in off-chain Dutch auctions to fill at optimal limit prices.
              </p>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] font-mono text-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Cross-Chain Verification</span>
                  <span className="text-white font-semibold">State Proofs</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Collateral Slashing SLA</span>
                  <span className="text-zinc-200 font-semibold">$100k Min Solver Bond</span>
                </div>
              </div>
            </div>

            {/* Module 2: Anti-MEV Iceberg */}
            <div className="liquid-glass p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/20 flex items-center justify-center text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]">
                    <Shuffle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">Anti-MEV ZK-Iceberg & TWAP</h3>
                    <span className="text-[11px] font-mono text-zinc-400">Randomized Temporal Micro-Slicing</span>
                  </div>
                </div>
                <span className="liquid-glass-pill px-2.5 py-0.5 text-[10px] font-mono text-zinc-400">
                  PILLAR 02
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal">
                Breaks institutional block trades into randomized, unlinkable micro-slices across non-linear time horizons (up to 48 hours). Eliminates predictable periodic intervals that toxic sandwich bots exploit, disguising high-volume orders as disjointed independent swaps.
              </p>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] font-mono text-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Sandwich Bot Protection</span>
                  <span className="text-white font-semibold">100% Anti-MEV</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Temporal Jitter</span>
                  <span className="text-zinc-200 font-semibold">Stochastic Poisson Slices</span>
                </div>
              </div>
            </div>

            {/* Module 3: Proof of Alpha */}
            <div className="liquid-glass p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/20 flex items-center justify-center text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">Proof of Alpha (PoA) Marketplace</h3>
                    <span className="text-[11px] font-mono text-zinc-400">Blind Copy-Trading & Verifiable Alpha</span>
                  </div>
                </div>
                <span className="liquid-glass-pill px-2.5 py-0.5 text-[10px] font-mono text-zinc-400">
                  PILLAR 03
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal">
                Quantitative analysts mathematically prove audited Sharpe ratios, maximum drawdowns, and net returns without exposing trade logic or proprietary code. Followers mirror signals proportionally with zero knowledge of strategy parameters.
              </p>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] font-mono text-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Performance Fee Model</span>
                  <span className="text-white font-semibold">High-Water Mark (HWM)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Quant IP Protection</span>
                  <span className="text-zinc-200 font-semibold">100% Shielded Logic</span>
                </div>
              </div>
            </div>

            {/* Module 4: Compliance & Viewing Keys */}
            <div className="liquid-glass p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/20 flex items-center justify-center text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">Institutional Compliance & Audit</h3>
                    <span className="text-[11px] font-mono text-zinc-400">Scoped Viewing Keys & Proof of Solvency</span>
                  </div>
                </div>
                <span className="liquid-glass-pill px-2.5 py-0.5 text-[10px] font-mono text-zinc-400">
                  PILLAR 04
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal">
                Solves the compliance catch-22 for regulated hedge funds and family offices. Grant time-locked, read-only viewing keys for specific audit scopes (NAV, trade logs, risk bounds) to accredited auditors and prove solvency ratio &ge; 100% in Zero-Knowledge.
              </p>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] font-mono text-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Regulatory Frameworks</span>
                  <span className="text-white font-semibold">SEC • CFTC • MiCA Ready</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Audit Scope Delegation</span>
                  <span className="text-zinc-200 font-semibold">4-Tier Bitmask Keys</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: VERIFIED SMART CONTRACT CIRCUITS (Liquid Glass Table) */}
        <section id="circuits" className="py-16 sm:py-24 px-4 sm:px-8 max-w-[1440px] mx-auto">
          <div className="max-w-3xl mb-12">
            <div className="liquid-glass-pill px-3.5 py-1 text-[11px] font-mono text-zinc-300 uppercase tracking-widest mb-4 inline-flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
              <span>On-Chain Circuit Registry</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
              8 Core Verified Circuits Running on Midnight Preprod
            </h2>
            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-normal">
              Every circuit has been compiled with Compact v0.5.2, verified on the Midnight Preprod Testnet, and deployed via the 1AM wallet in-app deployer.
            </p>
          </div>

          <div className="liquid-glass overflow-hidden p-2 sm:p-4 mb-8">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead className="text-zinc-400 border-b border-white/[0.1] text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Circuit Name</th>
                    <th className="py-3 px-4">Domain</th>
                    <th className="py-3 px-4 hidden md:table-cell">Cryptographic Guarantee</th>
                    <th className="py-3 px-4 text-right">Preprod Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06] text-zinc-200">
                  {circuits.map((c, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.04] transition-colors">
                      <td className="py-4 px-4 font-bold text-white">
                        {c.name}
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-white/[0.04] text-[10px] text-zinc-300 border border-white/[0.1]">
                          {c.category}
                        </span>
                      </td>
                      <td className="py-4 px-4 hidden md:table-cell text-zinc-300 font-sans text-xs">
                        {c.desc}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] border border-emerald-500/20 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          VERIFIED
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Liquid Glass Verified Contract Banner */}
          <div className="liquid-glass p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/20 flex items-center justify-center text-white shrink-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]">
                <Shield className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-sm font-bold text-white block">Official Midnight Preprod Contract</span>
                <span className="text-xs font-mono text-zinc-300 break-all">{deployedContract}</span>
              </div>
            </div>

            <LiquidGlassButton
              href={explorerContractUrl}
              target="_blank"
              rel="noreferrer"
              variant="primary"
              icon={<ExternalLink className="w-4 h-4" />}
            >
              <span>Inspect on Explorer</span>
            </LiquidGlassButton>
          </div>
        </section>

        {/* SECTION 6: INSTITUTIONAL CALL TO ACTION */}
        <section className="py-16 px-4 sm:px-8 max-w-[1440px] mx-auto mb-16">
          <div className="liquid-glass p-10 sm:p-14 text-center space-y-6">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Ready to Execute with Zero Information Leakage?
            </h2>
            <p className="text-sm sm:text-base text-zinc-300 max-w-xl mx-auto leading-relaxed font-normal">
              Connect your 1AM wallet on Midnight Preprod and experience institutional-grade privacy with sub-second zero-knowledge proof generation.
            </p>
            <div className="pt-2">
              <LiquidGlassButton onClick={handleAction} variant="primary">
                <span>{walletConnected ? 'Enter Trading Terminal' : 'Launch Vogue Terminal'}</span>
                <ArrowRight className="w-4 h-4" />
              </LiquidGlassButton>
            </div>
          </div>
        </section>

        {/* SECTION 7: INSTITUTIONAL FOOTER */}
        <footer className="border-t border-white/[0.08] py-12 px-4 sm:px-8 text-xs font-mono text-zinc-400">
          <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img src="/vogue-logo.svg" alt="Vogue" className="w-6 h-6 rounded-md object-contain bg-white/[0.05] p-1 border border-white/10" />
              <span className="font-extrabold text-white text-sm">VOGUE PROTOCOL</span>
              <span className="text-zinc-600">|</span>
              <span className="text-zinc-400">Midnight Preprod Institutional Execution Layer</span>
            </div>

            <div className="flex items-center gap-6 text-zinc-400">
              <a href="https://midnight.network" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                Midnight Network
              </a>
              <a href={explorerContractUrl} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                Contract Explorer
              </a>
              <a href="https://x.com/Voguentwrk" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                X / Twitter
              </a>
              <button
                onClick={handleAction}
                className="text-white hover:text-zinc-300 font-bold cursor-pointer underline underline-offset-4"
              >
                {walletConnected ? 'Launch Terminal →' : 'Connect 1AM Wallet →'}
              </button>
            </div>
          </div>
        </footer>

      </ShaderShowcase>
    </div>
  );
};
