import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
  /** Optional icon shown on the left side of the input. */
  leftIcon?: ReactNode;
  /** Optional element (icon button, badge, etc.) on the right side. */
  rightSlot?: ReactNode;
  /** Use a flatter, light-gray field style (used on the auth pages). */
  variant?: 'default' | 'filled';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, hasError, leftIcon, rightSlot, variant = 'default', ...rest }, ref) => {
    const hasLeft = Boolean(leftIcon);
    const hasRight = Boolean(rightSlot);

    const baseField = cn(
      'h-12 w-full text-sm text-ink-900 placeholder:text-ink-300 transition focus:outline-none focus:ring-2 disabled:opacity-60 dark:text-ink-100 dark:placeholder:text-ink-500',
      hasLeft ? 'pl-10' : 'pl-4',
      hasRight ? 'pr-11' : 'pr-4',
    );

    const variantClasses =
      variant === 'filled'
        ? cn(
            'rounded-xl border',
            'bg-surface-muted dark:bg-ink-900',
            hasError
              ? 'border-red-400 focus:ring-red-200'
              : 'border-ink-100 focus:border-brand-500 focus:ring-brand-100 dark:border-ink-700',
          )
        : cn(
            'rounded-2xl border bg-white dark:bg-ink-900',
            hasError ? 'border-red-400 focus:ring-red-500' : 'border-ink-100 focus:ring-brand-500 dark:border-ink-700',
          );

    if (!hasLeft && !hasRight) {
      // Plain input — keep the simple structure so consumers can still pass
      // className for layout (e.g. CourseFilters search input).
      return (
        <input
          ref={ref}
          className={cn(baseField, variantClasses, 'h-11', className)}
          {...rest}
        />
      );
    }

    return (
      <div className="relative">
        {leftIcon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-500">
            {leftIcon}
          </span>
        )}
        <input ref={ref} className={cn(baseField, variantClasses, className)} {...rest} />
        {rightSlot && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2">{rightSlot}</span>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
