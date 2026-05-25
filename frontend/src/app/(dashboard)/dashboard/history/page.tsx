/**
 * Shared /dashboard/history page.
 *
 * Shows the user's personal activity history — the list of leads /
 * applications / support tickets they have submitted from their account
 * (matched by email on the backend). Works for every authenticated role.
 */
import Link from 'next/link';
import { Clock, Inbox } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StudentLeadsTimeline } from '@/app/(dashboard)/student/StudentLeadsTimeline';
import { requireSessionRole } from '@/services/session';
import { fetchMyLeads } from '@/services/leads';

export const dynamic = 'force-dynamic';

const HistoryPage = async () => {
  await requireSessionRole();
  const leads = await fetchMyLeads();

  // KPI strip — gives the user an at-a-glance feel for activity.
  const total = leads.length;
  const open = leads.filter((l) => l.status === 'new' || l.status === 'contacted').length;
  const won = leads.filter((l) => l.status === 'enrolled').length;

  return (
    <DashboardLayout
      title="History"
      subtitle="Everything you've submitted — applications, inquiries, and support tickets."
      contained
      actions={
        <Link
          href="/course"
          className="inline-flex h-10 items-center gap-1.5 rounded-md bg-brand-600 px-4 text-xs font-bold uppercase tracking-wider text-white hover:bg-brand-700"
        >
          Browse courses
        </Link>
      }
    >
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: 'Submitted', value: total, icon: Inbox },
            { label: 'Currently open', value: open, icon: Clock },
            { label: 'Enrolled', value: won, icon: Clock },
          ].map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="flex items-center gap-4 rounded-3xl border border-ink-100 bg-white p-5 dark:border-ink-700 dark:bg-ink-900"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-100 text-brand-700 dark:bg-brand-700/30 dark:text-brand-200">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">
                  {label}
                </p>
                <p className="text-2xl font-bold text-ink-900 dark:text-ink-100">{value}</p>
              </div>
            </div>
          ))}
        </div>

        <StudentLeadsTimeline leads={leads} />
      </div>
    </DashboardLayout>
  );
};

export default HistoryPage;
