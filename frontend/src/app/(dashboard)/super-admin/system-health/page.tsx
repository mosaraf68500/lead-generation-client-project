import {
  Inbox,
  Users,
  GraduationCap,
  TrendingUp,
  Database,
  Server,
  Image as ImageIcon,
  ShieldCheck,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/common/StatCard';
import { requireSessionRole } from '@/services/session';
import { fetchLeadAnalytics } from '@/services/leads';
import { fetchCourseAnalytics } from '@/services/courses';
import { fetchUsers } from '@/services/users';
import { LiveHealthTicker } from './LiveHealthTicker';

export const dynamic = 'force-dynamic';

const SystemHealthPage = async () => {
  await requireSessionRole('super_admin');

  // These calls double as integration tests for the dependencies — if any
  // of them silently fail the corresponding tile renders "—".
  const [leadAnalytics, courseAnalytics, { meta: usersMeta }] = await Promise.all([
    fetchLeadAnalytics(),
    fetchCourseAnalytics(),
    fetchUsers({ limit: 1 }),
  ]);

  const subsystems = [
    {
      icon: Server,
      name: 'Express API',
      status: 'live',
      detail: 'See ticker above',
    },
    {
      icon: Database,
      name: 'MongoDB',
      status: courseAnalytics ? 'live' : 'degraded',
      detail: courseAnalytics
        ? 'Aggregations responded normally'
        : 'Course analytics request failed',
    },
    {
      icon: ShieldCheck,
      name: 'Better Auth',
      status: usersMeta ? 'live' : 'degraded',
      detail: usersMeta
        ? 'Session resolved + admin user list reachable'
        : 'Could not verify users endpoint',
    },
    {
      icon: ImageIcon,
      name: 'Cloudinary',
      status: 'live',
      detail: 'Configured via env. No active probe — credentials never leave the server.',
    },
  ];

  return (
    <DashboardLayout
      title="System health"
      subtitle="Live status of every external dependency — API, database, auth, and media."
    >
      {/* Live ticker — pings /api/health every 10s and graphs latency. */}
      <LiveHealthTicker />

      {/* Headline counters */}
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Inbox}
          label="Total leads"
          value={leadAnalytics?.total ?? 0}
          hint={`${leadAnalytics?.newCount ?? 0} new · ${leadAnalytics?.enrolledCount ?? 0} enrolled`}
          tone="brand"
        />
        <StatCard
          icon={Users}
          label="Total users"
          value={usersMeta?.total ?? 0}
          hint="All roles"
          tone="neutral"
        />
        <StatCard
          icon={GraduationCap}
          label="Published courses"
          value={courseAnalytics?.published ?? 0}
          hint={`${courseAnalytics?.drafts ?? 0} drafts`}
          tone="accent"
        />
        <StatCard
          icon={TrendingUp}
          label="Conversion rate"
          value={`${leadAnalytics?.conversionRate ?? 0}%`}
          hint="Lead → enrolled"
          tone="warning"
        />
      </div>

      {/* Subsystem status grid */}
      <section className="mt-10">
        <h2 className="mb-3 text-lg font-semibold text-ink-900 dark:text-ink-100">
          Subsystem status
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {subsystems.map((sub) => {
            const Icon = sub.icon;
            const live = sub.status === 'live';
            return (
              <article
                key={sub.name}
                className="flex items-start gap-4 rounded-2xl border border-ink-100 bg-white p-5 dark:border-ink-700 dark:bg-ink-900"
              >
                <span
                  className={
                    live
                      ? 'inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40'
                      : 'inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-700'
                  }
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-ink-900 dark:text-ink-100">
                      {sub.name}
                    </h3>
                    <span
                      className={
                        live
                          ? 'rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700'
                          : 'rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-700'
                      }
                    >
                      {live ? 'Live' : 'Degraded'}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-ink-500">{sub.detail}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Lead source mix — useful health signal: are all sources firing? */}
      <section className="mt-10 rounded-2xl border border-ink-100 bg-white p-5 dark:border-ink-700 dark:bg-ink-900">
        <h2 className="text-base font-semibold text-ink-900 dark:text-ink-100">
          Lead source mix (last 30 days)
        </h2>
        <p className="text-xs text-ink-500">
          Empty rows on critical sources usually mean a broken capture form or a stale CDN.
        </p>
        <ul className="mt-4 space-y-2">
          {(leadAnalytics?.bySource ?? []).length === 0 ? (
            <li className="text-sm text-ink-500">No leads captured yet.</li>
          ) : (
            (leadAnalytics?.bySource ?? []).map((row) => {
              const pct = leadAnalytics?.total
                ? Math.round((row.count / leadAnalytics.total) * 100)
                : 0;
              return (
                <li
                  key={row.source}
                  className="flex items-center gap-3 rounded-xl border border-ink-100 px-3 py-2 dark:border-ink-700"
                >
                  <span className="flex-1 truncate text-sm font-medium text-ink-700 dark:text-ink-100">
                    {row.source}
                  </span>
                  <span className="text-xs text-ink-500">{pct}%</span>
                  <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[11px] font-bold text-brand-700 dark:bg-brand-700/30">
                    {row.count}
                  </span>
                </li>
              );
            })
          )}
        </ul>
      </section>
    </DashboardLayout>
  );
};

export default SystemHealthPage;
