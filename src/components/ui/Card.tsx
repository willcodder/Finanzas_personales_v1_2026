import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
  padding?: boolean;
}

export function Card({ children, className = '', onClick, hover = false, padding = false }: CardProps) {
  return (
    <div
      className={`
        bg-card rounded-xl border border-border
        ${hover ? 'transition-shadow duration-150 hover:shadow-card-hover cursor-pointer' : ''}
        ${padding ? 'p-5' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
