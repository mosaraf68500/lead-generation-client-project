import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from '@/utils';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, hasError, children, ...rest }, ref) => (
    <select
      ref={ref}
      className={cn(
        'h-11 w-full rounded-2xl border bg-white px-3 text-sm text-ink-900 transition focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-60 dark:bg-ink-900 dark:text-ink-100',
        hasError ? 'border-red-400 focus:ring-red-500' : 'border-ink-100 dark:border-ink-700',
        className,
      )}
      {...rest}
    >
      {children}
    </select>
  ),
);

Select.displayName = 'Select';
