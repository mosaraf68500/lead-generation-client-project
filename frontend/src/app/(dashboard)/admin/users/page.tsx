import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable, type DataTableColumn } from '@/components/common/DataTable';
import { Badge } from '@/components/ui/Badge';
import { requireSessionRole } from '@/services/session';
import { fetchUsers } from '@/services/users';
import type { User, UserRole } from '@/types';
import { formatDate } from '@/utils';

export const dynamic = 'force-dynamic';

const ROLE_TONE: Record<UserRole, 'brand' | 'success' | 'warning' | 'neutral'> = {
  super_admin: 'warning',
  admin: 'brand',
  staff: 'success',
  student: 'neutral',
};

const UsersPage = async () => {
  await requireSessionRole('admin');
  const { users, meta } = await fetchUsers({ limit: 50 });

  const columns: DataTableColumn<User>[] = [
    {
      key: 'user',
      header: 'User',
      render: (user) => (
        <div>
          <p className="font-semibold text-ink-900">{user.name || '(no name)'}</p>
          <p className="text-xs text-ink-500">{user.email}</p>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (user) => (
        <Badge tone={ROLE_TONE[user.role] ?? 'neutral'} className="capitalize">
          {user.role.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'country',
      header: 'Country',
      render: (user) => <span className="text-ink-700">{user.country ?? '-'}</span>,
    },
    {
      key: 'createdAt',
      header: 'Joined',
      align: 'right',
      render: (user) => (
        <span className="text-xs text-ink-500">{user.createdAt ? formatDate(user.createdAt) : '-'}</span>
      ),
    },
  ];

  return (
    <DashboardLayout
      title="Users"
      subtitle={`${meta?.total ?? users.length} accounts in the platform.`}
    >
      <DataTable rows={users} columns={columns} rowKey={(u) => u.id} />
    </DashboardLayout>
  );
};

export default UsersPage;
