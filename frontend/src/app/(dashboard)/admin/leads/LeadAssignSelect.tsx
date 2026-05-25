'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { UserCog } from 'lucide-react';
import type { LeadAssignee } from '@/types';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/context/ToastContext';
import { assignLead } from '@/services/leads';
import { ApiError } from '@/services/api';

interface LeadAssignSelectProps {
  leadId: string;
  /** Current assignee — `null` when the lead is sitting in the triage queue. */
  currentAssigneeId: string | null;
  assignees: LeadAssignee[];
  /** Optional override for what to do after a successful mutation. */
  onAssigned?: (lead: { assignedTo?: LeadAssignee | string | null }) => void;
}

/**
 * Inline assignee picker used in the Lead CRM detail drawer.
 * Admin + super-admin only — the route is locked down on the backend.
 */
export const LeadAssignSelect = ({
  leadId,
  currentAssigneeId,
  assignees,
  onAssigned,
}: LeadAssignSelectProps) => {
  const router = useRouter();
  const { push } = useToast();
  const [optimistic, setOptimistic] = useState<string>(currentAssigneeId ?? '');
  const [isPending, startTransition] = useTransition();

  const handleChange = (next: string) => {
    if (next === optimistic) return;
    const previous = optimistic;
    setOptimistic(next);
    startTransition(async () => {
      try {
        const updated = await assignLead(leadId, next || null);
        push({
          variant: 'success',
          title: next ? 'Lead assigned' : 'Lead unassigned',
        });
        if (onAssigned) onAssigned(updated);
        else router.refresh();
      } catch (err) {
        setOptimistic(previous);
        const msg = err instanceof ApiError ? err.message : 'Could not update assignee';
        push({ variant: 'error', title: 'Assignment failed', description: msg });
      }
    });
  };

  return (
    <label className="block">
      <span className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-ink-500">
        <UserCog className="h-3 w-3" /> Assigned to
      </span>
      <Select
        value={optimistic}
        disabled={isPending}
        onChange={(e) => handleChange(e.target.value)}
        aria-label="Lead assignee"
      >
        <option value="">Unassigned — triage queue</option>
        {assignees.map((u) => (
          <option key={u.id} value={u.id}>
            {(u.name || u.email) + ' · ' + u.role.replace('_', ' ')}
          </option>
        ))}
      </Select>
    </label>
  );
};
