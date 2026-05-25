'use client';

/**
 * Global theme context. Toggles between `light` and `dark` and persists the
 * choice to localStorage. Uses Tailwind's `class` strategy: the provider
 * writes/removes `class="dark"` on the <html> element so utility classes
 * like `dark:bg-ink-900` activate.
 */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

type Theme = 'light' | 'dark';
const STORAGE_KEY = 'sep-theme';

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const applyTheme = (theme: Theme): void => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (theme === 'dark') root.classList.add('dark');
  else root.classList.remove('dark');
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  // Default to light to avoid SSR/CSR hydration mismatch — we resolve the
  // real preference inside `useEffect` once we're on the client.
  const [theme, setThemeState] = useState<Theme>('light');

  useEffect(() => {
    const stored = (typeof window !== 'undefined' && (window.localStorage.getItem(STORAGE_KEY) as Theme | null)) || null;
    const prefersDark =
      typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    const initial: Theme = stored ?? (prefersDark ? 'dark' : 'light');
    setThemeState(initial);
    applyTheme(initial);
  }, []);

  const setTheme = (next: Theme): void => {
    setThemeState(next);
    applyTheme(next);
    if (typeof window !== 'undefined') window.localStorage.setItem(STORAGE_KEY, next);
  };

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme,
      toggle: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within <ThemeProvider>');
  return ctx;
};
