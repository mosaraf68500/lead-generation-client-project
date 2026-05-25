import type { ReactNode } from 'react';
import { Label } from '@/components/ui/Label';
import { cn } from '@/utils';

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

export const FormField = ({ label, htmlFor, error, hint, required, className, children }: FormFieldProps) => (
  <div className={cn('space-y-1.5', className)}>
    <Label htmlFor={htmlFor}>
      {label}
      {required && <span className="ml-1 text-red-500">*</span>}
    </Label>
    {children}
    {error ? (
      <p className="text-xs font-medium text-red-600">{error}</p>
    ) : hint ? (
      <p className="text-xs text-ink-500">{hint}</p>
    ) : null}
  </div>
);
