import React from 'react';
import { GradientWave } from './gradient-wave';

export function GradientBackground({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#0C0C0C] ${className || ''}`}
    >
      {/* Liquid Dark Mesh Wave (AIRA Dark Mode Proven Architecture) */}
      <div className="absolute inset-0 opacity-40">
        <GradientWave
          key="dashboard-dark-wave"
          isPlaying={true}
          colors={["#0c1427", "#0284c7", "#1e1035", "#6366f1", "#075985", "#080c16"]}
          className="w-full h-full"
          shadowPower={4}
          darkenTop={true}
        />
      </div>

      {/* Luminous Ambient Aurora Glows */}
      <div className="absolute -top-48 left-1/2 -translate-x-1/2 w-[900px] h-[550px] rounded-full bg-gradient-to-tr from-[#38bdf8]/15 via-[#818cf8]/15 to-transparent blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 -left-48 w-[600px] h-[600px] rounded-full bg-[#38bdf8]/10 blur-[150px] pointer-events-none" />
      <div className="absolute top-2/3 -right-48 w-[600px] h-[600px] rounded-full bg-[#818cf8]/10 blur-[150px] pointer-events-none" />

      {/* Subtle Precision Engineering Dot Grid */}
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(currentColor 1px, transparent 1px)`,
          backgroundSize: '28px 28px',
        }}
      />

      {/* Smooth Vignette Mask to blend sections naturally */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0C0C0C]/25 to-[#0C0C0C] pointer-events-none" />
    </div>
  );
}
