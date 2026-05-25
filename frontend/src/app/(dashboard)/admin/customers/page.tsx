import {
  Contact2,
  Inbox,
  GraduationCap,
  Users,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/common/StatCard';
import { requireSessionRole } from '@/services/session';
import { fetchUsers } from '@/services/users';
import { fetchLeads } from '@/services/leads';
import { CustomersTable } from './CustomersTable';

export const dynamic = 'force-dynamic';

const CustomersPage = async () => {
  await requireSessionRole('admin');

  // Pull students directly + a generous lead window so the table can compute
  // each customer's latest status without per-row lookups.
  const [{ users, meta: userMeta }, { leads }] = await Promise.all([
    fetchUsers({ role: 'student', limit: 100 }),
    fetchLeads({ limit: 500 }),
  ]);

  const enrolled = leads.filter((l) => l.status === 'enrolled').length;
  const totalCustomers = userMeta?.total ?? users.length;
  const totalLeads = leads.length;

  return (
    <DashboardLayout
      title="Customers"
      overview="Manage your audience"
      subtitle="Every signed-up student plus their lead activity, status, and contact options."
    >
      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Contact2}
          label="Total customers"
          value={totalCustomers}
          hint="Students registered on the platform"
          tone="brand"
        />
        <StatCard
          icon={Inbox}
          label="Leads received"
          value={totalLeads}
          hint="Submitted via capture forms"
          tone="accent"
        />
        <StatCard
          icon={GraduationCap}
          label="Enrolled"
          value={enrolled}
          hint="Converted from leads"
          tone="warning"
        />
        <StatCard
          icon={Users}
          label="Avg leads / customer"
          value={
            totalCustomers > 0
              ? (totalLeads / totalCustomers).toFixed(1)
              : '0.0'
          }
          hint="Engagement density"
          tone="neutral"
        />
      </div>

      <CustomersTable customers={users} leads={leads} />
    </DashboardLayout>
  );
};

export default CustomersPage;
