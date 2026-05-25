import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils';

type Tone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger';

const toneStyles: Record<Tone, string> = {
  neutral: 'bg-ink-100 text-ink-700 dark:bg-ink-700 dark:text-ink-100',
  brand: 'bg-brand-100 text-brand-700 dark:bg-brand-700/30 dark:text-brand-200',
  success: 'bg-accent-500/10 text-accent-600',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-700',
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  children: ReactNode;
}

export const Badge = ({ tone = 'neutral', className, children, ...rest }: BadgeProps) => (
  <span
    className={cn(
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide',
      toneStyles[tone],
      className,
    )}
    {...rest}
  >
    {children}
  </span>
);
