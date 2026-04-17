import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GlowButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'gold' | 'teal' | 'crimson' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

const variants = {
  gold: 'bg-gold/20 border-gold/40 text-gold hover:bg-gold/30 hover:border-gold/60 glow-gold',
  teal: 'bg-teal/20 border-teal/40 text-teal hover:bg-teal/30 hover:border-teal/60 glow-teal',
  crimson: 'bg-crimson/20 border-crimson/40 text-crimson hover:bg-crimson/30 hover:border-crimson/60 glow-crimson',
  ghost: 'bg-transparent border-ash/40 text-ivory-muted hover:bg-surface hover:text-ivory hover:border-ash-light',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export function GlowButton({
  children,
  onClick,
  variant = 'gold',
  size = 'md',
  disabled = false,
  className = '',
}: GlowButtonProps) {
  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={`
        border rounded-lg font-display font-semibold tracking-wide
        transition-all duration-200 cursor-pointer
        disabled:opacity-40 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {children}
    </motion.button>
  );
}
