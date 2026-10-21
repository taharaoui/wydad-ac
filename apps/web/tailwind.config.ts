import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        wydad: {
          red: '#EA332F',
          'red-hover': '#D42B27',
          'red-soft': '#FEF0F0',
          'red-dark': '#C41E1A',
          white: '#FFFFFF',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          secondary: '#F8F8F6',
          dark: '#1A1A18',
          'dark-secondary': '#242422',
        },
        border: {
          DEFAULT: '#E8E8E4',
          dark: '#2E2E2A',
        },
        fg: {
          DEFAULT: '#1A1A18',
          secondary: '#5C5C56',
          muted: '#9A9A92',
          inverse: '#FAFAF8',
          dim: '#9A9A92',
          'dark-DEFAULT': '#EAEAE6',
          'dark-secondary': '#9A9A94',
          'dark-dim': '#666660',
        },
        accent: {
          green: '#2D8A56',
          'green-bg': '#EDF7F1',
          gold: '#D4A843',
          'gold-bg': '#FBF7EE',
          blue: '#2D6FBF',
          'blue-bg': '#EDF3FB',
        },
      },
      fontFamily: {
        display: ['Cairo', 'system-ui', '-apple-system', 'sans-serif'],
        body: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['SF Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        // Type scale — mobile-first, use clamp for responsive headings in components
        'display-xl': ['2.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-lg': ['2rem', { lineHeight: '1.15', letterSpacing: '-0.015em' }],
        'display-md': ['1.5rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'display-sm': ['1.25rem', { lineHeight: '1.25' }],
        'body-lg': ['1.0625rem', { lineHeight: '1.65' }],
        'body-md': ['0.9375rem', { lineHeight: '1.6' }],
        'body-sm': ['0.8125rem', { lineHeight: '1.55' }],
        'label-lg': ['0.8125rem', { lineHeight: '1', letterSpacing: '0.06em' }],
        'label-sm': ['0.6875rem', { lineHeight: '1', letterSpacing: '0.08em' }],
      },
      borderRadius: {
        card: '12px',
        button: '8px',
        badge: '20px',
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top, 0px)',
        'safe-bottom': 'env(safe-area-inset-bottom, 0px)',
        'safe-left': 'env(safe-area-inset-left, 0px)',
        'safe-right': 'env(safe-area-inset-right, 0px)',
      },
      maxWidth: {
        content: '860px',
        wide: '1120px',
      },
      keyframes: {
        'pulse-live': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'pulse-live': 'pulse-live 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.3s ease-out',
      },
    },
  },
  plugins: [],
};

export default config;
