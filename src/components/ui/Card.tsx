import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  animate?: boolean;
  padding?: boolean;
}

export function Card({ children, className = '', onClick, animate = false, padding = false }: CardProps) {
  const base =
    'bg-white dark:bg-[#1C1C1E] rounded-2xl overflow-hidden' + (padding ? ' p-5' : '');

  if (animate && onClick) {
    return (
      <motion.div
        className={`${base} ${className} cursor-pointer`}
        onClick={onClick}
        whileTap={{ scale: 0.97 }}
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
