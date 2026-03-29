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
  primary:   'bg-brand text-white hover:bg-indigo-600',
  secondary: 'bg-surface text-ink hover:bg-border border border-border',
  ghost:     'text-muted hover:text-ink hover:bg-surface',
  danger:    'bg-down-light text-down hover:bg-red-100',
  outline:   'border border-border text-ink hover:bg-surface',
};

const sizes: Record<Size, string> = {
  sm: 'h-7 px-3 text-xs rounded-md font-medium',
  md: 'h-9 px-4 text-sm rounded-lg font-medium',
  lg: 'h-10 px-5 text-sm rounded-lg font-semibold',
};

export function Button({
  variant = 'primary', size = 'md', fullWidth = false,
  children, className = '', ...props
}: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.08 }}
      className={`
        ${variants[variant]} ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        inline-flex items-center justify-center gap-2
        transition-colors duration-150
        disabled:opacity-40 disabled:cursor-not-allowed
        ${className}
      `}
      {...(props as any)}
    >
      {children}
    </motion.button>
  );
}
