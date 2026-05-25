'use client';

import { useState } from 'react';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/context/ToastContext';
import { api, ApiError } from '@/services/api';
import { USER_ROLES, type User, type UserRole } from '@/types';

interface RoleAssignmentTableProps {
  initialUsers: User[];
}

export const RoleAssignmentTable = ({ initialUsers }: RoleAssignmentTableProps) => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const { push } = useToast();

  const updateRole = async (user: User, role: UserRole) => {
    const previous = user.role;
    setPendingId(user.id);
    // Optimistic update; rollback on failure.
    setUsers((current) => current.map((u) => (u.id === user.id ? { ...u, role } : u)));
    try {
      await api.patch(`/users/${user.id}/role`, { role });
      push({
        variant: 'success',
        title: 'Role updated',
        description: `${user.name || user.email} is now ${role.replace('_', ' ')}.`,
      });
    } catch (err) {
      setUsers((current) => current.map((u) => (u.id === user.id ? { ...u, role: previous } : u)));
      push({
        variant: 'error',
        title: 'Could not update role',
        description: err instanceof ApiError ? err.message : 'Unexpected error',
      });
    } finally {
      setPendingId(null);
    }
  };

  if (users.length === 0) {
    return (
      <p className="rounded-3xl border border-dashed border-ink-100 bg-white px-6 py-10 text-center text-sm text-ink-500">
        No users yet.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-ink-100 bg-white shadow-card">
      <table className="min-w-full divide-y divide-ink-100 text-sm">
        <thead className="bg-surface-muted text-xs uppercase tracking-wider text-ink-500">
          <tr>
            <th className="px-4 py-3 text-left">User</th>
            <th className="px-4 py-3 text-left">Current role</th>
            <th className="px-4 py-3 text-left">Assign</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="px-4 py-3">
                <p className="font-semibold text-ink-900">{user.name || '(no name)'}</p>
                <p className="text-xs text-ink-500">{user.email}</p>
              </td>
              <td className="px-4 py-3">
                <Badge tone="brand" className="capitalize">
                  {user.role.replace('_', ' ')}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <Select
                  value={user.role}
                  disabled={pendingId === user.id}
                  onChange={(event) => updateRole(user, event.target.value as UserRole)}
                  className="max-w-xs capitalize"
                >
                  {USER_ROLES.map((role) => (
                    <option key={role} value={role} className="capitalize">
                      {role.replace('_', ' ')}
                    </option>
                  ))}
                </Select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
