'use client';

/**
 * Client-only theme studio. The actual theme state lives in `ThemeContext`
 * (which Better Auth doesn't need to know about). Super-admin uses this
 * surface to:
 *   - flip the global light/dark mode preview
 *   - inspect the brand palette tokens
 *   - eyeball the typography scale
 *
 * Storing palette overrides into the design tokens would require a Tailwind
 * theme-variables refactor — that's intentionally out of scope here, this
 * page is a *visual* reference + toggle.
 */

import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { cn } from '@/utils';

// Mirrors the brand scale defined in `tailwind.config.ts`. Anchors:
//   • brand-200 = #FFD5B8 (header bg)
//   • brand-500 = #FF6900 (footer bg)
//   • brand-600 = #F54900 (primary button bg)
const BRAND_SCALE = [
  { name: 'brand-50', token: '#fff4ec' },
  { name: 'brand-100', token: '#ffe8d5' },
  { name: 'brand-200', token: '#ffd5b8' },
  { name: 'brand-300', token: '#ffb585' },
  { name: 'brand-400', token: '#ff8c4a' },
  { name: 'brand-500', token: '#ff6900' },
  { name: 'brand-600', token: '#f54900' },
  { name: 'brand-700', token: '#c73900' },
  { name: 'brand-800', token: '#9c2d00' },
  { name: 'brand-900', token: '#6b1f00' },
];

const INK_SCALE = [
  { name: 'ink-100', token: '#e2e8f0' },
  { name: 'ink-300', token: '#94a3b8' },
  { name: 'ink-500', token: '#475569' },
  { name: 'ink-700', token: '#1e293b' },
  { name: 'ink-900', token: '#0b1220' },
];

export const ThemeStudio = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-8">
      {/* ── Mode toggle ─────────────────────────────────────────── */}
      <section className="rounded-2xl border border-ink-100 bg-white p-5 dark:border-ink-700 dark:bg-ink-900">
        <h2 className="text-base font-semibold text-ink-900 dark:text-ink-100">
          Appearance mode
        </h2>
        <p className="mt-1 text-xs text-ink-500">
          Persists per-browser via localStorage. Affects every page in the app
          immediately.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {(['light', 'dark'] as const).map((mode) => {
            const active = theme === mode;
            const Icon = mode === 'light' ? Sun : Moon;
            return (
              <button
                key={mode}
                type="button"
                onClick={() => setTheme(mode)}
                className={cn(
                  'flex items-center gap-3 rounded-xl border p-4 text-left transition',
                  active
                    ? 'border-brand-500 bg-brand-50 dark:border-brand-400 dark:bg-brand-700/20'
                    : 'border-ink-100 bg-white hover:border-brand-300 dark:border-ink-700 dark:bg-ink-900',
                )}
              >
                <span
                  className={cn(
                    'inline-flex h-10 w-10 items-center justify-center rounded-xl',
                    active
                      ? 'bg-brand-600 text-white'
                      : 'bg-ink-100 text-ink-700 dark:bg-ink-700 dark:text-ink-100',
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-bold capitalize text-ink-900 dark:text-ink-100">
                    {mode} mode
                  </p>
                  <p className="text-xs text-ink-500">
                    {mode === 'light'
                      ? 'Bright surfaces, dark ink — default for daytime use.'
                      : 'Inverted surfaces, easy on the eyes after dark.'}
                  </p>
                </div>
                {active && (
                  <Badge tone="success" className="ml-auto text-[10px]">
                    Active
                  </Badge>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Brand palette ──────────────────────────────────────── */}
      <section className="rounded-2xl border border-ink-100 bg-white p-5 dark:border-ink-700 dark:bg-ink-900">
        <h2 className="text-base font-semibold text-ink-900 dark:text-ink-100">
          Brand palette
        </h2>
        <p className="mt-1 text-xs text-ink-500">
          Token names map directly to Tailwind utility classes (e.g.{' '}
          <code>bg-brand-600</code>).
        </p>
        <div className="mt-4 grid grid-cols-5 gap-3 sm:grid-cols-10">
          {BRAND_SCALE.map((swatch) => (
            <div key={swatch.name} className="space-y-1">
              <div
                className="h-12 w-full rounded-lg border border-ink-100 dark:border-ink-700"
                style={{ backgroundColor: swatch.token }}
              />
              <p className="text-[10px] font-bold text-ink-900 dark:text-ink-100">
                {swatch.name}
              </p>
              <p className="text-[10px] text-ink-500">{swatch.token}</p>
            </div>
          ))}
        </div>

        <h3 className="mt-6 text-sm font-semibold text-ink-900 dark:text-ink-100">
          Ink (neutrals)
        </h3>
        <div className="mt-3 grid grid-cols-5 gap-3">
          {INK_SCALE.map((swatch) => (
            <div key={swatch.name} className="space-y-1">
              <div
                className="h-12 w-full rounded-lg border border-ink-100 dark:border-ink-700"
                style={{ backgroundColor: swatch.token }}
              />
              <p className="text-[10px] font-bold text-ink-900 dark:text-ink-100">
                {swatch.name}
              </p>
              <p className="text-[10px] text-ink-500">{swatch.token}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Component preview ──────────────────────────────────── */}
      <section className="rounded-2xl border border-ink-100 bg-white p-5 dark:border-ink-700 dark:bg-ink-900">
        <h2 className="text-base font-semibold text-ink-900 dark:text-ink-100">
          Component preview
        </h2>
        <p className="mt-1 text-xs text-ink-500">
          Quickly verify the active theme reads correctly across every common
          surface.
        </p>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="space-y-3 rounded-xl border border-ink-100 p-4 dark:border-ink-700">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">
              Buttons
            </p>
            <div className="flex flex-wrap gap-2">
              <Button>Primary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-ink-100 p-4 dark:border-ink-700">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">
              Badges
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge tone="brand">Brand</Badge>
              <Badge tone="success">Success</Badge>
              <Badge tone="warning">Warning</Badge>
              <Badge tone="danger">Danger</Badge>
              <Badge tone="neutral">Neutral</Badge>
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-ink-100 p-4 dark:border-ink-700">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">
              Input
            </p>
            <Input placeholder="Sample input field" />
          </div>

          <div className="space-y-3 rounded-xl border border-ink-100 p-4 dark:border-ink-700">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">
              Typography
            </p>
            <h1 className="text-3xl font-extrabold text-ink-900 dark:text-ink-100">
              Display headline
            </h1>
            <h2 className="text-xl font-bold text-ink-900 dark:text-ink-100">
              Section title
            </h2>
            <p className="text-sm text-ink-700 dark:text-ink-100">
              Body copy paragraph with <strong>strong text</strong> and a{' '}
              <a href="#" className="text-brand-600 hover:underline">
                link example
              </a>
              .
            </p>
            <p className="text-xs text-ink-500">Caption / helper text.</p>
          </div>
        </div>
      </section>
    </div>
  );
};
