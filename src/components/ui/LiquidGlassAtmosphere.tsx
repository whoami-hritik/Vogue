import React, { useEffect, useRef } from 'react';
import { Water } from '@paper-design/shaders-react';

interface LiquidGlassAtmosphereProps {
  children?: React.ReactNode;
}

export const LiquidGlassAtmosphere: React.FC<LiquidGlassAtmosphereProps> = ({ children }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Interactive pointer ripple state
    const pointer = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
      radius: 200,
    };

    const handlePointerMove = (e: MouseEvent) => {
      pointer.targetX = e.clientX;
      pointer.targetY = e.clientY;
    };

    window.addEventListener('mousemove', handlePointerMove);

    // Render loop: interactive specular highlight and subtle liquid refraction
    const render = () => {
      // Smooth lerp pointer
      pointer.x += (pointer.targetX - pointer.x) * 0.08;
      pointer.y += (pointer.targetY - pointer.y) * 0.08;

      ctx.clearRect(0, 0, width, height);

      // Subtle dynamic specular refraction under cursor
      const gradient = ctx.createRadialGradient(
        pointer.x,
        pointer.y,
        0,
        pointer.x,
        pointer.y,
        pointer.radius
      );
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.04)');
      gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.015)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(pointer.x, pointer.y, pointer.radius, 0, Math.PI * 2);
      ctx.fill();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handlePointerMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="relative w-full min-h-screen bg-[#030508] overflow-hidden text-slate-100">
      {/* 1. Monochromatic WebGL Liquid Caustics (ZERO Color Gradients) */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0 opacity-40">
        <Water
          className="w-full h-full"
          colorBack="#030508"
          colorHighlight="#ffffff"
          highlights={0.12}
          waves={0.35}
          caustic={0.16}
          speed={0.3}
          size={0.75}
          layering={0.25}
          edges={0.6}
          fit="cover"
        />
      </div>

      {/* 2. Interactive Cursor Refraction Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none z-1"
      />

      {/* 3. Subtle Liquid Glass Vignette & Depth Mask */}
      <div 
        className="fixed inset-0 pointer-events-none z-2"
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, transparent 40%, rgba(3, 5, 8, 0.7) 100%)'
        }}
      />

      {/* 4. Page Content */}
      <div className="relative z-10 w-full">
        {children}
      </div>
    </div>
  );
};
