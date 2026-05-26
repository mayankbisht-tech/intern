import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'dust-grey': '#d7cdcc',
        white: '#ffffff',
        'blue-slate': '#59656f',
        'grape-soda': '#9c528b',
        'shadow-grey': '#1d1e2c',
        primary: '#1d1e2c',
        'primary-foreground': '#ffffff',
        secondary: '#59656f',
        background: '#ffffff',
        foreground: '#1d1e2c',
        card: '#ffffff',
        'card-foreground': '#1d1e2c',
        muted: '#d7cdcc',
        'muted-foreground': '#59656f',
        border: '#d7cdcc',
        accent: '#9c528b',
        success: '#59656f',
      },
      boxShadow: {
        soft: '0 12px 40px rgba(29, 30, 44, 0.12)',
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
      },
    },
  },
  plugins: [],
}

export default config
