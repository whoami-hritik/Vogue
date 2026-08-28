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
    <div ref={containerRef} className="min-h-screen bg-black relative overflow-hidden">
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

      <header className="relative z-20 flex items-center justify-between p-6 max-w-[1440px] mx-auto">
        <motion.div
          className="flex items-center gap-3 group cursor-pointer"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20 bg-black flex items-center justify-center shrink-0">
            <img
              src="/vogue-logo.svg"
              alt="Vogue Trade"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-extrabold text-white tracking-tight leading-none drop-shadow-md">VOGUE</span>
            <span className="text-[10px] text-white/70 font-semibold tracking-wider uppercase">TRADE</span>
          </div>

          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white/60 rounded-full"
                style={{
                  left: `${20 + Math.random() * 60}%`,
                  top: `${20 + Math.random() * 60}%`,
                }}
                animate={{
                  y: [-10, -20, -10],
                  x: [0, Math.random() * 20 - 10, 0],
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: i * 0.2,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </motion.div>

        <nav className="hidden md:flex items-center space-x-2">
          <a
            href="#architecture"
            className="text-white/80 hover:text-white text-sm font-light px-4 py-2 rounded-full hover:bg-white/10 transition-all duration-200"
          >
            Architecture
          </a>
          <a
            href="#modules"
            className="text-white/80 hover:text-white text-sm font-light px-4 py-2 rounded-full hover:bg-white/10 transition-all duration-200"
          >
            Modules
          </a>
          <a
            href="#circuits"
            className="text-white/80 hover:text-white text-sm font-light px-4 py-2 rounded-full hover:bg-white/10 transition-all duration-200"
          >
            ZK Circuits
          </a>
          <a
            href="https://explorer.1am.xyz?network=preprod"
            target="_blank"
            rel="noreferrer"
            className="text-white/80 hover:text-white text-sm font-light px-4 py-2 rounded-full hover:bg-white/10 transition-all duration-200 flex items-center gap-1"
          >
            1AM Explorer
          </a>
        </nav>

        <div id="gooey-btn" className="relative flex items-center group cursor-pointer" style={{ filter: "url(#gooey-filter)" }} onClick={walletConnected ? onEnterDashboard : onConnectWallet}>
          <button className="absolute right-0 px-2.5 py-2 rounded-full bg-white text-black font-normal text-xs transition-all duration-300 hover:bg-white/90 cursor-pointer h-10 flex items-center justify-center -translate-x-12 group-hover:-translate-x-[90px] z-0">
            <ArrowRight className="w-4 h-4 text-black" />
          </button>
          <button className="px-6 py-2 rounded-full bg-white text-black font-semibold text-sm transition-all duration-300 hover:bg-white/90 cursor-pointer h-10 flex items-center z-10">
            {walletConnected ? 'Dashboard' : '1AM Wallet'}
          </button>
        </div>
      </header>

      <main className="absolute bottom-8 left-8 md:bottom-16 md:left-16 lg:left-24 z-20 max-w-3xl pr-8">
        <div className="text-left">
          <motion.div
            className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm mb-6 relative border border-white/10"
            style={{
              filter: "url(#glass-effect)",
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="absolute top-0 left-1 right-1 h-px bg-gradient-to-r from-transparent via-orange-400/50 to-transparent rounded-full" />
            <span className="text-white/90 text-sm font-medium relative z-10 tracking-wide">
              ✨ Private moves. Public proof.
            </span>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-none tracking-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <span className="block font-black text-white drop-shadow-2xl mb-2">Autonomous</span>
            <motion.span
              className="block font-light text-white/90 text-4xl md:text-5xl lg:text-6xl tracking-wider pb-1"
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #f26522 30%, #f97316 70%, #ffffff 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter: "url(#text-glow)",
              }}
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 8,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            >
              zero-knowledge trading
            </motion.span>
            <span className="block font-light text-white/80 italic text-3xl md:text-4xl lg:text-5xl mt-2">on Midnight Network.</span>
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl font-light text-white/70 mb-8 leading-relaxed max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            Vogue combines client-side Gemini AI strategy synthesis, Compact smart contracts, and EZKL risk verification. Your trade secrets stay private — execution is proven on-chain.
          </motion.p>

          <motion.div
            className="flex items-center gap-4 sm:gap-6 flex-wrap"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            <motion.button
              onClick={walletConnected ? onEnterDashboard : onConnectWallet}
              className="px-8 py-4 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold text-sm transition-all duration-300 hover:from-orange-400 hover:to-red-400 cursor-pointer shadow-lg hover:shadow-xl flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {walletConnected ? 'Launch Dashboard' : 'Connect 1AM Wallet'}
              <ArrowRight className="w-4 h-4" />
            </motion.button>
            <motion.a
              href="https://midnight.network"
              target="_blank"
              rel="noreferrer"
              className="px-8 py-4 rounded-full bg-transparent border border-white/30 text-white font-medium text-sm transition-all duration-300 hover:bg-white/10 hover:border-orange-400/50 hover:text-orange-100 cursor-pointer backdrop-blur-sm flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Shield className="w-4 h-4" />
              Featured by Midnight
            </motion.a>
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
      
      {/* Children Container */}
      <div className="relative z-20 w-full pb-20">
        {children}
      </div>
    </div>
  )
}
