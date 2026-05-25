import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const baseStyles =
  'inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60';

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-brand-600 text-white shadow-card hover:bg-brand-700 hover:shadow-cardHover active:translate-y-px',
  secondary:
    'bg-ink-900 text-white hover:bg-ink-700 shadow-card hover:shadow-cardHover',
  ghost:
    'bg-transparent text-ink-700 hover:bg-ink-100 dark:text-ink-100 dark:hover:bg-ink-700',
  danger:
    'bg-red-600 text-white hover:bg-red-700 shadow-card',
  outline:
    'border border-ink-100 bg-white text-ink-700 hover:border-brand-300 hover:text-brand-600 dark:bg-ink-900 dark:border-ink-700 dark:text-ink-100',
};

const sizeStyles: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = 'primary', size = 'md', isLoading, leftIcon, rightIcon, children, disabled, ...rest },
    ref,
  ) => (
    <button
      ref={ref}
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading ? (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden
        />
      ) : (
        leftIcon
      )}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </button>
  ),
);

Button.displayName = 'Button';
