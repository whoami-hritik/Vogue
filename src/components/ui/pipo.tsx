import React from 'react';

export function GradientBackground({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 pointer-events-none overflow-hidden bg-[#07090E] ${className || ''}`}
    >
      {/* 1. Subtle Midnight Cyan Ambient Aura */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 90% 60% at 50% -10%, rgba(56, 189, 248, 0.08), rgba(99, 102, 241, 0.03) 50%, transparent 80%)',
        }}
      />

      {/* 2. Secondary Emerald Accent Aura on bottom right */}
      <div
        className="absolute bottom-0 right-0 w-[500px] h-[500px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.03) 0%, transparent 70%)',
        }}
      />

      {/* 3. Subtle Engineered Technical Grid */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: 'linear-gradient(to right, #FFFFFF 1px, transparent 1px), linear-gradient(to bottom, #FFFFFF 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* 4. Soft Micro-Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(7, 9, 14, 0.8) 100%)',
        }}
      />
    </div>
  );
}
