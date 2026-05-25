import { cn } from '@/utils';

interface MiniBarChartProps {
  data: Array<{ label: string; value: number }>;
  className?: string;
  /** Vertical bar height in tailwind classes. */
  barHeight?: string;
}

/**
 * Lightweight zero-dependency bar chart. Renders an SVG so it stays crisp
 * at any size and is friendly to dark mode + theming.
 */
export const MiniBarChart = ({ data, className, barHeight = 'h-32' }: MiniBarChartProps) => {
  if (data.length === 0) {
    return (
      <div className={cn('flex items-center justify-center text-xs text-ink-500', barHeight)}>
        Not enough data yet
      </div>
    );
  }
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <div className={cn('flex items-end gap-1', barHeight, className)}>
      {data.map((d) => {
        const pct = Math.round((d.value / max) * 100);
        return (
          <div key={d.label} className="group flex flex-1 flex-col items-center justify-end">
            <div className="relative w-full overflow-hidden rounded-t-sm bg-ink-100 dark:bg-ink-700">
              <div
                className="w-full rounded-t-sm bg-brand-500 transition-all"
                style={{ height: `${Math.max(pct, 4)}%`, minHeight: 4 }}
                title={`${d.label}: ${d.value}`}
              />
            </div>
            <span className="mt-1 truncate text-[10px] text-ink-500" title={d.label}>
              {d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};
