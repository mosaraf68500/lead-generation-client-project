import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/common/StatCard';
import { ActionCard } from '@/components/common/ActionCard';
import { AnalyticsPanel } from '@/components/common/AnalyticsPanel';
import { requireSessionRole } from '@/services/session';
import { fetchUsers } from '@/services/users';
import { fetchLeadAnalytics } from '@/services/leads';
import { fetchCourseAnalytics } from '@/services/courses';
import {
  ShieldCheck,
  Users,
  UserCog,
  Crown,
  Activity,
  Inbox,
  GraduationCap,
  AlertOctagon,
} from 'lucide-react';
import { RoleAssignmentTable } from './RoleAssignmentTable';

export const dynamic = 'force-dynamic';

const formatToday = (): string =>
  new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const SuperAdminPage = async () => {
  await requireSessionRole('super_admin');

  const today = formatToday();
  const kicker = `Today · ${today}`;

  const [{ users, meta }, leadAnalytics, courseAnalytics] = await Promise.all([
    fetchUsers({ limit: 100 }),
    fetchLeadAnalytics(),
    fetchCourseAnalytics(),
  ]);

  const counts = users.reduce<Record<string, number>>((acc, u) => {
    acc[u.role] = (acc[u.role] ?? 0) + 1;
    return acc;
  }, {});

  const conversionRate = leadAnalytics?.conversionRate ?? 0;
  const newLeads = leadAnalytics?.newCount ?? 0;
  const enrolled = leadAnalytics?.enrolledCount ?? 0;

  return (
    <DashboardLayout
      title="Dashboard"
      overview={`Overview for Today (${today})`}
      subtitle="Full system access — roles, analytics and platform health."
    >
      {/* ── KPI strip ────────────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard
          icon={Users}
          label="Total users"
          value={meta?.total ?? users.length}
          kicker={kicker}
          tone="brand"
        />
        <StatCard
          icon={Crown}
          label="Super admins"
          value={counts.super_admin ?? 0}
          kicker="System"
          tone="warning"
        />
        <StatCard
          icon={ShieldCheck}
          label="Admins"
          value={counts.admin ?? 0}
          kicker="System"
          tone="accent"
        />
        <StatCard
          icon={UserCog}
          label="Staff"
          value={counts.staff ?? 0}
          kicker="System"
          tone="neutral"
        />
        <StatCard
          icon={Activity}
          label="Conversion rate"
          value={`${conversionRate}%`}
          kicker={kicker}
          tone="brand"
        />
      </div>

      {/* ── Action cards ─────────────────────────────────────────── */}
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <ActionCard
          icon={AlertOctagon}
          value={newLeads}
          label="Pending follow-ups"
          tone="amber"
          href="/admin/leads?status=new"
        />
        <ActionCard
          icon={Inbox}
          value={leadAnalytics?.total ?? 0}
          label="Total leads (all time)"
          tone="brand"
          href="/admin/leads"
        />
        <ActionCard
          icon={GraduationCap}
          value={enrolled}
          label="Enrolled students"
          tone="accent"
          href="/admin/leads?status=enrolled"
        />
      </div>

      {/* ── Platform analytics ──────────────────────────────────── */}
      <section className="mt-10">
        <h2 className="mb-3 text-lg font-semibold text-ink-900 dark:text-ink-100">
          Platform-wide analytics
        </h2>
        <AnalyticsPanel leadAnalytics={leadAnalytics} courseAnalytics={courseAnalytics} />
      </section>

      {/* ── Role assignment ─────────────────────────────────────── */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold text-ink-900 dark:text-ink-100">Role assignment</h2>
        <p className="mt-1 text-sm text-ink-500">
          Change a user&apos;s role at any time. Changes apply immediately.
        </p>
        <div className="mt-4">
          <RoleAssignmentTable initialUsers={users} />
        </div>
      </section>
    </DashboardLayout>
  );
};

export default SuperAdminPage;
