/**
 * Staff "My Leads" CRM page — server entry point.
 *
 * This page is intentionally thin: it does the AUTHZ check on the server
 * (so unauthorised visitors are redirected at the edge, no flash of UI)
 * and delegates everything interactive to `MyLeadsClient`. That keeps the
 * search/filter/refresh/print logic out of the RSC layer where it can't
 * use browser primitives like `window.print()` or local state.
 *
 * RBAC: staff + admin + super-admin can land here. The backend's
 * `LeadAccessCtx` automatically scopes `GET /api/leads` to
 * `{ assignedTo: callerId }` when the caller is a staff member — so even
 * if an admin lands on `/staff/leads` they see their own admin-scoped
 * results, while a staff member only ever sees their own assignments.
 */

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { requireSessionRole } from '@/services/session';
import { MyLeadsClient } from './MyLeadsClient';

export const dynamic = 'force-dynamic';

const StaffLeadsPage = async () => {
  const user = await requireSessionRole('staff', 'admin');

  // Staff-specific framing. We DON'T fetch leads server-side because the
  // entire UX (search, refresh, optimistic updates) lives on the client —
  // doing the first fetch there too avoids a server/client double-render.
  return (
    <DashboardLayout
      title="My Leads"
      overview="CRM workspace"
      subtitle="Only the leads assigned to you appear here — call, qualify, and convert."
    >
      <MyLeadsClient currentUserId={user.id} currentUserRole={user.role} />
    </DashboardLayout>
  );
};

export default StaffLeadsPage;
