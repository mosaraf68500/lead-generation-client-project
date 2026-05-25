import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState = ({ icon: Icon, title, description, action }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-ink-100 bg-white px-6 py-16 text-center dark:border-ink-700 dark:bg-ink-900">
    {Icon && (
      <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-ink-100 text-ink-500 dark:bg-ink-700">
        <Icon className="h-6 w-6" />
      </div>
    )}
    <h3 className="text-lg font-semibold text-ink-900 dark:text-ink-100">{title}</h3>
    {description && <p className="mt-2 max-w-md text-sm text-ink-500">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);
