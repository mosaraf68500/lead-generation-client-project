import type { Config } from 'tailwindcss';

/**
 * Tailwind config. The `brand.*` palette + `radius` tokens form the small
 * design-token layer that keeps every component visually consistent.
 */
const config: Config = {
  darkMode: 'class',
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/context/**/*.{ts,tsx}',
    './src/hooks/**/*.{ts,tsx}',
    './src/services/**/*.{ts,tsx}',
    './src/utils/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        lg: '2rem',
      },
      screens: {
        '2xl': '1280px',
      },
    },
    extend: {
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        accent: {
          500: '#22c55e',
          600: '#16a34a',
        },
        ink: {
          900: '#0b1220',
          700: '#1e293b',
          500: '#475569',
          300: '#94a3b8',
          100: '#e2e8f0',
        },
        surface: {
          DEFAULT: '#ffffff',
          muted: '#f8fafc',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        // Shadows disabled site-wide. Keep the token names so existing
        // `shadow-card` / `shadow-cardHover` references compile to a no-op.
        card: 'none',
        cardHover: 'none',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn .4s ease-out',
      },
    },
  },
  plugins: [],
};

export default config;
