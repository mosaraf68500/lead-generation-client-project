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
import { Button } from '@/components/ui/Button';
import { requireSessionRole } from '@/services/session';
import { fetchLeads, fetchLeadAnalytics } from '@/services/leads';
import { fetchCourses, fetchCourseAnalytics } from '@/services/courses';
import { fetchUsers } from '@/services/users';
import { formatDate } from '@/utils';
import { LEAD_STATUS_META } from '@/types';

export const dynamic = 'force-dynamic';

const formatToday = (): string =>
  new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const AdminDashboard = async () => {
  await requireSessionRole('admin');

  const today = formatToday();
  const kicker = `Today · ${today}`;

  const [
    { leads, meta: leadsMeta },
    { meta: usersMeta },
    leadAnalytics,
    courseAnalytics,
  ] = await Promise.all([
    fetchLeads({ limit: 6 }),
    fetchUsers({ limit: 1 }),
    fetchLeadAnalytics(),
    fetchCourseAnalytics(),
  ]);
  // Trigger courses fetch as a side effect for meta only.
  await fetchCourses({ limit: 1 });

  const newCount = leadAnalytics?.newCount ?? 0;
  const contactedCount = leadAnalytics?.contactedCount ?? 0;
  const conversionRate = leadAnalytics?.conversionRate ?? 0;

  return (
    <DashboardLayout
      title="Dashboard"
      overview={`Overview for Today (${today})`}
      subtitle="Operational pulse for leads, courses and team activity."
      actions={
        <>
          <Link
            href="/admin/leads"
            className="inline-flex h-10 items-center gap-2 rounded-md border border-ink-100 px-4 text-sm font-semibold text-ink-700 transition hover:border-brand-300 hover:text-brand-700 dark:border-ink-700 dark:text-ink-100"
          >
            <Inbox className="h-4 w-4" /> Open inbox
          </Link>
          <Link href="/admin/leads">
            <Button variant="primary" leftIcon={<Activity className="h-4 w-4" />}>
              Lead CRM
            </Button>
          </Link>
        </>
      }
    >
      {/* ── KPI strip ─────────────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard
          icon={Inbox}
          label="Total leads"
          value={leadsMeta?.total ?? 0}
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
          value={`${conversionRate}%`}
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
          <h2 className="text-lg font-semibold text-ink-900 dark:text-ink-100">Recent leads</h2>
          <Link
            href="/admin/leads"
            className="text-sm font-semibold text-brand-700 hover:text-brand-800"
          >
            See all &rarr;
          </Link>
        </div>
        <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white dark:border-ink-700 dark:bg-ink-900">
          {leads.length === 0 ? (
            <p className="p-6 text-center text-sm text-ink-500">No leads captured yet.</p>
          ) : (
            <ul className="divide-y divide-ink-100 dark:divide-ink-700">
              {leads.map((lead) => (
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
