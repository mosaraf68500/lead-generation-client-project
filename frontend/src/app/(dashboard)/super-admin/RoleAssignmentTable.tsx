'use client';

import { useState } from 'react';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/context/ToastContext';
import { api, ApiError } from '@/services/api';
import { USER_ROLES, type User, type UserRole } from '@/types';

interface RoleAssignmentTableProps {
  initialUsers: User[];
  /** Logged-in super-admin's id — disables the self-row so they can't demote themselves. */
  currentUserId: string;
}

export const RoleAssignmentTable = ({
  initialUsers,
  currentUserId,
}: RoleAssignmentTableProps) => {
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
    <div className="overflow-hidden rounded-3xl border border-ink-100 bg-white">
      <table className="min-w-full divide-y divide-ink-100 text-sm">
        <thead className="bg-surface-muted text-xs uppercase tracking-wider text-ink-500">
          <tr>
            <th className="px-4 py-3 text-left">User</th>
            <th className="px-4 py-3 text-left">Current role</th>
            <th className="px-4 py-3 text-left">Assign</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100">
          {users.map((user) => {
            const isSelf = user.id === currentUserId;
            return (
              <tr key={user.id} className={isSelf ? 'bg-amber-50/40' : undefined}>
                <td className="px-4 py-3">
                  <p className="font-semibold text-ink-900">
                    {user.name || '(no name)'}
                    {isSelf && (
                      <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                        you
                      </span>
                    )}
                  </p>
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
                    disabled={pendingId === user.id || isSelf}
                    onChange={(event) =>
                      updateRole(user, event.target.value as UserRole)
                    }
                    className="max-w-xs capitalize"
                    aria-label={
                      isSelf
                        ? 'Cannot change your own role'
                        : `Assign role to ${user.name || user.email}`
                    }
                  >
                    {USER_ROLES.map((role) => (
                      <option key={role} value={role} className="capitalize">
                        {role.replace('_', ' ')}
                      </option>
                    ))}
                  </Select>
                  {isSelf && (
                    <p className="mt-1 text-[10px] text-amber-700">
                      You can&apos;t change your own role. Ask another super-admin.
                    </p>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
