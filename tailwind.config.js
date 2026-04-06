/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'SF Mono', 'monospace'],
      },
      colors: {
        /* Sidebar — always dark */
        sidebar:          '#000000',
        'sidebar-hover':  '#141414',
        'sidebar-active': '#1C1C1E',

        /* CSS-variable-based tokens */
        surface:          'rgb(var(--color-surface) / <alpha-value>)',
        card:             'rgb(var(--color-card) / <alpha-value>)',
        'card-elevated':  'rgb(var(--color-card-elevated) / <alpha-value>)',
        border:           'rgb(var(--color-border) / <alpha-value>)',
        'border-strong':  'rgb(var(--color-border-strong) / <alpha-value>)',
        'border-subtle':  'rgb(var(--color-border-subtle) / <alpha-value>)',
        ink:              'rgb(var(--color-ink) / <alpha-value>)',
        'ink-secondary':  'rgb(var(--color-ink-secondary) / <alpha-value>)',
        muted:            'rgb(var(--color-muted) / <alpha-value>)',
        subtle:           'rgb(var(--color-subtle) / <alpha-value>)',

        /* Revolut brand — violet-to-blue gradient primary */
        brand:            '#0A84FF',
        'brand-violet':   '#5856D6',
        'brand-light':    'rgb(var(--color-brand-light) / <alpha-value>)',

        /* Semantic */
        up:               '#30D158',  /* iOS green */
        'up-light':       'rgb(var(--color-up-light) / <alpha-value>)',
        down:             '#FF3B30',  /* iOS red */
        'down-light':     'rgb(var(--color-down-light) / <alpha-value>)',
        warn:             '#FF9F0A',  /* iOS orange */
        'warn-light':     'rgb(var(--color-warn-light) / <alpha-value>)',

        /* Trend colors for charts */
        tr: {
          green:      '#30D158',
          'green-dim': 'rgba(48,209,88,0.15)',
          red:        '#FF3B30',
          'red-dim':  'rgba(255,59,48,0.12)',
        },
      },

      backgroundImage: {
        'gradient-brand':   'linear-gradient(135deg, #5856D6 0%, #0A84FF 100%)',
        'gradient-brand-r': 'linear-gradient(135deg, #0A84FF 0%, #5856D6 100%)',
        'gradient-up':      'linear-gradient(135deg, #00C853 0%, #30D158 100%)',
        'gradient-down':    'linear-gradient(135deg, #FF3B30 0%, #FF6B6B 100%)',
        'gradient-dark':    'linear-gradient(180deg, #1C1C1E 0%, #141414 100%)',
        'gradient-card':    'linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
      },

      boxShadow: {
        brand:        '0 8px 30px rgba(10, 132, 255, 0.35)',
        'brand-sm':   '0 4px 14px rgba(10, 132, 255, 0.25)',
        card:         '0 2px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
        'card-hover': '0 8px 28px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)',
        dropdown:     '0 16px 48px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.10)',
        inner:        'inset 0 1px 2px rgba(0,0,0,0.08)',
        hero:         '0 24px 64px rgba(88, 86, 214, 0.3), 0 8px 24px rgba(10, 132, 255, 0.2)',
      },

      borderRadius: {
        DEFAULT: '10px',
        lg:  '14px',
        xl:  '18px',
        '2xl': '22px',
        '3xl': '28px',
        '4xl': '36px',
      },

      fontSize: {
        '2xs': ['10px', '14px'],
        '3xs': ['9px',  '12px'],
      },

      animation: {
        'fade-up': 'fadeUp 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'scale-in': 'scaleIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },

      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.92)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
      },

      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
    },
  },
  plugins: [],
}
