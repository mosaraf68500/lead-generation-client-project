import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/utils';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, hasError, rows = 4, ...rest }, ref) => (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(
        'w-full rounded-2xl border bg-white px-4 py-3 text-sm text-ink-900 placeholder:text-ink-300 transition focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-60 dark:bg-ink-900 dark:text-ink-100 dark:placeholder:text-ink-500',
        hasError ? 'border-red-400 focus:ring-red-500' : 'border-ink-100 dark:border-ink-700',
        className,
      )}
      {...rest}
    />
  ),
);

Textarea.displayName = 'Textarea';
