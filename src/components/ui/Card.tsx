import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  animate?: boolean;
  padding?: boolean;
  glass?: boolean;
  gradient?: boolean;
}

export function Card({
  children,
  className = '',
  onClick,
  animate = false,
  padding = false,
  glass = false,
  gradient = false,
}: CardProps) {
  const base = [
    glass
      ? 'glass-card'
      : gradient
        ? 'gradient-brand'
        : 'bg-card border border-border',
    'rounded-2xl overflow-hidden',
    padding ? 'p-5' : '',
    onClick ? 'cursor-pointer' : '',
  ].join(' ');

  if (animate && onClick) {
    return (
      <motion.div
        className={`${base} ${className}`}
        onClick={onClick}
        whileTap={{ scale: 0.975 }}
        transition={{ duration: 0.1 }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={`${base} ${className}`} onClick={onClick}>
      {children}
    </div>
  );
}
