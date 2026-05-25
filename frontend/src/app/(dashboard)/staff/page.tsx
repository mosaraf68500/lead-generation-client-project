import Link from 'next/link';
import {
  Inbox,
  TrendingUp,
  MessageSquare,
  PhoneCall,
  AlertOctagon,
  Sparkles,
  CheckCircle2,
  Trophy,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/common/StatCard';
import { ActionCard } from '@/components/common/ActionCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { requireSessionRole } from '@/services/session';
import { fetchLeads, fetchMyPerformance } from '@/services/leads';
import { formatDate } from '@/utils';
import { LEAD_STATUS_META } from '@/types';

export const dynamic = 'force-dynamic';

const formatToday = (): string =>
  new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

/**
 * Staff dashboard — built around the assigned-lead inbox and personal
 * performance. Staff CANNOT see platform-wide analytics, course CRUD, or
 * other staff's leads.
 */
const StaffDashboard = async () => {
  const user = await requireSessionRole('staff', 'admin');

  const today = formatToday();
  const kicker = `Today · ${today}`;

  // Both fetches are scoped to the caller by the backend.
  //  - `fetchLeads({ status: 'new' })` → staff sees only their own assigned `new` leads.
  //  - `fetchMyPerformance()`           → only the caller's KPIs.
  const [{ leads }, perf] = await Promise.all([
    fetchLeads({ limit: 8, status: 'new' }),
    fetchMyPerformance(),
  ]);

  const newCount = perf?.byStatus.new ?? 0;
  const contactedCount = perf?.byStatus.contacted ?? 0;
  const inProgressCount = perf?.byStatus.in_progress ?? 0;
  const enrolledCount = perf?.byStatus.enrolled ?? 0;
  const assignedTotal = perf?.assignedTotal ?? 0;
  const conversionRate = perf?.conversionRate ?? 0;

  return (
    <DashboardLayout
      title={`Welcome, ${user.name?.split(' ')[0] || 'team'}`}
      overview={`Overview for Today (${today})`}
      subtitle="Your assigned leads — call, qualify, and convert."
      actions={
        <Link href="/staff/leads">
          <Button leftIcon={<Inbox className="h-4 w-4" />}>My lead inbox</Button>
        </Link>
      }
    >
      {/* ── Personal KPI strip ───────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Inbox}
          label="Assigned to me"
          value={assignedTotal}
          kicker={kicker}
          hint={`${perf?.assignedToday ?? 0} added today`}
          tone="brand"
        />
        <StatCard
          icon={MessageSquare}
          label="Awaiting first reply"
          value={newCount}
          kicker={kicker}
          tone="warning"
          hint="Status = new"
        />
        <StatCard
          icon={TrendingUp}
          label="Converted by me"
          value={enrolledCount}
          kicker={kicker}
          tone="accent"
          hint="Enrolled (last 30 days)"
        />
        <StatCard
          icon={Trophy}
          label="My conversion rate"
          value={`${conversionRate}%`}
          kicker={kicker}
          tone="brand"
          hint="Enrolled / assigned"
        />
      </div>

      {/* ── Action cards ─────────────────────────────────────────── */}
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <ActionCard
          icon={AlertOctagon}
          value={newCount}
          label="Pending follow-ups"
          tone="amber"
          href="/staff/leads?status=new"
        />
        <ActionCard
          icon={PhoneCall}
          value={contactedCount}
          label="Contacted (awaiting reply)"
          tone="red"
          href="/staff/leads?status=contacted"
        />
        <ActionCard
          icon={Sparkles}
          value={inProgressCount}
          label="In progress (call scheduled)"
          tone="brand"
          href="/staff/leads?status=in_progress"
        />
      </div>

      {/* ── Recent assignment activity ────────────────────────────── */}
      <section className="mt-10">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="text-lg font-semibold text-ink-900 dark:text-ink-100">
              Awaiting your first reply
            </h2>
            <p className="text-sm text-ink-500">
              Newest assignments at the top — call back within 24 hours.
            </p>
          </div>
          <Link
            href="/staff/leads"
            className="text-sm font-semibold text-brand-700 hover:text-brand-800"
          >
            See all &rarr;
          </Link>
        </div>
        <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white dark:border-ink-700 dark:bg-ink-900">
          {leads.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
              <CheckCircle2 className="h-10 w-10 text-accent-600" />
              <p className="text-sm font-semibold text-ink-900 dark:text-ink-100">
                Your queue is clear
              </p>
              <p className="text-xs text-ink-500">
                Nothing assigned to you needs a first reply right now.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-ink-100 dark:divide-ink-700">
              {leads.map((lead) => (
                <li
                  key={lead.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink-900 dark:text-ink-100">
                      {lead.name}
                    </p>
                    <p className="text-xs text-ink-500">
                      {lead.email} · {lead.whatsapp ?? lead.phone}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-ink-500">
                    <Badge tone={LEAD_STATUS_META[lead.status].tone}>
                      {LEAD_STATUS_META[lead.status].label}
                    </Badge>
                    <Badge tone="brand" className="capitalize">
                      {lead.source}
                    </Badge>
                    <span>{formatDate(lead.createdAt)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* ── Personal pipeline summary ───────────────────────────── */}
      <section className="mt-10 rounded-2xl border border-ink-100 bg-white p-5 dark:border-ink-700 dark:bg-ink-900">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-ink-900 dark:text-ink-100">
            My pipeline
          </h2>
          <span className="text-xs text-ink-500">
            {assignedTotal} leads in your bucket
          </span>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-5">
          <PipelineTile label="New" value={newCount} tone="brand" />
          <PipelineTile label="Contacted" value={contactedCount} tone="neutral" />
          <PipelineTile label="In progress" value={inProgressCount} tone="warning" />
          <PipelineTile
            label="Enrolled"
            value={enrolledCount}
            tone="accent"
          />
          <PipelineTile
            label="Junk"
            value={perf?.byStatus.junk ?? 0}
            tone="danger"
          />
        </div>
        <p className="mt-4 text-xs text-ink-500">
          Tip: staff dashboards only display your own queue. Need help with a
          lead outside your queue? Ask an admin to reassign it to you.
        </p>
      </section>
    </DashboardLayout>
  );
};

const TONE_STYLES = {
  brand: 'bg-brand-100 text-brand-700',
  neutral: 'bg-ink-100 text-ink-700',
  warning: 'bg-amber-100 text-amber-700',
  accent: 'bg-accent-500/10 text-accent-700',
  danger: 'bg-red-100 text-red-700',
} as const;

const PipelineTile = ({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: keyof typeof TONE_STYLES;
}) => (
  <div className={`rounded-xl px-4 py-3 ${TONE_STYLES[tone]}`}>
    <p className="text-[10px] font-bold uppercase tracking-wider">{label}</p>
    <p className="mt-1 text-2xl font-extrabold">{value}</p>
  </div>
);

export default StaffDashboard;
