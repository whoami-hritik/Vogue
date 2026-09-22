import React, { useEffect, useRef, useState } from "react";
import { Water } from "@paper-design/shaders-react";
import { motion } from "framer-motion";
import { ArrowRight, Shield, ExternalLink, Sparkles, Terminal, Activity } from "lucide-react";
import { LiquidGlassButton } from "./LiquidGlassButton";

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
  children,
}: ShaderShowcaseProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Interactive liquid glass cursor refraction
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    const pointer = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
      radius: 280,
    };

    const handlePointerMove = (e: MouseEvent) => {
      pointer.targetX = e.clientX;
      pointer.targetY = e.clientY;
    };

    window.addEventListener("mousemove", handlePointerMove);

    const render = () => {
      pointer.x += (pointer.targetX - pointer.x) * 0.06;
      pointer.y += (pointer.targetY - pointer.y) * 0.06;

      ctx.clearRect(0, 0, width, height);

      // Subtle dynamic specular refraction under cursor (pure white / silver, NO color gradient)
      const gradient = ctx.createRadialGradient(
        pointer.x,
        pointer.y,
        0,
        pointer.x,
        pointer.y,
        pointer.radius
      );
      gradient.addColorStop(0, "rgba(255, 255, 255, 0.05)");
      gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.015)");
      gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(pointer.x, pointer.y, pointer.radius, 0, Math.PI * 2);
      ctx.fill();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handlePointerMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleAction = walletConnected ? onEnterDashboard : onConnectWallet;

  return (
    <div className="relative w-full min-h-screen bg-[#030508] overflow-hidden text-slate-100 font-sans selection:bg-white/20 selection:text-white">
      {/* 1. Monochromatic WebGL Liquid Caustics Background (ZERO Color Gradients) */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0 opacity-45">
        <Water
          className="w-full h-full"
          colorBack="#030508"
          colorHighlight="#ffffff"
          highlights={0.14}
          waves={0.32}
          caustic={0.18}
          speed={0.28}
          size={0.7}
          layering={0.25}
          edges={0.65}
          fit="cover"
        />
      </div>

      {/* 2. Interactive Cursor Refraction Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none z-1"
      />

      {/* 3. Liquid Glass Depth Vignette */}
      <div
        className="fixed inset-0 pointer-events-none z-2"
        style={{
          background:
            "radial-gradient(ellipse at 50% 25%, transparent 30%, rgba(3, 5, 8, 0.8) 100%)",
        }}
      />

      {/* 4. Floating Liquid Glass Navigation Dock */}
      <header className="sticky top-0 z-50 pt-4 px-4 sm:px-8 max-w-[1440px] mx-auto w-full transition-all duration-300">
        <div
          className={`rounded-full px-5 py-3 flex items-center justify-between transition-all duration-300 ${
            scrolled
              ? "bg-white/[0.04] backdrop-blur-2xl border border-white/[0.16] shadow-[inset_0_1px_1px_rgba(255,255,255,0.35),0_16px_40px_rgba(0,0,0,0.6)]"
              : "bg-white/[0.02] backdrop-blur-xl border border-white/[0.1] shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_8px_24px_rgba(0,0,0,0.4)]"
          }`}
        >
          {/* Brand */}
          <div className="flex items-center gap-6">
            <motion.div
              className="flex items-center gap-3 cursor-pointer select-none"
              whileHover={{ scale: 1.02 }}
              onClick={handleAction}
            >
              <div className="w-8 h-8 rounded-full border border-white/20 bg-white/[0.05] backdrop-blur-md flex items-center justify-center shrink-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]">
                <img
                  src="/vogue-logo.svg"
                  alt="Vogue Protocol"
                  className="w-5 h-5 object-contain"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold tracking-tight text-white leading-none">
                    VOGUE
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono tracking-widest uppercase">
                    PROTOCOL
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Nav Links */}
            <nav className="hidden md:flex items-center space-x-1 border-l border-white/[0.1] pl-6 ml-2 text-xs font-medium">
              <a
                href="#pipeline"
                className="text-zinc-400 hover:text-white px-3 py-1.5 rounded-full hover:bg-white/[0.06] transition-colors"
              >
                ZK Pipeline
              </a>
              <a
                href="#modules"
                className="text-zinc-400 hover:text-white px-3 py-1.5 rounded-full hover:bg-white/[0.06] transition-colors"
              >
                Institutional Pillars
              </a>
              <a
                href="#circuits"
                className="text-zinc-400 hover:text-white px-3 py-1.5 rounded-full hover:bg-white/[0.06] transition-colors"
              >
                Circuit Registry
              </a>
              <a
                href="https://preprod.midnightexplorer.com/contracts/0xbe694ffc83d109ec7587e940a80aae0e7e75d1421cefc4936b593457b484e9e7"
                target="_blank"
                rel="noreferrer"
                className="text-zinc-300 hover:text-white px-3 py-1.5 rounded-full hover:bg-white/[0.06] transition-colors flex items-center gap-1 font-mono text-[11px]"
              >
                <span>Contract Explorer</span>
                <ArrowRight className="w-3 h-3 -rotate-45 opacity-60" />
              </a>
            </nav>
          </div>

          {/* Right Status + Liquid Glass Button */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.1] text-zinc-300 text-xs font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Midnight Preprod</span>
            </div>

            {/* Transparent Liquid Glass Button */}
            <LiquidGlassButton onClick={handleAction} variant="primary">
              <span>{walletConnected ? "Enter Terminal" : "Launch Terminal"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </LiquidGlassButton>
          </div>
        </div>
      </header>

      {/* 5. Monumental Centered Hero */}
      <section className="relative z-10 pt-20 sm:pt-28 pb-16 px-4 sm:px-8 max-w-5xl mx-auto text-center flex flex-col items-center">
        {/* Liquid Glass Badge */}
        <motion.div
          className="liquid-glass-pill px-4 py-1.5 inline-flex items-center gap-2 mb-8 select-none"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
          <span className="text-zinc-200 text-xs font-mono tracking-wider uppercase font-semibold">
            Midnight Preprod • 8 ZK Circuits Live & Verified
          </span>
        </motion.div>

        {/* Headline: Clean, monumental, pure white with specular glow, NO cheap color gradients */}
        <motion.h1
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-[-0.03em] leading-[1.06] mb-6 max-w-4xl"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          The Zero-Knowledge
          <span className="block text-zinc-200 font-light mt-1">
            Algorithmic Execution Layer
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-base sm:text-xl text-zinc-300 max-w-2xl mx-auto leading-relaxed mb-10 font-normal"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
        >
          Execute algorithmic trading strategies, anti-MEV iceberg orders, and private cross-chain intents with mathematically verified zero-knowledge proofs. All trade secrets remain client-side — state transitions are proven on Midnight.
        </motion.p>

        {/* Dual Transparent Liquid Glass Buttons */}
        <motion.div
          className="flex items-center justify-center gap-4 flex-wrap"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
        >
          <LiquidGlassButton onClick={handleAction} variant="primary">
            <span>{walletConnected ? "Open Trading Terminal" : "Connect 1AM Wallet"}</span>
            <ArrowRight className="w-4 h-4" />
          </LiquidGlassButton>

          <LiquidGlassButton
            href="https://preprod.midnightexplorer.com/contracts/0xbe694ffc83d109ec7587e940a80aae0e7e75d1421cefc4936b593457b484e9e7"
            target="_blank"
            rel="noreferrer"
            variant="secondary"
            icon={<Shield className="w-4 h-4 text-zinc-300" />}
          >
            <span>Verify Contract (0xbe69…)</span>
          </LiquidGlassButton>
        </motion.div>
      </section>

      {/* 6. Children Sections (Rendered over the same dynamic liquid atmosphere) */}
      <div className="relative z-10 w-full pb-24">
        {children}
      </div>
    </div>
  );
}
