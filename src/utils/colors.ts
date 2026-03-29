import type { CategoryColor } from '../types';

export const colorMap: Record<CategoryColor, { bg: string; text: string; light: string; hex: string }> = {
  blue:   { bg: 'bg-[#007AFF]', text: 'text-[#007AFF]', light: 'bg-[#007AFF]/15', hex: '#007AFF' },
  green:  { bg: 'bg-[#34C759]', text: 'text-[#34C759]', light: 'bg-[#34C759]/15', hex: '#34C759' },
  red:    { bg: 'bg-[#FF3B30]', text: 'text-[#FF3B30]', light: 'bg-[#FF3B30]/15', hex: '#FF3B30' },
  orange: { bg: 'bg-[#FF9500]', text: 'text-[#FF9500]', light: 'bg-[#FF9500]/15', hex: '#FF9500' },
  yellow: { bg: 'bg-[#FFCC00]', text: 'text-[#FFCC00]', light: 'bg-[#FFCC00]/15', hex: '#FFCC00' },
  purple: { bg: 'bg-[#AF52DE]', text: 'text-[#AF52DE]', light: 'bg-[#AF52DE]/15', hex: '#AF52DE' },
  pink:   { bg: 'bg-[#FF2D55]', text: 'text-[#FF2D55]', light: 'bg-[#FF2D55]/15', hex: '#FF2D55' },
  teal:   { bg: 'bg-[#5AC8FA]', text: 'text-[#5AC8FA]', light: 'bg-[#5AC8FA]/15', hex: '#5AC8FA' },
  indigo: { bg: 'bg-[#5856D6]', text: 'text-[#5856D6]', light: 'bg-[#5856D6]/15', hex: '#5856D6' },
};

export const colorOptions: CategoryColor[] = [
  'blue', 'green', 'red', 'orange', 'yellow', 'purple', 'pink', 'teal', 'indigo',
];
