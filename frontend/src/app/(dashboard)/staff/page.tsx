import Link from 'next/link';
import {
  Inbox,
  GraduationCap,
  TrendingUp,
  MessageSquare,
  PhoneCall,
  AlertOctagon,
  Sparkles,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/common/StatCard';
import { ActionCard } from '@/components/common/ActionCard';
import { Button } from '@/components/ui/Button';
import { AnalyticsPanel } from '@/components/common/AnalyticsPanel';
import { Badge } from '@/components/ui/Badge';
import { requireSessionRole } from '@/services/session';
import { fetchLeads, fetchLeadAnalytics } from '@/services/leads';
import { fetchCourses, fetchCourseAnalytics } from '@/services/courses';
import { formatDate } from '@/utils';
import { LEAD_STATUS_META } from '@/types';

export const dynamic = 'force-dynamic';

const formatToday = (): string =>
  new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const StaffDashboard = async () => {
  await requireSessionRole('staff', 'admin');

  const today = formatToday();
  const kicker = `Today · ${today}`;

  const [{ leads, meta: leadsMeta }, { meta: coursesMeta }, leadAnalytics, courseAnalytics] =
    await Promise.all([
      fetchLeads({ limit: 8, status: 'new' }),
      fetchCourses({ limit: 1 }),
      fetchLeadAnalytics(),
      fetchCourseAnalytics(),
    ]);

  const newCount = leadAnalytics?.newCount ?? 0;
  const contactedCount = leadAnalytics?.contactedCount ?? 0;
  const inProgressCount = leadAnalytics?.inProgressCount ?? 0;
  const conversionRate = leadAnalytics?.conversionRate ?? 0;

  return (
    <DashboardLayout
      title="Dashboard"
      overview={`Overview for Today (${today})`}
      subtitle="Triage incoming leads, respond on WhatsApp, and qualify the pipeline."
      actions={
        <Link href="/admin/leads">
          <Button leftIcon={<Inbox className="h-4 w-4" />}>Open lead inbox</Button>
        </Link>
      }
    >
      {/* ── KPI strip ─────────────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Inbox}
          label="Total leads"
          value={leadsMeta?.total ?? 0}
          kicker={kicker}
          tone="brand"
        />
        <StatCard
          icon={MessageSquare}
          label="Awaiting reply"
          value={newCount}
          kicker={kicker}
          tone="warning"
          hint="Status = new"
        />
        <StatCard
          icon={GraduationCap}
          label="Active courses"
          value={coursesMeta?.total ?? 0}
          kicker="Catalog"
          tone="neutral"
        />
        <StatCard
          icon={TrendingUp}
          label="Conversion rate"
          value={`${conversionRate}%`}
          kicker={kicker}
          hint="Across all sources"
          tone="accent"
        />
      </div>

      {/* ── Action cards row ─────────────────────────────────────── */}
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
          value={inProgressCount}
          label="In progress (call scheduled)"
          tone="brand"
          href="/admin/leads?status=in_progress"
        />
      </div>

      {/* ── Awaiting reply queue ─────────────────────────────────── */}
      <section className="mt-10">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="text-lg font-semibold text-ink-900 dark:text-ink-100">
              Awaiting your first reply
            </h2>
            <p className="text-sm text-ink-500">Newest leads at the top — call back within 24 hours.</p>
          </div>
          <Link href="/admin/leads" className="text-sm font-semibold text-brand-700 hover:text-brand-800">
            See all &rarr;
          </Link>
        </div>
        <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white dark:border-ink-700 dark:bg-ink-900">
          {leads.length === 0 ? (
            <p className="p-6 text-center text-sm text-ink-500">No new leads waiting. Nice work!</p>
          ) : (
            <ul className="divide-y divide-ink-100 dark:divide-ink-700">
              {leads.map((lead) => (
                <li key={lead.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink-900 dark:text-ink-100">{lead.name}</p>
                    <p className="text-xs text-ink-500">
                      {lead.email} · {lead.whatsapp ?? lead.phone}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-ink-500">
                    <Badge tone={LEAD_STATUS_META[lead.status].tone}>
                      {LEAD_STATUS_META[lead.status].label}
                    </Badge>
                    <Badge tone="brand" className="capitalize">{lead.source}</Badge>
                    <span>{formatDate(lead.createdAt)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* ── Analytics ────────────────────────────────────────────── */}
      <section className="mt-10">
        <h2 className="mb-3 text-lg font-semibold text-ink-900 dark:text-ink-100">
          Pipeline &amp; content analytics
        </h2>
        <AnalyticsPanel leadAnalytics={leadAnalytics} courseAnalytics={courseAnalytics} />
      </section>

      {/* ── Quick links ─────────────────────────────────────────── */}
      <section className="mt-10 grid gap-4 lg:grid-cols-2">
        <Link
          href="/admin/leads"
          className="block rounded-2xl border border-ink-100 bg-white p-6 transition hover:border-brand-300 dark:border-ink-700 dark:bg-ink-900"
        >
          <Inbox className="h-6 w-6 text-brand-600" />
          <h3 className="mt-3 text-lg font-semibold text-ink-900 dark:text-ink-100">Lead inbox</h3>
          <p className="mt-1 text-sm text-ink-500">
            Update status, qualify, and convert. Every status change is logged.
          </p>
        </Link>
        <Link
          href="/admin/courses"
          className="block rounded-2xl border border-ink-100 bg-white p-6 transition hover:border-brand-300 dark:border-ink-700 dark:bg-ink-900"
        >
          <GraduationCap className="h-6 w-6 text-brand-600" />
          <h3 className="mt-3 text-lg font-semibold text-ink-900 dark:text-ink-100">Course catalog</h3>
          <p className="mt-1 text-sm text-ink-500">
            Publish, edit and remove the catalog of courses available to learners.
          </p>
        </Link>
      </section>
    </DashboardLayout>
  );
};

export default StaffDashboard;
