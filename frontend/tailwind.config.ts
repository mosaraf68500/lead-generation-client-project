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
        // ─────────────────────────────────────────────────────────────
        // Brand palette — built around the three anchor colors the
        // business uses across collateral:
        //   • header bg  → `brand-200` = #FFD5B8 (light peach)
        //   • footer bg  → `brand-500` = #FF6900 (vivid orange)
        //   • button bg  → `brand-600` = #F54900 (deep red-orange)
        //
        // The remaining steps were tuned (lightness ramped) so they
        // sit on a consistent hue line, which keeps every Tailwind
        // `bg-brand-*` / `text-brand-*` / `border-brand-*` class
        // visually coherent without us editing each component.
        // ─────────────────────────────────────────────────────────────
        brand: {
          50: '#fff4ec',
          100: '#ffe8d5',
          200: '#ffd5b8', // ← header bg
          300: '#ffb585',
          400: '#ff8c4a',
          500: '#ff6900', // ← footer bg
          600: '#f54900', // ← primary button bg
          700: '#c73900',
          800: '#9c2d00',
          900: '#6b1f00',
          950: '#3d1100',
        },
        // Accent stays inside the brand-orange family so any
        // `text-accent-*` / `bg-accent-*` consumer stays on palette.
        accent: {
          500: '#ff6900',
          600: '#f54900',
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
