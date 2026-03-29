import React from 'react';
import { motion } from 'framer-motion';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const variants: Record<Variant, string> = {
  primary: 'bg-[#007AFF] text-white active:bg-[#0066CC]',
  secondary: 'bg-[#F2F2F7] dark:bg-[#2C2C2E] text-[#007AFF] dark:text-[#0A84FF]',
  ghost: 'bg-transparent text-[#007AFF] dark:text-[#0A84FF]',
  danger: 'bg-[#FF3B30]/10 text-[#FF3B30]',
};

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-xl font-medium',
  md: 'px-4 py-2.5 text-base rounded-2xl font-semibold',
  lg: 'px-6 py-3.5 text-base rounded-2xl font-semibold',
};

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.1 }}
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
