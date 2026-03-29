/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Inter', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        sidebar: '#0C0C0C',
        'sidebar-hover': '#1A1A1A',
        'sidebar-active': '#262626',
        surface: '#F7F7F8',
        card: '#FFFFFF',
        border: '#EBEBEB',
        'border-strong': '#D4D4D4',
        brand: '#4F46E5',
        'brand-light': '#EEF2FF',
        up: '#16A34A',
        'up-light': '#F0FDF4',
        down: '#DC2626',
        'down-light': '#FEF2F2',
        warn: '#D97706',
        'warn-light': '#FFFBEB',
        muted: '#6B7280',
        subtle: '#9CA3AF',
        ink: '#111111',
        tr: {
          green: '#00C914',
          'green-dim': 'rgba(0,201,20,0.12)',
          red: '#EF4444',
          'red-dim': 'rgba(239,68,68,0.12)',
        },
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
        dropdown: '0 8px 30px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
      },
      borderRadius: {
        DEFAULT: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
      },
      fontSize: {
        '2xs': ['10px', '14px'],
      },
    },
  },
  plugins: [],
}
