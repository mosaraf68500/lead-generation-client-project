import Link from 'next/link';
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
  Settings,
  Radar,
  Palette,
  Megaphone,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { RoleAssignmentTable } from './RoleAssignmentTable';

export const dynamic = 'force-dynamic';

const formatToday = (): string =>
  new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const SuperAdminPage = async () => {
  const user = await requireSessionRole('super_admin');

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
      title="Super-admin dashboard"
      overview={`Overview for Today (${today})`}
      subtitle="Full system access — roles, analytics and platform health."
      actions={
        <Link href="/super-admin/settings">
          <Button variant="outline" leftIcon={<Settings className="h-4 w-4" />}>
            System settings
          </Button>
        </Link>
      }
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

      {/* ── Owner tools (jump links to /super-admin/* pages) ────── */}
      <section className="mt-10">
        <div className="mb-3 flex items-end justify-between">
          <h2 className="text-lg font-semibold text-ink-900 dark:text-ink-100">
            Owner tools
          </h2>
          <p className="text-xs text-ink-500">Super-admin only · system surface</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <ActionCard
            icon={Radar}
            value="API"
            label="Scan every backend route"
            tone="brand"
            href="/super-admin/api-scanner"
          />
          <ActionCard
            icon={Activity}
            value="Health"
            label="Live API + dependency status"
            tone="accent"
            href="/super-admin/system-health"
          />
          <ActionCard
            icon={Palette}
            value="Theme"
            label="Tokens, palette + light/dark"
            tone="amber"
            href="/super-admin/theme"
          />
          <ActionCard
            icon={Megaphone}
            value="Offers"
            label="Manage promotions + sources"
            tone="red"
            href="/super-admin/promotions"
          />
        </div>
      </section>

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
          Change a user&apos;s role at any time. You can&apos;t change your own role —
          ask another super-admin if you need to step down.
        </p>
        <div className="mt-4">
          <RoleAssignmentTable initialUsers={users} currentUserId={user.id} />
        </div>
      </section>
    </DashboardLayout>
  );
};

export default SuperAdminPage;
