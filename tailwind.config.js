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
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        card: 'rgb(var(--color-card) / <alpha-value>)',
        border: 'rgb(var(--color-border) / <alpha-value>)',
        'border-strong': 'rgb(var(--color-border-strong) / <alpha-value>)',
        ink: 'rgb(var(--color-ink) / <alpha-value>)',
        muted: 'rgb(var(--color-muted) / <alpha-value>)',
        subtle: 'rgb(var(--color-subtle) / <alpha-value>)',
        brand: '#4F46E5',
        'brand-light': 'rgb(var(--color-brand-light) / <alpha-value>)',
        up: '#16A34A',
        'up-light': 'rgb(var(--color-up-light) / <alpha-value>)',
        down: '#DC2626',
        'down-light': 'rgb(var(--color-down-light) / <alpha-value>)',
        warn: '#D97706',
        'warn-light': 'rgb(var(--color-warn-light) / <alpha-value>)',
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
