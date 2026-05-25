import Link from 'next/link';
import { Inbox, Users, TrendingUp, AlertOctagon } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/common/StatCard';
import { requireSessionRole } from '@/services/session';
import { fetchLeads, fetchLeadAnalytics } from '@/services/leads';
import { LeadsToolbar } from './LeadsToolbar';
import { LeadsCrmTable } from './LeadsCrmTable';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

const asString = (v: string | string[] | undefined): string | undefined =>
  Array.isArray(v) ? v[0] : v;

/**
 * Mini-CRM page (Admin + Staff).
 * The user spec: no checkout / no payment gateway. Everyone landing on the
 * site goes through the LeadCaptureModal which writes to the `leads`
 * collection — this page is where staff actually work the funnel.
 *
 *   - Status chips (with counts) filter the table
 *   - Inline status changer per row + detail drawer for full info & notes
 *   - CSV export respects the current filters
 *   - KPI strip shows how the funnel is performing right now
 */
const LeadsPage = async ({ searchParams }: PageProps) => {
  await requireSessionRole('staff', 'admin');

  const status = asString(searchParams.status);
  const search = asString(searchParams.search);
  const page = Number(asString(searchParams.page) ?? '1') || 1;

  const [{ leads, meta }, analytics] = await Promise.all([
    fetchLeads({ status, search, page, limit: 20 }),
    fetchLeadAnalytics(),
  ]);

  const total = analytics?.total ?? meta?.total ?? leads.length;

  return (
    <DashboardLayout
      title="Lead CRM"
      subtitle="Work the funnel — call, qualify, enrol. Every interaction is one row here."
    >
      {/* KPI strip */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          icon={Inbox}
          label="Total leads"
          value={analytics?.total ?? 0}
          hint={`${analytics?.newCount ?? 0} new`}
          tone="brand"
        />
        <StatCard
          icon={Users}
          label="In progress"
          value={analytics?.inProgressCount ?? 0}
          hint={`${analytics?.contactedCount ?? 0} contacted`}
          tone="neutral"
        />
        <StatCard
          icon={TrendingUp}
          label="Enrolled"
          value={analytics?.enrolledCount ?? 0}
          hint={`${analytics?.conversionRate ?? 0}% conversion`}
          tone="accent"
        />
        <StatCard
          icon={AlertOctagon}
          label="Junk"
          value={analytics?.junkCount ?? 0}
          tone="neutral"
        />
      </div>

      {/* Toolbar */}
      <div className="mt-6">
        <LeadsToolbar total={total} />
      </div>

      {/* Table */}
      <div className="mt-4">
        {leads.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-ink-100 bg-white px-6 py-16 text-center dark:border-ink-700 dark:bg-ink-900">
            <Inbox className="mx-auto h-10 w-10 text-ink-300" />
            <h3 className="mt-3 text-base font-semibold text-ink-900 dark:text-ink-100">
              No leads match your filters
            </h3>
            <p className="mt-1 text-sm text-ink-500">
              Try resetting the filters or come back once new leads have been captured.
            </p>
            <div className="mt-4">
              <Link
                href="/admin/leads"
                className="text-sm font-semibold text-brand-700 hover:text-brand-800"
              >
                Reset filters &rarr;
              </Link>
            </div>
          </div>
        ) : (
          <LeadsCrmTable leads={leads} />
        )}
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <nav className="mt-5 flex items-center justify-center gap-2 text-sm">
          {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => {
            const params = new URLSearchParams();
            if (status) params.set('status', status);
            if (search) params.set('search', search);
            if (p > 1) params.set('page', String(p));
            const qs = params.toString();
            const isActive = p === meta.page;
            return (
              <Link
                key={p}
                href={`/admin/leads${qs ? `?${qs}` : ''}`}
                className={
                  isActive
                    ? 'inline-flex h-8 min-w-8 items-center justify-center rounded-md bg-brand-600 px-2 text-xs font-bold text-white'
                    : 'inline-flex h-8 min-w-8 items-center justify-center rounded-md border border-ink-100 px-2 text-xs font-semibold text-ink-700 hover:border-brand-300 hover:text-brand-700 dark:border-ink-700 dark:text-ink-100'
                }
              >
                {p}
              </Link>
            );
          })}
        </nav>
      )}
    </DashboardLayout>
  );
};

export default LeadsPage;
