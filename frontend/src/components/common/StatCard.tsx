import type { LucideIcon } from 'lucide-react';
import { cn } from '@/utils';

type Tone = 'brand' | 'accent' | 'neutral' | 'warning';

interface StatCardProps {
  label: string;
  value: string | number;
  /** Small line under the value (e.g. "18 active in catalog"). */
  hint?: string;
  icon?: LucideIcon;
  tone?: Tone;
  /** Small label rendered at the top-right of the card (e.g. "Today (May 26)"). */
  kicker?: string;
}

const toneStyles: Record<Tone, string> = {
  brand: 'bg-brand-100 text-brand-700 dark:bg-brand-700/30 dark:text-brand-200',
  accent: 'bg-accent-500/10 text-accent-600',
  warning: 'bg-amber-100 text-amber-700',
  neutral: 'bg-ink-100 text-ink-700 dark:bg-ink-700 dark:text-ink-100',
};

/**
 * KPI card used across every dashboard overview. Ships in two visual styles
 * depending on whether a `kicker` (top-right context label) is supplied:
 *
 *   - Without kicker → classic side-by-side icon + value layout.
 *   - With kicker    → ShopBangla-style stacked layout where the icon sits
 *     top-left, the kicker sits top-right, and the value spans the full
 *     width below.
 */
export const StatCard = ({ label, value, hint, icon: Icon, tone = 'brand', kicker }: StatCardProps) => {
  if (kicker) {
    return (
      <div className="rounded-2xl border border-ink-100 bg-white p-5 dark:border-ink-700 dark:bg-ink-900">
        <div className="flex items-start justify-between gap-3">
          {Icon && (
            <span
              className={cn(
                'inline-flex h-10 w-10 items-center justify-center rounded-xl',
                toneStyles[tone],
              )}
            >
              <Icon className="h-5 w-5" />
            </span>
          )}
          <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">
            {kicker}
          </span>
        </div>
        <p className="mt-4 text-3xl font-extrabold leading-none text-ink-900 dark:text-ink-100">
          {value}
        </p>
        <p className="mt-2 text-xs font-medium text-ink-500">{label}</p>
        {hint && <p className="mt-0.5 text-[11px] text-ink-300">{hint}</p>}
      </div>
    );
  }

  return (
    <div className="flex items-start gap-4 rounded-2xl border border-ink-100 bg-white p-5 dark:border-ink-700 dark:bg-ink-900">
      {Icon && (
        <div className={cn('inline-flex h-12 w-12 items-center justify-center rounded-2xl', toneStyles[tone])}>
          <Icon className="h-6 w-6" />
        </div>
      )}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">{label}</p>
        <p className="mt-1 text-2xl font-bold text-ink-900 dark:text-ink-100">{value}</p>
        {hint && <p className="mt-1 text-xs text-ink-500">{hint}</p>}
      </div>
    </div>
  );
};
