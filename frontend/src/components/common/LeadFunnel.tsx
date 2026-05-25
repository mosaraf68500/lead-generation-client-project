import { cn } from '@/utils';

interface LeadFunnelProps {
  newCount: number;
  contacted: number;
  inProgress: number;
  enrolled: number;
}

type StageKey = 'newCount' | 'contacted' | 'inProgress' | 'enrolled';

const STAGES: Array<{ key: StageKey; label: string }> = [
  { key: 'newCount', label: 'New' },
  { key: 'contacted', label: 'Contacted' },
  { key: 'inProgress', label: 'In progress' },
  { key: 'enrolled', label: 'Enrolled' },
];

/**
 * Pure-CSS funnel visualisation. Each stage's width is proportional to the
 * count, and the tip turns brand-green to highlight enrolments.
 */
export const LeadFunnel = (props: LeadFunnelProps) => {
  const max = Math.max(1, props.newCount, props.contacted, props.inProgress, props.enrolled);
  return (
    <div className="space-y-2">
      {STAGES.map((stage, idx) => {
        const value = props[stage.key];
        const pct = Math.round((value / max) * 100);
        const tone =
          stage.key === 'enrolled'
            ? 'bg-brand-500'
            : stage.key === 'inProgress'
              ? 'bg-amber-400'
              : stage.key === 'contacted'
                ? 'bg-brand-300'
                : 'bg-ink-300';
        return (
          <div key={stage.key} className="flex items-center gap-3">
            <span className="w-24 shrink-0 text-xs font-semibold uppercase tracking-wider text-ink-500">
              {stage.label}
            </span>
            <div className="relative h-6 flex-1 overflow-hidden rounded-full bg-ink-100 dark:bg-ink-700">
              <div
                className={cn('h-full rounded-full transition-all', tone)}
                style={{ width: `${Math.max(pct, 4)}%` }}
              />
              <span
                className={cn(
                  'absolute inset-0 inline-flex items-center justify-end pr-3 text-[11px] font-bold',
                  pct > 25 ? 'text-white' : 'text-ink-700 dark:text-ink-100',
                )}
              >
                {value.toLocaleString()}
              </span>
            </div>
            <span className="w-12 shrink-0 text-right text-xs text-ink-500">
              {idx === 0 ? '100%' : `${Math.round((value / Math.max(1, props.newCount)) * 100)}%`}
            </span>
          </div>
        );
      })}
    </div>
  );
};
