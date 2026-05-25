'use client';

/**
 * Customer (student) directory — searchable + filter-by-status table.
 * Each row aggregates a student's lead activity:
 *   - total leads they have submitted
 *   - their latest status + when they last submitted
 *   - the course they most recently expressed interest in
 *
 * Clicking a row navigates to the Lead CRM, pre-filtered to the customer's
 * email, so the admin can dive into the full timeline / message history.
 */

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, ExternalLink, MailPlus, MessageCircle } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { LEAD_STATUS_META, type Lead, type LeadStatus, type User } from '@/types';
import { formatDate } from '@/utils';

export interface CustomersTableProps {
  customers: User[];
  leads: Lead[];
}

interface CustomerRow {
  user: User;
  leadCount: number;
  latestStatus: LeadStatus | null;
  latestLeadAt: string | null;
  latestCourse: string | null;
}

const buildRows = (customers: User[], leads: Lead[]): CustomerRow[] => {
  // Group leads by lowercased email — case-insensitive match against users.
  const byEmail = new Map<string, Lead[]>();
  for (const lead of leads) {
    const key = lead.email.toLowerCase();
    const bucket = byEmail.get(key) ?? [];
    bucket.push(lead);
    byEmail.set(key, bucket);
  }

  return customers.map((user) => {
    const userLeads = (byEmail.get(user.email.toLowerCase()) ?? []).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    const latest = userLeads[0];

    let latestCourse: string | null = null;
    if (latest?.interestedCourse) {
      latestCourse =
        typeof latest.interestedCourse === 'string'
          ? latest.interestedCourse
          : latest.interestedCourse.title;
    }

    return {
      user,
      leadCount: userLeads.length,
      latestStatus: latest?.status ?? null,
      latestLeadAt: latest?.createdAt ?? user.createdAt ?? null,
      latestCourse,
    };
  });
};

const STATUS_OPTIONS: Array<{ id: 'all' | LeadStatus | 'cold'; label: string }> = [
  { id: 'all', label: 'All customers' },
  { id: 'new', label: 'Hot · New leads' },
  { id: 'contacted', label: 'Contacted' },
  { id: 'in_progress', label: 'In progress' },
  { id: 'enrolled', label: 'Enrolled' },
  { id: 'junk', label: 'Junk' },
  { id: 'cold', label: 'No leads yet' },
];

export const CustomersTable = ({ customers, leads }: CustomersTableProps) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_OPTIONS)[number]['id']>('all');

  const rows = useMemo(() => buildRows(customers, leads), [customers, leads]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (term) {
        const haystack = `${r.user.name} ${r.user.email} ${r.user.phone ?? ''}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      if (statusFilter === 'all') return true;
      if (statusFilter === 'cold') return r.leadCount === 0;
      return r.latestStatus === statusFilter;
    });
  }, [rows, search, statusFilter]);

  const totals = useMemo(() => {
    return {
      all: rows.length,
      withLeads: rows.filter((r) => r.leadCount > 0).length,
      enrolled: rows.filter((r) => r.latestStatus === 'enrolled').length,
      cold: rows.filter((r) => r.leadCount === 0).length,
    };
  }, [rows]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-ink-100 bg-white p-4 dark:border-ink-700 dark:bg-ink-900">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email or phone…"
            className="pl-9"
          />
        </div>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as (typeof STATUS_OPTIONS)[number]['id'])}
          className="h-11 w-52"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </Select>
        <div className="ml-auto flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-wider">
          <Badge tone="neutral">All {totals.all}</Badge>
          <Badge tone="brand">With leads {totals.withLeads}</Badge>
          <Badge tone="success">Enrolled {totals.enrolled}</Badge>
          <Badge tone="warning">Cold {totals.cold}</Badge>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white dark:border-ink-700 dark:bg-ink-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-ink-100 bg-surface-muted/60 text-[10px] font-bold uppercase tracking-wider text-ink-500 dark:border-ink-700 dark:bg-ink-700/30">
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Leads</th>
                <th className="px-4 py-3">Last status</th>
                <th className="px-4 py-3">Last interested</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100 dark:divide-ink-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-ink-500">
                    No customers match the current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((row) => {
                  const meta = row.latestStatus ? LEAD_STATUS_META[row.latestStatus] : null;
                  return (
                    <tr key={row.user.id} className="hover:bg-surface-muted/40 dark:hover:bg-ink-700/20">
                      <td className="px-4 py-3 align-top">
                        <p className="font-semibold text-ink-900 dark:text-ink-100">
                          {row.user.name || '(no name)'}
                        </p>
                        <p className="text-xs text-ink-500">{row.user.email}</p>
                        {row.user.country && (
                          <p className="text-[10px] uppercase tracking-wider text-ink-400">
                            {row.user.country}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 align-top text-xs">
                        {row.user.phone ? (
                          <p className="font-mono text-ink-700 dark:text-ink-100">
                            {row.user.phone}
                          </p>
                        ) : (
                          <p className="text-ink-400">No phone</p>
                        )}
                        <div className="mt-1 flex flex-wrap gap-2">
                          <a
                            href={`mailto:${row.user.email}`}
                            className="inline-flex items-center gap-1 text-brand-700 hover:text-brand-800"
                          >
                            <MailPlus className="h-3 w-3" /> email
                          </a>
                          {row.user.phone && (
                            <a
                              href={`https://wa.me/${row.user.phone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800"
                            >
                              <MessageCircle className="h-3 w-3" /> whatsapp
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <span className="text-base font-bold text-ink-900 dark:text-ink-100">
                          {row.leadCount}
                        </span>
                        <p className="text-[10px] text-ink-500">submitted</p>
                      </td>
                      <td className="px-4 py-3 align-top text-xs">
                        {meta ? (
                          <Badge tone={meta.tone}>{meta.label}</Badge>
                        ) : (
                          <Badge tone="neutral">Cold</Badge>
                        )}
                        {row.latestLeadAt && (
                          <p className="mt-1 text-[10px] text-ink-400">
                            {formatDate(row.latestLeadAt)}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 align-top text-xs text-ink-700 dark:text-ink-100">
                        {row.latestCourse ?? <span className="text-ink-400">—</span>}
                      </td>
                      <td className="px-4 py-3 text-right align-top">
                        <Link
                          href={`/admin/leads?search=${encodeURIComponent(row.user.email)}`}
                          className="inline-flex h-8 items-center gap-1 rounded-md border border-ink-100 px-2 text-xs font-semibold text-ink-700 transition hover:border-brand-300 hover:text-brand-700 dark:border-ink-700 dark:text-ink-100"
                        >
                          View leads <ExternalLink className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
