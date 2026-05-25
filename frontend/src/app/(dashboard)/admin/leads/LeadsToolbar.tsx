'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Download, Filter, RotateCcw, UserCog } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';
import { downloadLeadsCsv } from '@/services/leads';
import {
  LEAD_STATUSES,
  LEAD_STATUS_META,
  type LeadAssignee,
  type LeadStatus,
} from '@/types';
import { cn } from '@/utils';

interface LeadsToolbarProps {
  total: number;
  /** Admin / super-admin only — allow CSV exports. */
  canExport?: boolean;
  /** Admin / super-admin only — render the assignee filter dropdown. */
  canFilterAssignee?: boolean;
  /** Pool of staff/admin users for the assignee filter. */
  assignees?: LeadAssignee[];
}

/**
 * Toolbar above the CRM table. Drives the page's `?search` and `?status`
 * URL params, so the server component re-fetches with the new filters.
 */
export const LeadsToolbar = ({
  total,
  canExport = false,
  canFilterAssignee = false,
  assignees = [],
}: LeadsToolbarProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { push } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isExporting, setIsExporting] = useState(false);

  const currentStatus = searchParams.get('status') ?? '';
  const currentSearch = searchParams.get('search') ?? '';
  const currentAssignee = searchParams.get('assignedTo') ?? '';
  const [localSearch, setLocalSearch] = useState(currentSearch);

  const pushParams = (mutate: (next: URLSearchParams) => void) => {
    const next = new URLSearchParams(searchParams.toString());
    mutate(next);
    next.delete('page'); // any filter change resets pagination
    startTransition(() => router.push(`/admin/leads?${next.toString()}`));
  };

  const onSubmitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    pushParams((p) => {
      if (localSearch.trim()) p.set('search', localSearch.trim());
      else p.delete('search');
    });
  };

  const onPickStatus = (s: LeadStatus | '') => {
    pushParams((p) => {
      if (s) p.set('status', s);
      else p.delete('status');
    });
  };

  const onPickAssignee = (id: string) => {
    pushParams((p) => {
      if (id) p.set('assignedTo', id);
      else p.delete('assignedTo');
    });
  };

  const onReset = () => {
    setLocalSearch('');
    pushParams((p) => {
      p.delete('search');
      p.delete('status');
      p.delete('assignedTo');
    });
  };

  const onExport = async () => {
    setIsExporting(true);
    try {
      const filename = await downloadLeadsCsv({
        status: currentStatus || undefined,
        search: currentSearch || undefined,
      });
      push({ variant: 'success', title: 'Export ready', description: filename });
    } catch (err) {
      push({
        variant: 'error',
        title: 'Export failed',
        description: err instanceof Error ? err.message : 'Try again',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="rounded-3xl border border-ink-100 bg-white p-4 dark:border-ink-700 dark:bg-ink-900">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <form onSubmit={onSubmitSearch} className="flex flex-1 items-center gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
            <Input
              type="search"
              placeholder="Search by name, email, phone, occupation..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit" variant="outline" size="md" isLoading={isPending}>
            Search
          </Button>
        </form>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onReset}
            leftIcon={<RotateCcw className="h-4 w-4" />}
            disabled={!currentStatus && !currentSearch && !currentAssignee}
          >
            Reset
          </Button>
          {canExport && (
            <Button
              type="button"
              size="md"
              onClick={onExport}
              isLoading={isExporting}
              leftIcon={<Download className="h-4 w-4" />}
            >
              Export CSV
            </Button>
          )}
        </div>
      </div>

      {/* Status filter chips */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className="inline-flex items-center gap-1 pr-1 text-[11px] font-semibold uppercase tracking-wider text-ink-500">
          <Filter className="h-3.5 w-3.5" /> Status
        </span>
        <Chip active={!currentStatus} onClick={() => onPickStatus('')}>
          All ({total})
        </Chip>
        {LEAD_STATUSES.map((s) => (
          <Chip key={s} active={currentStatus === s} onClick={() => onPickStatus(s)}>
            {LEAD_STATUS_META[s].label}
          </Chip>
        ))}
      </div>

      {/* Assignee filter (admin / super-admin only) */}
      {canFilterAssignee && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 pr-1 text-[11px] font-semibold uppercase tracking-wider text-ink-500">
            <UserCog className="h-3.5 w-3.5" /> Assigned to
          </span>
          <Select
            value={currentAssignee}
            onChange={(e) => onPickAssignee(e.target.value)}
            className="max-w-xs"
          >
            <option value="">Everyone</option>
            <option value="unassigned">Unassigned (triage)</option>
            {assignees.map((u) => (
              <option key={u.id} value={u.id}>
                {(u.name || u.email) + ' · ' + u.role.replace('_', ' ')}
              </option>
            ))}
          </Select>
        </div>
      )}
    </div>
  );
};

const Chip = ({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'rounded-full px-3 py-1 text-xs font-semibold transition',
      active
        ? 'bg-ink-900 text-white dark:bg-brand-600'
        : 'bg-ink-100 text-ink-700 hover:bg-ink-200 dark:bg-ink-700 dark:text-ink-100',
    )}
  >
    {children}
  </button>
);
