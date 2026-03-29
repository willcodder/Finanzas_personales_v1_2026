import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number;
  color?: string;
  height?: number;
  className?: string;
  bg?: string;
}

export function ProgressBar({ value, color = '#4F46E5', height = 4, className = '', bg = '#EBEBEB' }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className={`w-full rounded-full overflow-hidden ${className}`} style={{ height, backgroundColor: bg }}>
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={{ width: `${clamped}%` }}
        transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
      />
    </div>
  );
}
