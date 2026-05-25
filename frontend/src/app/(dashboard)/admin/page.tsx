import Link from 'next/link';
import {
  GraduationCap,
  Inbox,
  Users,
  BadgePercent,
  Activity,
  PhoneCall,
  Sparkles,
  AlertOctagon,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/common/StatCard';
import { ActionCard } from '@/components/common/ActionCard';
import { AnalyticsPanel } from '@/components/common/AnalyticsPanel';
import { Badge } from '@/components/ui/Badge';
import { requireSessionRole } from '@/services/session';
import { fetchLeads, fetchLeadAnalytics } from '@/services/leads';
import { fetchCourses, fetchCourseAnalytics } from '@/services/courses';
import { fetchUsers } from '@/services/users';
import { formatDate } from '@/utils';
import { LEAD_STATUS_META } from '@/types';
import { OverviewActions, PERIOD_OPTIONS, type PeriodId } from './OverviewActions';

export const dynamic = 'force-dynamic';

const formatToday = (): string =>
  new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

/**
 * Resolve the period filter coming back from the URL into:
 *   - a label for the kicker text
 *   - a Date threshold used to count "in-period" leads
 *
 * `today` (default) → since midnight local time
 * `week`            → since Monday 00:00
 * `month`           → since the 1st of the current month
 * `year`            → since Jan 1st of the current year
 */
const resolvePeriod = (raw: string | undefined) => {
  const id: PeriodId = (PERIOD_OPTIONS.find((p) => p.id === raw)?.id ?? 'today') as PeriodId;
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  if (id === 'week') {
    const dow = start.getDay() || 7;
    start.setDate(start.getDate() - (dow - 1));
  } else if (id === 'month') {
    start.setDate(1);
  } else if (id === 'year') {
    start.setMonth(0, 1);
  }
  const label = PERIOD_OPTIONS.find((p) => p.id === id)?.label ?? 'Today';
  return { id, start, label };
};

interface PageProps {
  searchParams?: { period?: string };
}

const AdminDashboard = async ({ searchParams }: PageProps) => {
  await requireSessionRole('admin');

  const today = formatToday();
  const period = resolvePeriod(searchParams?.period);
  const kicker = `${period.label} · ${today}`;

  const [
    { leads, meta: leadsMeta },
    { meta: usersMeta },
    leadAnalytics,
    courseAnalytics,
  ] = await Promise.all([
    fetchLeads({ limit: 50 }),
    fetchUsers({ limit: 1 }),
    fetchLeadAnalytics(),
    fetchCourseAnalytics(),
  ]);
  // Trigger courses fetch as a side effect for meta only.
  await fetchCourses({ limit: 1 });

  // Period-scoped slice of the leads list. The analytics endpoint already
  // returns lifetime totals — for an in-period number we count the recent
  // leads ourselves so admins can compare "today" vs "month" at a glance.
  const periodLeads = leads.filter(
    (l) => new Date(l.createdAt).getTime() >= period.start.getTime(),
  );
  const recentLeads = periodLeads.slice(0, 6);
  const periodLeadCount = periodLeads.length;
  const periodEnrolled = periodLeads.filter((l) => l.status === 'enrolled').length;
  const periodConversionRate =
    periodLeadCount > 0 ? Math.round((periodEnrolled / periodLeadCount) * 100) : 0;

  const newCount = leadAnalytics?.newCount ?? 0;
  const contactedCount = leadAnalytics?.contactedCount ?? 0;
  const conversionRate = leadAnalytics?.conversionRate ?? 0;

  return (
    <DashboardLayout
      title="Dashboard"
      overview={`Overview for ${period.label} (${today})`}
      actions={<OverviewActions defaultPeriod={period.id} />}
    >
      {/* ── Print-only summary (hidden on-screen, rendered when printed) ── */}
      <section className="print-only">
        <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 4px' }}>
          Admin overview · {period.label} · {today}
        </h2>
        <p style={{ fontSize: '12px', color: '#444', margin: '0 0 16px' }}>
          Smart Earning Pro · Generated {new Date().toLocaleString()}
        </p>

        <h3 style={{ fontSize: '14px', fontWeight: 600, margin: '12px 0 6px' }}>
          Key performance indicators ({period.label})
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr style={{ background: '#f3f4f6' }}>
              <th style={{ textAlign: 'left', border: '1px solid #d1d5db', padding: '6px 8px' }}>
                Metric
              </th>
              <th style={{ textAlign: 'right', border: '1px solid #d1d5db', padding: '6px 8px' }}>
                Value
              </th>
              <th style={{ textAlign: 'left', border: '1px solid #d1d5db', padding: '6px 8px' }}>
                Note
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #d1d5db', padding: '6px 8px' }}>Leads in period</td>
              <td style={{ border: '1px solid #d1d5db', padding: '6px 8px', textAlign: 'right' }}>
                {periodLeadCount}
              </td>
              <td style={{ border: '1px solid #d1d5db', padding: '6px 8px' }}>{period.label}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #d1d5db', padding: '6px 8px' }}>Total leads</td>
              <td style={{ border: '1px solid #d1d5db', padding: '6px 8px', textAlign: 'right' }}>
                {leadsMeta?.total ?? 0}
              </td>
              <td style={{ border: '1px solid #d1d5db', padding: '6px 8px' }}>Lifetime</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #d1d5db', padding: '6px 8px' }}>Awaiting first reply</td>
              <td style={{ border: '1px solid #d1d5db', padding: '6px 8px', textAlign: 'right' }}>
                {newCount}
              </td>
              <td style={{ border: '1px solid #d1d5db', padding: '6px 8px' }}>Status = new</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #d1d5db', padding: '6px 8px' }}>Contacted</td>
              <td style={{ border: '1px solid #d1d5db', padding: '6px 8px', textAlign: 'right' }}>
                {contactedCount}
              </td>
              <td style={{ border: '1px solid #d1d5db', padding: '6px 8px' }}>Awaiting follow-up</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #d1d5db', padding: '6px 8px' }}>In progress</td>
              <td style={{ border: '1px solid #d1d5db', padding: '6px 8px', textAlign: 'right' }}>
                {leadAnalytics?.inProgressCount ?? 0}
              </td>
              <td style={{ border: '1px solid #d1d5db', padding: '6px 8px' }}>Active conversations</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #d1d5db', padding: '6px 8px' }}>Enrolled</td>
              <td style={{ border: '1px solid #d1d5db', padding: '6px 8px', textAlign: 'right' }}>
                {leadAnalytics?.enrolledCount ?? 0}
              </td>
              <td style={{ border: '1px solid #d1d5db', padding: '6px 8px' }}>Converted</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #d1d5db', padding: '6px 8px' }}>Conversion rate</td>
              <td style={{ border: '1px solid #d1d5db', padding: '6px 8px', textAlign: 'right' }}>
                {conversionRate}%
              </td>
              <td style={{ border: '1px solid #d1d5db', padding: '6px 8px' }}>Lead → enrolled</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #d1d5db', padding: '6px 8px' }}>Published courses</td>
              <td style={{ border: '1px solid #d1d5db', padding: '6px 8px', textAlign: 'right' }}>
                {courseAnalytics?.published ?? 0}
              </td>
              <td style={{ border: '1px solid #d1d5db', padding: '6px 8px' }}>
                {courseAnalytics?.drafts ?? 0} drafts · {courseAnalytics?.onSale ?? 0} on sale
              </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #d1d5db', padding: '6px 8px' }}>Total enrolments</td>
              <td style={{ border: '1px solid #d1d5db', padding: '6px 8px', textAlign: 'right' }}>
                {(courseAnalytics?.totalEnrollments ?? 0).toLocaleString()}
              </td>
              <td style={{ border: '1px solid #d1d5db', padding: '6px 8px' }}>Across catalog</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #d1d5db', padding: '6px 8px' }}>Average rating</td>
              <td style={{ border: '1px solid #d1d5db', padding: '6px 8px', textAlign: 'right' }}>
                {courseAnalytics?.avgRating?.toFixed(1) ?? '0.0'}
              </td>
              <td style={{ border: '1px solid #d1d5db', padding: '6px 8px' }}>Weighted</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #d1d5db', padding: '6px 8px' }}>Total users</td>
              <td style={{ border: '1px solid #d1d5db', padding: '6px 8px', textAlign: 'right' }}>
                {usersMeta?.total ?? 0}
              </td>
              <td style={{ border: '1px solid #d1d5db', padding: '6px 8px' }}>All roles</td>
            </tr>
          </tbody>
        </table>

        <h3 style={{ fontSize: '14px', fontWeight: 600, margin: '20px 0 6px' }}>
          Leads captured · {period.label} ({periodLeads.length})
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr style={{ background: '#f3f4f6' }}>
              <th style={{ textAlign: 'left', border: '1px solid #d1d5db', padding: '6px 8px' }}>Name</th>
              <th style={{ textAlign: 'left', border: '1px solid #d1d5db', padding: '6px 8px' }}>Email</th>
              <th style={{ textAlign: 'left', border: '1px solid #d1d5db', padding: '6px 8px' }}>Status</th>
              <th style={{ textAlign: 'left', border: '1px solid #d1d5db', padding: '6px 8px' }}>Captured</th>
            </tr>
          </thead>
          <tbody>
            {periodLeads.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'center' }}>
                  No leads in this period.
                </td>
              </tr>
            ) : (
              periodLeads.map((lead) => (
                <tr key={lead.id}>
                  <td style={{ border: '1px solid #d1d5db', padding: '6px 8px' }}>{lead.name}</td>
                  <td style={{ border: '1px solid #d1d5db', padding: '6px 8px' }}>{lead.email}</td>
                  <td style={{ border: '1px solid #d1d5db', padding: '6px 8px' }}>
                    {LEAD_STATUS_META[lead.status].label}
                  </td>
                  <td style={{ border: '1px solid #d1d5db', padding: '6px 8px' }}>
                    {formatDate(lead.createdAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      {/* ── KPI strip ─────────────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard
          icon={Inbox}
          label="Leads in period"
          value={periodLeadCount}
          hint={`${leadsMeta?.total ?? 0} lifetime`}
          kicker={kicker}
          tone="brand"
        />
        <StatCard
          icon={PhoneCall}
          label="Awaiting first reply"
          value={newCount}
          kicker={kicker}
          tone="warning"
        />
        <StatCard
          icon={Activity}
          label="Conversion rate"
          value={`${periodConversionRate}%`}
          hint={`Lifetime: ${conversionRate}%`}
          kicker={kicker}
          tone="accent"
        />
        <StatCard
          icon={GraduationCap}
          label="Published courses"
          value={courseAnalytics?.published ?? 0}
          hint={`${courseAnalytics?.drafts ?? 0} drafts · ${courseAnalytics?.onSale ?? 0} on sale`}
          kicker="Catalog"
          tone="brand"
        />
        <StatCard
          icon={Users}
          label="Total users"
          value={usersMeta?.total ?? 0}
          kicker="All time"
          tone="neutral"
        />
      </div>

      {/* ── Action cards (ShopBangla-style mid row) ─────────────── */}
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <ActionCard
          icon={AlertOctagon}
          value={newCount}
          label="Pending follow-ups"
          tone="amber"
          href="/admin/leads?status=new"
        />
        <ActionCard
          icon={PhoneCall}
          value={contactedCount}
          label="Contacted (awaiting reply)"
          tone="red"
          href="/admin/leads?status=contacted"
        />
        <ActionCard
          icon={Sparkles}
          value={`${conversionRate}%`}
          label="Lead → Enrolled conversion"
          tone="accent"
          href="/admin/leads?status=enrolled"
        />
      </div>

      {/* ── Mini conversion summary strip ───────────────────────── */}
      <div className="mt-6 grid gap-4 rounded-2xl border border-ink-100 bg-white p-5 md:grid-cols-3 dark:border-ink-700 dark:bg-ink-900">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-ink-500">Conversion</p>
          <p className="mt-1 text-3xl font-extrabold text-ink-900 dark:text-ink-100">
            {conversionRate}%
          </p>
          <p className="text-xs text-ink-500">
            {leadAnalytics?.enrolledCount ?? 0} enrolled of {leadAnalytics?.total ?? 0}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-ink-500">Total enrollments</p>
          <p className="mt-1 text-3xl font-extrabold text-ink-900 dark:text-ink-100">
            {(courseAnalytics?.totalEnrollments ?? 0).toLocaleString()}
          </p>
          <p className="text-xs text-ink-500">All courses combined</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-ink-500">Avg. rating</p>
          <p className="mt-1 text-3xl font-extrabold text-ink-900 dark:text-ink-100">
            {courseAnalytics?.avgRating?.toFixed(1) ?? '0.0'}
          </p>
          <p className="text-xs text-ink-500">Weighted across catalog</p>
        </div>
      </div>

      {/* ── Performance / analytics ─────────────────────────────── */}
      <section className="mt-10">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-ink-900 dark:text-ink-100">Performance</h2>
          <BadgePercent className="h-5 w-5 text-brand-600" />
        </div>
        <AnalyticsPanel leadAnalytics={leadAnalytics} courseAnalytics={courseAnalytics} />
      </section>

      {/* ── Recent leads (table-style list) ─────────────────────── */}
      <section className="mt-10">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="text-lg font-semibold text-ink-900 dark:text-ink-100">
              Recent leads · {period.label.toLowerCase()}
            </h2>
            <p className="text-sm text-ink-500">
              {periodLeadCount} captured in this period · open the CRM for full detail + assignment.
            </p>
          </div>
          <Link
            href="/admin/leads?status=new"
            className="text-sm font-semibold text-brand-700 hover:text-brand-800"
          >
            Triage queue &rarr;
          </Link>
        </div>
        <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white dark:border-ink-700 dark:bg-ink-900">
          {recentLeads.length === 0 ? (
            <p className="p-6 text-center text-sm text-ink-500">
              No leads in this period.
            </p>
          ) : (
            <ul className="divide-y divide-ink-100 dark:divide-ink-700">
              {recentLeads.map((lead) => (
                <li key={lead.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink-900 dark:text-ink-100">{lead.name}</p>
                    <p className="text-xs text-ink-500">{lead.email}</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-ink-500">
                    <Badge tone={LEAD_STATUS_META[lead.status].tone}>
                      {LEAD_STATUS_META[lead.status].label}
                    </Badge>
                    <span>{formatDate(lead.createdAt)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </DashboardLayout>
  );
};

export default AdminDashboard;
