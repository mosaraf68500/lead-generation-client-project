import { cn } from '@/utils';

export const Spinner = ({ className }: { className?: string }) => (
  <span
    role="status"
    aria-label="Loading"
    className={cn(
      'inline-block h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent',
      className,
    )}
  />
);
