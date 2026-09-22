import React, { useEffect, useRef, useState } from "react"
import { MeshGradient, PulsingBorder } from "@paper-design/shaders-react"
import { motion } from "framer-motion"
import { ArrowRight, Shield } from "lucide-react"

interface ShaderShowcaseProps {
  onConnectWallet: () => void;
  onEnterDashboard: () => void;
  walletConnected: boolean;
  walletAddress: string | null;
  children?: React.ReactNode;
}

export default function ShaderShowcase({
  onConnectWallet,
  onEnterDashboard,
  walletConnected,
  walletAddress,
  children
}: ShaderShowcaseProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    const handleMouseEnter = () => setIsActive(true)
    const handleMouseLeave = () => setIsActive(false)

    const container = containerRef.current
    if (container) {
      container.addEventListener("mouseenter", handleMouseEnter)
      container.addEventListener("mouseleave", handleMouseLeave)
    }

    return () => {
      if (container) {
        container.removeEventListener("mouseenter", handleMouseEnter)
        container.removeEventListener("mouseleave", handleMouseLeave)
      }
    }
  }, [])

  return (
    <div ref={containerRef} className="relative w-full bg-black">
      {/* Hero Section Container */}
      <div className="relative w-full min-h-screen overflow-hidden">
      <svg className="absolute inset-0 w-0 h-0">
        <defs>
          <filter id="glass-effect" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence baseFrequency="0.005" numOctaves="1" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.3" />
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0.02
                      0 1 0 0 0.02
                      0 0 1 0 0.05
                      0 0 0 0.9 0"
              result="tint"
            />
          </filter>
          <filter id="gooey-filter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
              result="gooey"
            />
            <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
          </filter>
          <filter id="logo-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="50%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
          <linearGradient id="hero-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="30%" stopColor="#f26522" />
            <stop offset="70%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#ffffff" />
          </linearGradient>
          <filter id="text-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      <div className="fixed inset-0 w-full h-full z-0 pointer-events-none">
        <MeshGradient
          className="w-full h-full"
          colors={["#000000", "#111111", "#1a1a1a", "#2a1508", "#f26522"]}
          speed={0.3}
          {...({ backgroundColor: "#000000" } as any)}
        />
        <MeshGradient
          className="absolute inset-0 w-full h-full opacity-60"
          colors={["#000000", "#ffffff", "#f26522", "#f97316"]}
          speed={0.2}
          {...({ wireframe: true, backgroundColor: "transparent" } as any)}
        />
      </div>

      <header className="relative z-50 pt-4 px-4 sm:px-6 max-w-[1440px] mx-auto w-full">
        <div className="rounded-xl px-4 py-3 flex items-center justify-between bg-[#0D111A]/90 border border-white/[0.08] backdrop-blur-xl shadow-xl">
          
          <div className="flex items-center gap-6">
            {/* Logo */}
            <motion.div
              className="flex items-center gap-3 group cursor-pointer"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              <div className="w-9 h-9 rounded-lg overflow-hidden border border-white/10 bg-[#111622] flex items-center justify-center shrink-0 shadow-xs">
                <img
                  src="/vogue-logo.svg"
                  alt="Vogue Trade"
                  className="w-6 h-6 object-contain group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-extrabold text-white tracking-tight leading-none font-mono">VOGUE</span>
                  <span className="text-[10px] text-cyan-400 font-mono tracking-wider font-semibold uppercase">PROTOCOL</span>
                </div>
                <span className="text-[10px] text-zinc-500 font-mono mt-0.5">Private moves. Public proof.</span>
              </div>
            </motion.div>

            {/* Nav Links */}
            <nav className="hidden md:flex items-center space-x-1 border-l border-white/[0.08] pl-6 ml-2 text-xs font-medium">
              <a href="#pipeline" className="text-zinc-400 hover:text-white px-3 py-1.5 rounded-md hover:bg-white/[0.04] transition-colors">
                ZK Pipeline
              </a>
              <a href="#modules" className="text-zinc-400 hover:text-white px-3 py-1.5 rounded-md hover:bg-white/[0.04] transition-colors">
                Institutional Modules
              </a>
              <a href="#circuits" className="text-zinc-400 hover:text-white px-3 py-1.5 rounded-md hover:bg-white/[0.04] transition-colors">
                Verified Circuits
              </a>
              <a
                href="https://preprod.midnightexplorer.com/contracts/0xbe694ffc83d109ec7587e940a80aae0e7e75d1421cefc4936b593457b484e9e7"
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:text-cyan-300 px-3 py-1.5 rounded-md hover:bg-cyan-500/10 transition-colors flex items-center gap-1 font-mono text-[11px]"
              >
                Contract Explorer <ArrowRight className="w-3 h-3 -rotate-45 opacity-70" />
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {/* Status Pill */}
            <div className="hidden lg:flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Preprod Verified</span>
              </div>
            </div>

            {/* Launch Button */}
            <button 
              onClick={walletConnected ? onEnterDashboard : onConnectWallet}
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-slate-950 px-4 py-2 rounded-lg font-bold text-xs transition-all shadow-sm shadow-cyan-500/20 cursor-pointer"
            >
              <span>{walletConnected ? 'Open Trading Terminal' : 'Launch Vogue Terminal'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </header>

      <main className="absolute bottom-10 left-6 sm:left-12 md:left-16 lg:left-20 z-20 max-w-3xl pr-6">
        <div className="text-left">
          {/* Institutional Badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#111622]/90 border border-white/[0.08] mb-6 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="text-zinc-300 text-xs font-mono tracking-wider uppercase">
              Midnight Preprod • 8 ZK-SNARK Circuits Live
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-6 leading-[1.08] tracking-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <span>The Zero-Knowledge</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-indigo-300 font-extrabold">
              Algorithmic Execution Layer
            </span>
            <span className="block text-zinc-400 text-3xl sm:text-4xl font-normal mt-1">
              on Midnight Network.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-base sm:text-lg text-zinc-400 mb-8 leading-relaxed max-w-2xl font-normal"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            Execute algorithmic strategies, cross-chain dark pool intents, and anti-MEV iceberg orders with mathematically verified zero-knowledge proofs. Trade secrets stay client-side — settlement is proven on-chain.
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="flex items-center gap-3 sm:gap-4 flex-wrap"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <button
              onClick={walletConnected ? onEnterDashboard : onConnectWallet}
              className="px-6 py-3 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-sm transition-all cursor-pointer shadow-lg shadow-cyan-500/20 flex items-center gap-2"
            >
              <span>{walletConnected ? 'Enter Trading Terminal' : 'Connect 1AM Wallet'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="https://preprod.midnightexplorer.com/contracts/0xbe694ffc83d109ec7587e940a80aae0e7e75d1421cefc4936b593457b484e9e7"
              target="_blank"
              rel="noreferrer"
              className="px-5 py-3 rounded-lg bg-[#111622] hover:bg-[#161D2C] border border-white/[0.08] hover:border-cyan-500/30 text-zinc-200 hover:text-white font-mono text-xs transition-all cursor-pointer flex items-center gap-2"
            >
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>Verify On-Chain (0xbe69…)</span>
            </a>
          </motion.div>
        </div>
      </main>

      <div className="hidden md:block absolute bottom-12 right-12 lg:bottom-16 lg:right-16 z-30">
        <div className="relative w-32 h-32 flex items-center justify-center">
          <PulsingBorder
            colors={["#f26522", "#f97316", "#ff8c00", "#ffffff", "#aaaaaa", "#333333", "#000000"]}
            colorBack="#00000000"
            speed={1.5}
            roundness={1}
            thickness={0.1}
            softness={0.2}
            intensity={5}
            style={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
            }}
            {...({
              spotsPerColor: 5,
              spotSize: 0.1,
              pulse: 0.1,
              smoke: 0.5,
              smokeSize: 4,
              scale: 0.65,
              rotation: 0,
              frame: 9161408
            } as any)}
          />

          <motion.svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 100"
            animate={{ rotate: 360 }}
            transition={{
              duration: 20,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
            style={{ transform: "scale(1.4)" }}
          >
            <defs>
              <path id="circle" d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" />
            </defs>
            <text className="text-[10px] fill-white/80 font-medium uppercase tracking-widest">
              <textPath href="#circle" startOffset="0%">
                Zero Knowledge • Privacy Trade • Vogue Protocol • Midnight Network •
              </textPath>
            </text>
          </motion.svg>
        </div>
      </div>
      
      </div>

      {/* Children Container */}
      <div className="relative z-20 w-full pb-20">
        {children}
      </div>
    </div>
  )
}
