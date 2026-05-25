import type { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => (
  <div className="rounded-3xl border border-ink-100 bg-white p-6 shadow-card dark:border-ink-700 dark:bg-ink-900">
    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 text-brand-700 dark:bg-brand-700/30 dark:text-brand-200">
      <Icon className="h-6 w-6" />
    </div>
    <h3 className="text-lg font-semibold text-ink-900 dark:text-ink-100">{title}</h3>
    <p className="mt-2 text-sm text-ink-500">{description}</p>
  </div>
);
