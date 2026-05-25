'use client';

import { useTransition, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LEAD_STATUSES, LEAD_STATUS_META, type LeadStatus } from '@/types';
import { useToast } from '@/context/ToastContext';
import { updateLeadStatus } from '@/services/leads';
import { ApiError } from '@/services/api';
import { cn } from '@/utils';

interface LeadStatusSelectProps {
  leadId: string;
  status: LeadStatus;
  /**
   * Optional override that re-fetches / mutates parent state after a
   * successful PATCH. Receives the new status so parents can update
   * their own copy of the lead without a full refetch (used by the
   * staff "My Leads" page for optimistic UI).
   *
   * When omitted the component falls back to `router.refresh()`, which
   * is what the admin server-component table relies on.
   */
  onChanged?: (next: LeadStatus) => void;
}

const SELECT_TONE: Record<LeadStatus, string> = {
  new: 'bg-brand-100 text-brand-700',
  contacted: 'bg-ink-100 text-ink-700',
  in_progress: 'bg-amber-100 text-amber-700',
  enrolled: 'bg-accent-500/10 text-accent-700',
  junk: 'bg-red-100 text-red-700',
};

/**
 * Inline status changer rendered as a styled <select>. Submitting triggers
 * `PATCH /leads/:id/status` and refreshes the table via `router.refresh()`.
 */
export const LeadStatusSelect = ({ leadId, status, onChanged }: LeadStatusSelectProps) => {
  const router = useRouter();
  const { push } = useToast();
  const [optimistic, setOptimistic] = useState<LeadStatus>(status);
  const [isPending, startTransition] = useTransition();

  const handleChange = (next: LeadStatus) => {
    if (next === optimistic) return;
    const prev = optimistic;
    setOptimistic(next);

    startTransition(async () => {
      try {
        await updateLeadStatus(leadId, next);
        push({
          variant: 'success',
          title: 'Status updated',
          description: `${LEAD_STATUS_META[next].label}`,
        });
        if (onChanged) onChanged(next);
        else router.refresh();
      } catch (err) {
        setOptimistic(prev);
        const msg =
          err instanceof ApiError ? err.message : 'Could not update status';
        push({ variant: 'error', title: 'Update failed', description: msg });
      }
    });
  };

  return (
    <select
      value={optimistic}
      onChange={(e) => handleChange(e.target.value as LeadStatus)}
      disabled={isPending}
      className={cn(
        'h-8 cursor-pointer rounded-full border-0 px-3 text-[11px] font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1',
        SELECT_TONE[optimistic],
        isPending && 'opacity-60',
      )}
      aria-label="Lead status"
    >
      {LEAD_STATUSES.map((s) => (
        <option key={s} value={s}>
          {LEAD_STATUS_META[s].label}
        </option>
      ))}
    </select>
  );
};
