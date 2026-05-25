import type { LabelHTMLAttributes } from 'react';
import { cn } from '@/utils';

export const Label = ({ className, children, ...rest }: LabelHTMLAttributes<HTMLLabelElement>) => (
  <label
    className={cn('block text-sm font-semibold text-ink-900 dark:text-ink-100', className)}
    {...rest}
  >
    {children}
  </label>
);
