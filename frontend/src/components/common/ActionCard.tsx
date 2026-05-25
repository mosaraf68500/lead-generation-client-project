import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/utils';

type Tone = 'brand' | 'amber' | 'red' | 'accent';

interface ActionCardProps {
  /** Headline value (e.g. "12", "85%"). */
  value: string | number;
  /** Short label under the value. */
  label: string;
  /** Optional small icon shown to the left. */
  icon?: LucideIcon;
  /** Visual emphasis colour for the value + icon. */
  tone?: Tone;
  /** Internal link the whole card / arrow navigates to. */
  href: string;
}

const toneStyles: Record<Tone, { value: string; icon: string }> = {
  brand: { value: 'text-brand-700 dark:text-brand-200', icon: 'bg-brand-100 text-brand-700 dark:bg-brand-700/30' },
  amber: { value: 'text-amber-600', icon: 'bg-amber-100 text-amber-700' },
  red: { value: 'text-red-600', icon: 'bg-red-100 text-red-700' },
  accent: { value: 'text-accent-600', icon: 'bg-accent-500/10 text-accent-600' },
};

/**
 * "ShopBangla-style" mid-row action card. Big tone-coloured number on the
 * left, label under it, and a circular arrow chevron on the right that
 * links to the related management surface (e.g. Pending leads → /admin/leads
 * with ?status=new applied).
 */
export const ActionCard = ({ value, label, icon: Icon, tone = 'brand', href }: ActionCardProps) => {
  const styles = toneStyles[tone];
  return (
    <Link
      href={href}
      className="group flex items-center justify-between gap-4 rounded-2xl border border-ink-100 bg-white px-5 py-4 transition hover:border-brand-300 dark:border-ink-700 dark:bg-ink-900"
    >
      <div className="flex items-center gap-4">
        {Icon && (
          <span className={cn('inline-flex h-10 w-10 items-center justify-center rounded-xl', styles.icon)}>
            <Icon className="h-5 w-5" />
          </span>
        )}
        <div>
          <p className={cn('text-2xl font-extrabold leading-none', styles.value)}>{value}</p>
          <p className="mt-1 text-sm text-ink-500">{label}</p>
        </div>
      </div>
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-ink-100 text-ink-500 transition group-hover:border-brand-300 group-hover:text-brand-700 dark:border-ink-700 dark:text-ink-100">
        <ArrowRight className="h-4 w-4" />
      </span>
    </Link>
  );
};
