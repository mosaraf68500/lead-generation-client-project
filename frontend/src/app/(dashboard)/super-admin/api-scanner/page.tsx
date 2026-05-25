import { Radar } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { requireSessionRole } from '@/services/session';
import { ApiScannerTable, type ApiEndpoint } from './ApiScannerTable';

export const dynamic = 'force-dynamic';

/**
 * Catalogued REST surface. Kept in lockstep with the Express route mounts
 * in `backend/src/app.ts` + each module's `*.routes.ts`. New routes should
 * be added here so the scanner stays comprehensive.
 */
const ENDPOINTS: ApiEndpoint[] = [
  // --- Health ----------------------------------------------------------
  {
    method: 'GET',
    path: '/health',
    label: 'Health check',
    description: 'Reports server uptime + status. No auth required.',
    requires: 'public',
  },

  // --- Courses ---------------------------------------------------------
  {
    method: 'GET',
    path: '/courses?limit=1',
    label: 'List courses',
    description: 'Public catalog feed. Students only see published rows.',
    requires: 'public',
  },
  {
    method: 'GET',
    path: '/courses/analytics/summary',
    label: 'Course analytics',
    description: 'Catalog KPIs (published / drafts / on-sale / enrolments).',
    requires: 'staff+',
  },

  // --- Leads -----------------------------------------------------------
  {
    method: 'GET',
    path: '/leads?limit=1',
    label: 'List leads',
    description: 'CRM feed. Staff auto-scoped to assignedTo == self.',
    requires: 'staff+',
  },
  {
    method: 'GET',
    path: '/leads/analytics',
    label: 'Lead analytics',
    description: 'Funnel + source mix. Staff get scoped numbers.',
    requires: 'staff+',
  },
  {
    method: 'GET',
    path: '/leads/my-performance',
    label: 'My performance',
    description: "Caller's personal lead KPIs (assigned / converted).",
    requires: 'staff+',
  },
  {
    method: 'GET',
    path: '/leads/export',
    label: 'Export leads CSV',
    description: 'Triggers CSV stream. Staff scoped, admin sees everyone.',
    requires: 'staff+',
  },
  {
    method: 'GET',
    path: '/leads/mine',
    label: 'My submitted leads',
    description: 'Student self-service — leads they submitted by email.',
    requires: 'auth',
  },

  // --- Users -----------------------------------------------------------
  {
    method: 'GET',
    path: '/users/me',
    label: 'Current profile',
    description: 'Returns the logged-in user document.',
    requires: 'auth',
  },
  {
    method: 'GET',
    path: '/users?limit=1',
    label: 'List users',
    description: 'Admin directory. Used by Role assignment + assignee picker.',
    requires: 'admin+',
  },
];

const ApiScannerPage = async () => {
  await requireSessionRole('super_admin');

  return (
    <DashboardLayout
      title="API scanner"
      subtitle="Probe every backend route from the browser — verify reachability, role guards, and latency."
    >
      <div className="rounded-2xl border border-ink-100 bg-white p-5 dark:border-ink-700 dark:bg-ink-900">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-700/20">
            <Radar className="h-5 w-5" />
          </span>
          <div className="text-sm text-ink-700 dark:text-ink-100">
            <p>
              The scanner sends each request from your browser (cookies + bearer token
              included), so a <strong>403</strong> here usually means your role isn&apos;t
              authorised — not that the server is broken. <strong>200 / 204</strong>{' '}
              means the route is up and your session has access.
            </p>
            <p className="mt-2 text-xs text-ink-500">
              POST / PATCH calls are intentionally sent with an empty body — the goal is
              probing reachability, not real mutations. Validation errors (400 / 422) on
              those rows still confirm the route is mounted.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <ApiScannerTable endpoints={ENDPOINTS} />
      </div>
    </DashboardLayout>
  );
};

export default ApiScannerPage;
