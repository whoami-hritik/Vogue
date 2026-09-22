import React from 'react';
import {
  ArrowRight,
  Shield,
  Lock,
  ExternalLink,
  Cpu,
  Zap,
  CheckCircle2,
  Layers,
  Shuffle,
  Award,
  ShieldCheck,
  Terminal,
  Activity,
  Blocks,
  Key
} from 'lucide-react';
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
  const deployedContract = '0xbe694ffc83d109ec7587e940a80aae0e7e75d1421cefc4936b593457b484e9e7';
  const shortContract = `${deployedContract.substring(0, 10)}…${deployedContract.substring(deployedContract.length - 8)}`;

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

  return (
    <div className="min-h-screen text-zinc-100 font-sans selection:bg-cyan-500/20 selection:text-cyan-200 bg-[#07090E]">
      {/* SECTION 1: HERO (with ambient shader background) */}
      <ShaderShowcase 
        onConnectWallet={onConnectWallet} 
        onEnterDashboard={onEnterDashboard} 
        walletConnected={walletConnected} 
        walletAddress={walletAddress} 
      >

        {/* SECTION 2: LIVE ON-CHAIN PROTOCOL TELEMETRY RIBBON */}
        <section className="border-y border-white/[0.08] bg-[#0A0D14]/90 backdrop-blur-md py-6 px-4 sm:px-8">
          <div className="max-w-[1440px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">Verified Smart Contract</span>
              <a
                href={`https://preprod.midnightexplorer.com/contracts/${deployedContract}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-mono font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors truncate"
              >
                <span>{shortContract}</span>
                <ExternalLink className="w-3 h-3 shrink-0 opacity-70" />
              </a>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Active on Midnight Preprod
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">Proving Engine</span>
              <div className="text-xs font-mono font-semibold text-zinc-200">Compact v0.5.2</div>
              <span className="text-[10px] text-zinc-400 font-mono">8 Core ZK Circuits Verified</span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">Execution Model</span>
              <div className="text-xs font-mono font-semibold text-zinc-200">Client-Side Witness Enclave</div>
              <span className="text-[10px] text-zinc-400 font-mono">Zero Strategy Parameter Leakage</span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">Transaction Sponsorship</span>
              <div className="text-xs font-mono font-semibold text-emerald-400">ProofStation Sponsored</div>
              <span className="text-[10px] text-zinc-400 font-mono">0 tDUST Gas Requirement</span>
            </div>
          </div>
        </section>

        {/* SECTION 3: INTERACTIVE ZK EXECUTION ARCHITECTURE */}
        <section id="pipeline" className="py-20 sm:py-28 px-4 sm:px-8 max-w-[1440px] mx-auto">
          <div className="max-w-3xl mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono text-cyan-400 uppercase tracking-widest mb-4">
              Cryptographic Execution Pipeline
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-4">
              How Zero-Knowledge Execution Works in Vogue
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
              Standard blockchains broadcast entire order books, stop-loss triggers, and trading intentions to public mempools, exposing traders to toxic MEV sandwiches and front-running. Vogue decouples proof from data.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {/* Step 1 */}
            <div className="bg-[#0E131E] border border-white/[0.08] rounded-xl p-6 space-y-4 hover:border-cyan-500/30 transition-all group">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-cyan-400 font-bold">STEP 01</span>
                <Terminal className="w-4 h-4 text-zinc-500 group-hover:text-cyan-400 transition-colors" />
              </div>
              <h3 className="text-base font-bold text-white">Natural Language Intent</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Trader formulates strategy risk bounds or cross-chain swap limit parameters in natural language or programmatic prompt.
              </p>
              <div className="p-3 bg-[#080B10] rounded-lg border border-white/[0.06] font-mono text-[11px] text-zinc-400">
                <span className="text-zinc-500 font-bold block mb-1">LOCAL SYNTHESIS</span>
                Max 20% Pos • 8% SL • 30D Exp
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-[#0E131E] border border-white/[0.08] rounded-xl p-6 space-y-4 hover:border-cyan-500/30 transition-all group">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-cyan-400 font-bold">STEP 02</span>
                <Lock className="w-4 h-4 text-zinc-500 group-hover:text-cyan-400 transition-colors" />
              </div>
              <h3 className="text-base font-bold text-white">Shielded Witness Generation</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Secret parameters remain in local memory. Only the cryptographic commitment hash is emitted to the Midnight ledger.
              </p>
              <div className="p-3 bg-[#080B10] rounded-lg border border-white/[0.06] font-mono text-[11px] text-emerald-400">
                <span className="text-zinc-500 font-bold block mb-1">WITNESS STORAGE</span>
                Decrypted Strictly on Device
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-[#0E131E] border border-white/[0.08] rounded-xl p-6 space-y-4 hover:border-cyan-500/30 transition-all group">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-cyan-400 font-bold">STEP 03</span>
                <Cpu className="w-4 h-4 text-zinc-500 group-hover:text-cyan-400 transition-colors" />
              </div>
              <h3 className="text-base font-bold text-white">Zero-Knowledge Proving</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Client-side ZK prover executes Compact circuits, proving that the trade satisfies risk and portfolio limits without disclosing values.
              </p>
              <div className="p-3 bg-[#080B10] rounded-lg border border-white/[0.06] font-mono text-[11px] text-cyan-300">
                <span className="text-zinc-500 font-bold block mb-1">PROVER LATENCY</span>
                &lt;850ms Deterministic Proof
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-[#0E131E] border border-white/[0.08] rounded-xl p-6 space-y-4 hover:border-cyan-500/30 transition-all group">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-cyan-400 font-bold">STEP 04</span>
                <Blocks className="w-4 h-4 text-zinc-500 group-hover:text-cyan-400 transition-colors" />
              </div>
              <h3 className="text-base font-bold text-white">On-Chain Settlement</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Midnight Preprod ledger validates proof non-interactively and executes atomic balance note state transitions.
              </p>
              <div className="p-3 bg-[#080B10] rounded-lg border border-white/[0.06] font-mono text-[11px] text-emerald-400">
                <span className="text-zinc-500 font-bold block mb-1">ON-CHAIN STATE</span>
                100% Verifiable on Explorer
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: INSTITUTIONAL PROTOCOL MODULES */}
        <section id="modules" className="py-20 sm:py-28 px-4 sm:px-8 border-t border-white/[0.08] bg-[#090C12]">
          <div className="max-w-[1440px] mx-auto">
            <div className="max-w-3xl mb-14">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono text-cyan-400 uppercase tracking-widest mb-4">
                Enterprise Capabilities
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-4">
                Architected for Institutional Execution
              </h2>
              <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
                Four enterprise-grade modules solving the fundamental trilemma of on-chain trading: deep liquidity, zero information leakage, and regulatory auditability.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Module 1: DIN */}
              <div className="bg-[#0E131E] border border-white/[0.08] hover:border-cyan-500/30 rounded-xl p-7 space-y-5 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-cyan-500/10 rounded-lg text-cyan-400 border border-cyan-500/20">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Dark Intent Solver Network (DIN)</h3>
                      <span className="text-[11px] font-mono text-zinc-500">Cross-Chain RFQ with Bonded Solvers</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-zinc-400 border border-white/[0.08]">
                    MODULE 01
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Bridges Midnight's cryptographic privacy to deep external liquidity on Cardano (Minswap eUTxO), Solana (Jupiter / Raydium CLMM), and Ethereum. Intent parameters are locked inside Midnight, and external solvers compete in off-chain Dutch auctions to fill at optimal limit prices.
                </p>
                <div className="p-4 bg-[#080B10] rounded-lg border border-white/[0.06] font-mono text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Atomic Cross-Chain Verification</span>
                    <span className="text-emerald-400 font-semibold">State Proofs</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Collateral Sashing SLA</span>
                    <span className="text-rose-400 font-semibold">$100k Min Solver Bond</span>
                  </div>
                </div>
              </div>

              {/* Module 2: Anti-MEV Iceberg */}
              <div className="bg-[#0E131E] border border-white/[0.08] hover:border-cyan-500/30 rounded-xl p-7 space-y-5 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-sky-500/10 rounded-lg text-sky-400 border border-sky-500/20">
                      <Shuffle className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Anti-MEV ZK-Iceberg & TWAP</h3>
                      <span className="text-[11px] font-mono text-zinc-500">Randomized Temporal Micro-Slicing</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-zinc-400 border border-white/[0.08]">
                    MODULE 02
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Breaks institutional block trades into randomized, unlinkable micro-slices across non-linear time horizons (up to 48 hours). Eliminates predictable periodic intervals that toxic sandwich bots exploit, disguising high-volume orders as disjointed independent swaps.
                </p>
                <div className="p-4 bg-[#080B10] rounded-lg border border-white/[0.06] font-mono text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Sandwich Bot Protection</span>
                    <span className="text-emerald-400 font-semibold">100% Anti-MEV</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Temporal Jitter</span>
                    <span className="text-sky-300 font-semibold">Stochastic Poisson Slices</span>
                  </div>
                </div>
              </div>

              {/* Module 3: Proof of Alpha */}
              <div className="bg-[#0E131E] border border-white/[0.08] hover:border-cyan-500/30 rounded-xl p-7 space-y-5 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Proof of Alpha (PoA) Marketplace</h3>
                      <span className="text-[11px] font-mono text-zinc-500">Blind Copy-Trading & Verifiable Alpha</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-zinc-400 border border-white/[0.08]">
                    MODULE 03
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Quantitative analysts mathematically prove audited Sharpe ratios, maximum drawdowns, and net returns without exposing trade logic or underlying code. Followers mirror signals proportionally with zero knowledge of strategy parameters.
                </p>
                <div className="p-4 bg-[#080B10] rounded-lg border border-white/[0.06] font-mono text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Performance Fee Settlement</span>
                    <span className="text-emerald-400 font-semibold">High-Water Mark (HWM)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">IP Protection</span>
                    <span className="text-zinc-300 font-semibold">100% Shielded Quant Logic</span>
                  </div>
                </div>
              </div>

              {/* Module 4: Compliance & Viewing Keys */}
              <div className="bg-[#0E131E] border border-white/[0.08] hover:border-cyan-500/30 rounded-xl p-7 space-y-5 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-500/10 rounded-lg text-indigo-400 border border-indigo-500/20">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Institutional Compliance & Audit</h3>
                      <span className="text-[11px] font-mono text-zinc-500">Scoped Viewing Keys & Proof of Solvency</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-zinc-400 border border-white/[0.08]">
                    MODULE 04
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Solves the compliance catch-22 for regulated hedge funds and family offices. Grant time-locked, read-only viewing keys for specific audit scopes (NAV, trade logs, risk bounds) to accredited auditors (Deloitte, EY) and prove solvency ratio &ge; 100% in Zero-Knowledge.
                </p>
                <div className="p-4 bg-[#080B10] rounded-lg border border-white/[0.06] font-mono text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Regulatory Frameworks</span>
                    <span className="text-zinc-300 font-semibold">SEC • CFTC • MiCA Ready</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Audit Scope Delegation</span>
                    <span className="text-indigo-400 font-semibold">4-Tier Granular Bitmask</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: VERIFIED SMART CONTRACT CIRCUITS */}
        <section id="circuits" className="py-20 sm:py-28 px-4 sm:px-8 border-t border-white/[0.08] max-w-[1440px] mx-auto">
          <div className="max-w-3xl mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono text-cyan-400 uppercase tracking-widest mb-4">
              On-Chain Circuit Registry
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-4">
              8 Core Verified Circuits Running on Midnight Preprod
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
              Every circuit has been compiled with Compact v0.5.2, verified on the Midnight Preprod Testnet, and deployed via the 1AM wallet in-app deployer.
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-white/[0.08] bg-[#0D111A]">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-[#111622] text-zinc-400 border-b border-white/[0.08] text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Circuit Name</th>
                  <th className="py-3 px-4">Domain</th>
                  <th className="py-3 px-4 hidden md:table-cell">Cryptographic Guarantee</th>
                  <th className="py-3 px-4 text-right">Preprod Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] text-zinc-300">
                {circuits.map((c, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-cyan-400">
                      {c.name}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-white/[0.04] text-[10px] text-zinc-400 border border-white/[0.06]">
                        {c.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 hidden md:table-cell text-zinc-400 font-sans text-xs">
                      {c.desc}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[11px] border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        LIVE
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-xl bg-[#0E131E] border border-white/[0.08]">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400 border border-cyan-500/20">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Official Midnight Preprod Contract</span>
                <span className="text-xs font-mono text-zinc-400">{deployedContract}</span>
              </div>
            </div>
            <a
              href={`https://preprod.midnightexplorer.com/contracts/${deployedContract}`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs font-mono flex items-center gap-2 transition-colors cursor-pointer"
            >
              <span>Inspect on Explorer</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </section>

        {/* SECTION 6: INSTITUTIONAL FOOTER */}
        <footer className="border-t border-white/[0.08] bg-[#07090E] py-12 px-4 sm:px-8 text-xs font-mono text-zinc-400">
          <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img src="/vogue-logo.svg" alt="Vogue" className="w-6 h-6 rounded-md object-contain bg-[#111622] p-1 border border-white/10" />
              <span className="font-extrabold text-white text-sm">VOGUE PROTOCOL</span>
              <span className="text-zinc-600">|</span>
              <span className="text-zinc-400">Midnight Preprod Institutional Execution Layer</span>
            </div>

            <div className="flex items-center gap-6 text-zinc-400">
              <a href="https://midnight.network" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                Midnight Network
              </a>
              <a href={`https://preprod.midnightexplorer.com/contracts/${deployedContract}`} target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition-colors">
                Contract Explorer
              </a>
              <a href="https://x.com/Voguentwrk" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                X / Twitter
              </a>
              <button
                onClick={walletConnected ? onEnterDashboard : onConnectWallet}
                className="text-cyan-400 hover:text-cyan-300 font-bold cursor-pointer underline underline-offset-4"
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
