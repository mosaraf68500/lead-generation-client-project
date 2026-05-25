import Link from 'next/link';
import { ArrowUpRight, BarChart3, Flame, Star, TrendingUp } from 'lucide-react';
import { LeadFunnel } from '@/components/common/LeadFunnel';
import { MiniBarChart } from '@/components/common/MiniBarChart';
import type { LeadAnalytics } from '@/services/leads';
import type { CourseAnalytics } from '@/services/courses';

interface AnalyticsPanelProps {
  leadAnalytics: LeadAnalytics | null;
  courseAnalytics: CourseAnalytics | null;
}

const SectionCard = ({
  title,
  hint,
  icon,
  action,
  children,
}: {
  title: string;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  action?: React.ReactNode;
  children: React.ReactNode;
}) => {
  const Icon = icon;
  return (
    <article className="rounded-3xl border border-ink-100 bg-white p-5 shadow-card dark:border-ink-700 dark:bg-ink-900">
      <header className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-700/30 dark:text-brand-200">
            <Icon className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-ink-900 dark:text-ink-100">{title}</h3>
            {hint && <p className="text-xs text-ink-500">{hint}</p>}
          </div>
        </div>
        {action}
      </header>
      {children}
    </article>
  );
};

export const AnalyticsPanel = ({ leadAnalytics, courseAnalytics }: AnalyticsPanelProps) => {
  const last14 = (leadAnalytics?.byDay ?? []).slice(-14).map((d) => ({
    label: d.date.slice(5),
    value: d.count,
  }));

  return (
    <section className="grid gap-5 lg:grid-cols-2">
      {/* Lead funnel */}
      <SectionCard
        title="Lead funnel"
        hint={`${leadAnalytics?.conversionRate ?? 0}% conversion`}
        icon={TrendingUp}
        action={
          <Link
            href="/admin/leads"
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-800"
          >
            Inbox <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        }
      >
        {leadAnalytics ? (
          <LeadFunnel
            newCount={leadAnalytics.newCount}
            contacted={leadAnalytics.contactedCount}
            inProgress={leadAnalytics.inProgressCount}
            enrolled={leadAnalytics.enrolledCount}
          />
        ) : (
          <p className="text-xs text-ink-500">No data yet.</p>
        )}
      </SectionCard>

      {/* Leads over time */}
      <SectionCard title="Leads over the last 14 days" icon={BarChart3}>
        <MiniBarChart data={last14} />
      </SectionCard>

      {/* Top sources */}
      <SectionCard title="Top lead sources" hint="Where your inbound is coming from" icon={Flame}>
        {leadAnalytics && leadAnalytics.bySource.length > 0 ? (
          <ul className="space-y-2">
            {leadAnalytics.bySource.map((row) => {
              const total = leadAnalytics.total || 1;
              const pct = Math.round((row.count / total) * 100);
              return (
                <li key={row.source} className="text-xs text-ink-500">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-ink-700 dark:text-ink-100">{row.source}</span>
                    <span>{row.count} ({pct}%)</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-ink-100 dark:bg-ink-700">
                    <div className="h-full bg-brand-500" style={{ width: `${Math.max(pct, 4)}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-xs text-ink-500">No source attribution yet.</p>
        )}
      </SectionCard>

      {/* Top courses */}
      <SectionCard
        title="Top courses"
        hint={
          courseAnalytics
            ? `${courseAnalytics.totalEnrollments.toLocaleString()} total enrollments`
            : ''
        }
        icon={Star}
        action={
          <Link
            href="/admin/courses"
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-800"
          >
            Catalog <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        }
      >
        {courseAnalytics && courseAnalytics.topCourses.length > 0 ? (
          <ul className="divide-y divide-ink-100 dark:divide-ink-700">
            {courseAnalytics.topCourses.map((course) => (
              <li key={course.id} className="flex items-center justify-between py-2 text-sm">
                <Link
                  href={`/course/${course.slug}`}
                  className="truncate font-medium text-ink-900 hover:text-brand-700 dark:text-ink-100"
                >
                  {course.title}
                </Link>
                <div className="ml-3 flex shrink-0 items-center gap-3 text-xs text-ink-500">
                  <span className="inline-flex items-center gap-1">
                    <Star className="h-3 w-3 text-amber-500" />
                    {course.ratingAvg.toFixed(1)}
                  </span>
                  <span>{course.enrollmentsCount.toLocaleString()} students</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-ink-500">No courses yet.</p>
        )}
      </SectionCard>
    </section>
  );
};
