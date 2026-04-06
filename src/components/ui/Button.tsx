import React from 'react';
import { motion } from 'framer-motion';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const variants: Record<Variant, string> = {
  primary:   'bg-gradient-brand text-white hover:opacity-90 shadow-brand-sm',
  secondary: 'bg-card-elevated text-ink hover:bg-border border border-border',
  ghost:     'text-muted hover:text-ink hover:bg-card-elevated',
  danger:    'bg-down-light text-down hover:opacity-90',
  outline:   'border border-border text-ink hover:bg-card-elevated',
};

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3.5 text-xs rounded-xl font-semibold',
  md: 'h-10 px-5 text-sm rounded-xl font-semibold',
  lg: 'h-12 px-6 text-sm rounded-2xl font-semibold',
};

export function Button({
  variant = 'primary', size = 'md', fullWidth = false,
  children, className = '', ...props
}: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.08 }}
      className={`
        ${variants[variant]} ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        inline-flex items-center justify-center gap-2
        transition-all duration-150
        disabled:opacity-40 disabled:cursor-not-allowed
        ${className}
      `}
      {...(props as any)}
    >
      {children}
    </motion.button>
  );
}
