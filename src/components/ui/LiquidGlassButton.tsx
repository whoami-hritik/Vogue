import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface LiquidGlassButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary';
  icon?: React.ReactNode;
  href?: string;
  target?: string;
  rel?: string;
}

export const LiquidGlassButton: React.FC<LiquidGlassButtonProps> = ({
  onClick,
  children,
  className = '',
  variant = 'primary',
  icon,
  href,
  target,
  rel,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const baseStyles =
    variant === 'primary'
      ? 'liquid-glass-btn px-6 py-3.5 text-sm font-bold tracking-tight text-white gap-2.5 shadow-2xl'
      : 'liquid-glass-btn-secondary px-5 py-3 text-xs font-mono font-medium tracking-wide text-zinc-200 gap-2';

  const content = (
    <motion.div
      className={`relative inline-flex items-center justify-center select-none ${baseStyles} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98, y: 1 }}
      transition={{ type: 'spring', stiffness: 450, damping: 20 }}
    >
      {/* Specular curved reflection cap */}
      <div className="absolute top-0 inset-x-0 h-1/2 rounded-t-full bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />

      {/* Dynamic light refraction sweep on hover */}
      {isHovered && (
        <motion.div
          className="absolute inset-0 w-full h-full pointer-events-none"
          initial={{ x: '-100%', opacity: 0 }}
          animate={{ x: '150%', opacity: [0, 0.6, 0] }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
            transform: 'skewX(-20deg)',
          }}
        />
      )}

      {/* Button content */}
      <span className="relative z-10 flex items-center gap-2 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
        {children}
        {icon && <span className="relative z-10 transition-transform group-hover:translate-x-0.5">{icon}</span>}
      </span>
    </motion.div>
  );

  if (href) {
    return (
      <a href={href} target={target} rel={rel} className="inline-block no-underline">
        {content}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className="inline-block bg-transparent p-0 border-0 cursor-pointer">
      {content}
    </button>
  );
};
