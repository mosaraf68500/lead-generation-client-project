'use client';

/**
 * Three-button toolbar that lives in the top-right of the admin overview
 * header:
 *
 *   1. Period filter (Today / Week / Month / Year) — writes the choice into
 *      the URL as `?period=…` so the server component re-renders with the
 *      same scope when the user reloads or shares the URL.
 *   2. Refresh — triggers a Next.js soft refresh; cheaper than a full reload
 *      because cached server data + RSC payloads stay reusable.
 *   3. Download report — opens the browser print dialog. The dashboard ships
 *      with a `.print-only` summary table that materialises when printing,
 *      so users can save the result as PDF straight from the dialog.
 */

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils';
// PERIOD_OPTIONS / PeriodId live in a plain-TS sibling module so they can
// be safely imported by Server Components too (see `./period.ts`).
import { PERIOD_OPTIONS, type PeriodId } from './period';

// Re-export so existing import paths (`from './OverviewActions'`) keep
// working. Server-side consumers should import from `./period` directly.
export { PERIOD_OPTIONS };
export type { PeriodId };

export const OverviewActions = ({
  defaultPeriod = 'today',
}: {
  defaultPeriod?: PeriodId;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const currentPeriod =
    (searchParams.get('period') as PeriodId | null) ?? defaultPeriod;

  const setPeriod = (next: PeriodId) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next === 'today') params.delete('period');
    else params.set('period', next);
    const query = params.toString();
    startTransition(() => {
      router.push(query ? `${pathname}?${query}` : pathname);
    });
  };

  const refresh = () => {
    setIsRefreshing(true);
    startTransition(() => {
      router.refresh();
      // Visual cue lingers a moment so the user sees the spinner — the
      // RSC fetch usually returns faster than the eye can register.
      setTimeout(() => setIsRefreshing(false), 600);
    });
  };

  const download = () => {
    // Print stylesheet (in globals.css) reveals the `.print-only` summary
    // table and hides everything else, giving a clean printable / PDF
    // version of the dashboard.
    window.print();
  };

  return (
    <div className="no-print flex flex-wrap items-center gap-2">
      {/* 1. Period filter */}
      <div className="relative">
        <select
          value={currentPeriod}
          onChange={(e) => setPeriod(e.target.value as PeriodId)}
          aria-label="Filter period"
          className="h-10 appearance-none rounded-md border border-ink-100 bg-white pl-3 pr-8 text-sm font-semibold text-ink-700 transition focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-100"
        >
          {PERIOD_OPTIONS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-ink-400">
          ▾
        </span>
      </div>

      {/* 2. Refresh */}
      <Button
        type="button"
        variant="outline"
        onClick={refresh}
        disabled={isPending || isRefreshing}
        leftIcon={
          <RefreshCw className={cn('h-4 w-4', (isRefreshing || isPending) && 'animate-spin')} />
        }
      >
        Refresh
      </Button>

      {/* 3. Download report */}
      <Button
        type="button"
        variant="primary"
        onClick={download}
        leftIcon={<Download className="h-4 w-4" />}
      >
        Download Report
      </Button>
    </div>
  );
};
