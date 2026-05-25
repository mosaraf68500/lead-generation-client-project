'use client';

/**
 * Staff "My Leads" CRM workspace.
 *
 * Everything is client-rendered so we can offer:
 *   - Debounced server-side search (350ms after the user stops typing).
 *   - Status badge filters that re-query the API.
 *   - Inline status dropdown that PATCHes the lead + updates the row
 *     optimistically so the UI feels instant.
 *   - A slide-over detail modal with full metadata, notes timeline and
 *     an "Add note" form (POSTs to /api/leads/:id/notes).
 *   - A Refresh button with spinner + a Print button that opens the
 *     browser print dialog (sidebars/navbars are hidden via the global
 *     `@media print` rules in globals.css).
 *
 * The backend's `LeadAccessCtx` auto-scopes `GET /api/leads` to
 * `{ assignedTo: callerId }` when the caller is staff, so we never have
 * to pass the user id from the client — sending `?assignedTo=me` would
 * actually be IGNORED by the service layer for staff callers. That's by
 * design: it makes scoping un-bypassable.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  RotateCcw,
  RefreshCw,
  Printer,
  Filter,
  Inbox,
  Eye,
  Mail,
  Phone,
  MessageCircle,
  StickyNote,
} from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { fetchLeads } from '@/services/leads';
import {
  LEAD_STATUSES,
  LEAD_STATUS_META,
  type Lead,
  type LeadStatus,
  type PaginatedMeta,
  type UserRole,
} from '@/types';
import { formatDate } from '@/utils';
import { cn } from '@/utils';
import { LeadStatusSelect } from '@/app/(dashboard)/admin/leads/LeadStatusSelect';
import { LeadDetailModal } from './LeadDetailModal';

interface MyLeadsClientProps {
  currentUserId: string;
  currentUserRole: UserRole;
}

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 350;

export const MyLeadsClient = ({
  currentUserId,
  currentUserRole,
}: MyLeadsClientProps) => {
  // Deep-link support: the staff dashboard's quick-action cards link to
  // `/staff/leads?status=new`, `?status=contacted`, etc. We use those
  // values as the initial filter state so the table reflects the link.
  const searchParams = useSearchParams();
  const initialStatus = (searchParams?.get('status') ?? '') as LeadStatus | '';
  const initialSearch = searchParams?.get('search') ?? '';

  // ---------------------------------------------------------------
  // State — single source of truth lives here so optimistic updates
  // (status change, note added) can mutate the visible rows without
  // a full refetch.
  // ---------------------------------------------------------------
  const [leads, setLeads] = useState<Lead[]>([]);
  const [meta, setMeta] = useState<PaginatedMeta | null>(null);

  // Search input + the debounced value that actually hits the API.
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);

  const [statusFilter, setStatusFilter] = useState<LeadStatus | ''>(
    LEAD_STATUSES.includes(initialStatus as LeadStatus) ? initialStatus : '',
  );
  const [page, setPage] = useState(1);

  // "Initial load" vs. "background refresh" are visually different — the
  // first paint shows skeleton rows, every subsequent fetch only shows
  // a subtle spinner on the Refresh button so the table doesn't flicker.
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Detail modal state.
  const [activeLead, setActiveLead] = useState<Lead | null>(null);

  // Tracks the latest fetch so a stale response can't overwrite a fresh
  // one (e.g. user types fast, two requests race).
  const fetchSeqRef = useRef(0);

  // ---------------------------------------------------------------
  // Effects — debounce search input
  // ---------------------------------------------------------------
  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setPage(1); // any new query resets pagination
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [searchInput]);

  // ---------------------------------------------------------------
  // Core fetcher
  // ---------------------------------------------------------------
  const load = useCallback(async () => {
    const mySeq = ++fetchSeqRef.current;
    setIsFetching(true);
    setFetchError(null);
    try {
      const { leads: rows, meta: m } = await fetchLeads({
        search: debouncedSearch || undefined,
        status: statusFilter || undefined,
        page,
        limit: PAGE_SIZE,
      });
      // Drop the response if a newer request has been kicked off since.
      if (mySeq !== fetchSeqRef.current) return;
      setLeads(rows);
      setMeta(m ?? null);
    } catch (err) {
      if (mySeq !== fetchSeqRef.current) return;
      setFetchError(err instanceof Error ? err.message : 'Could not load leads');
    } finally {
      if (mySeq === fetchSeqRef.current) {
        setIsFetching(false);
        setIsInitialLoading(false);
      }
    }
  }, [debouncedSearch, statusFilter, page]);

  useEffect(() => {
    void load();
  }, [load]);

  // ---------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------
  const handleReset = () => {
    setSearchInput('');
    setDebouncedSearch('');
    setStatusFilter('');
    setPage(1);
  };

  const handleRefresh = () => {
    void load();
  };

  const handlePrint = () => {
    window.print();
  };

  /**
   * Optimistic update used by the inline status dropdown + the modal.
   * Mutates the local cache so the UI reflects the change instantly —
   * if the API call fails, the dropdown's own state rollback brings
   * the row back to the previous status (see LeadStatusSelect).
   */
  const updateLeadInPlace = useCallback((id: string, partial: Partial<Lead>) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...partial } : l)),
    );
    setActiveLead((prev) => (prev && prev.id === id ? { ...prev, ...partial } : prev));
  }, []);

  // ---------------------------------------------------------------
  // Derived UI bits
  // ---------------------------------------------------------------
  const hasActiveFilters = Boolean(debouncedSearch || statusFilter);
  const showSkeleton = isInitialLoading && leads.length === 0;
  const showEmptyState = !showSkeleton && leads.length === 0;
  const totalShown = meta?.total ?? leads.length;

  return (
    <div className="space-y-6">
      {/* ── Toolbar ───────────────────────────────────────────────── */}
      <div className="no-print rounded-3xl border border-ink-100 bg-white p-4 dark:border-ink-700 dark:bg-ink-900">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* Search */}
          <form
            onSubmit={(e) => {
              // Force-flush the debounced value when the user presses Enter
              // or clicks "Search" — useful when they type fast and submit
              // before the 350ms debounce window closes.
              e.preventDefault();
              setDebouncedSearch(searchInput.trim());
              setPage(1);
            }}
            className="flex flex-1 items-center gap-2"
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
              <Input
                type="search"
                placeholder="Search by name, email, phone, occupation…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" variant="outline" size="md" isLoading={isFetching && !isInitialLoading}>
              Search
            </Button>
          </form>

          {/* Right-side actions */}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handleReset}
              leftIcon={<RotateCcw className="h-4 w-4" />}
              disabled={!hasActiveFilters}
            >
              Reset
            </Button>
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handleRefresh}
              disabled={isFetching}
              leftIcon={
                <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
              }
            >
              Refresh
            </Button>
            <Button
              type="button"
              size="md"
              onClick={handlePrint}
              leftIcon={<Printer className="h-4 w-4" />}
            >
              Print
            </Button>
          </div>
        </div>

        {/* Status chips */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 pr-1 text-[11px] font-semibold uppercase tracking-wider text-ink-500">
            <Filter className="h-3.5 w-3.5" /> Status
          </span>
          <StatusChip
            active={!statusFilter}
            onClick={() => {
              setStatusFilter('');
              setPage(1);
            }}
          >
            All ({totalShown})
          </StatusChip>
          {LEAD_STATUSES.map((s) => (
            <StatusChip
              key={s}
              active={statusFilter === s}
              onClick={() => {
                setStatusFilter(s);
                setPage(1);
              }}
            >
              {LEAD_STATUS_META[s].label}
            </StatusChip>
          ))}
        </div>
      </div>

      {/* ── Error banner ──────────────────────────────────────────── */}
      {fetchError && (
        <div className="no-print rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200">
          <p className="font-semibold">Could not load leads.</p>
          <p className="text-xs">{fetchError}</p>
          <button
            type="button"
            onClick={handleRefresh}
            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold underline-offset-2 hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* ── Table / empty state / skeleton ─────────────────────────── */}
      {showSkeleton ? (
        <SkeletonTable />
      ) : showEmptyState ? (
        <EmptyState onReset={handleReset} hasFilters={hasActiveFilters} />
      ) : (
        <LeadTable
          leads={leads}
          isFetching={isFetching}
          onOpenDetails={setActiveLead}
          onLeadChanged={updateLeadInPlace}
        />
      )}

      {/* ── Pagination ────────────────────────────────────────────── */}
      {meta && meta.totalPages > 1 && (
        <nav className="no-print flex items-center justify-center gap-2 text-sm">
          {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => {
            const active = p === meta.page;
            return (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                disabled={active}
                className={
                  active
                    ? 'inline-flex h-8 min-w-8 items-center justify-center rounded-md bg-brand-600 px-2 text-xs font-bold text-white'
                    : 'inline-flex h-8 min-w-8 items-center justify-center rounded-md border border-ink-100 px-2 text-xs font-semibold text-ink-700 transition hover:border-brand-300 hover:text-brand-700 dark:border-ink-700 dark:text-ink-100'
                }
              >
                {p}
              </button>
            );
          })}
        </nav>
      )}

      {/* ── Print-only block (revealed by @media print rules) ───── */}
      <PrintReport
        leads={leads}
        totalShown={totalShown}
        debouncedSearch={debouncedSearch}
        statusFilter={statusFilter}
      />

      {/* ── Detail modal / slide-over ─────────────────────────────── */}
      <LeadDetailModal
        lead={activeLead}
        currentUserId={currentUserId}
        currentUserRole={currentUserRole}
        onClose={() => setActiveLead(null)}
        onLeadChanged={updateLeadInPlace}
      />
    </div>
  );
};

// ---------------------------------------------------------------------
// Sub-components — kept in-file because they only matter for this page
// ---------------------------------------------------------------------

const StatusChip = ({
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

const SkeletonTable = () => (
  <div className="overflow-hidden rounded-3xl border border-ink-100 bg-white dark:border-ink-700 dark:bg-ink-900">
    <div className="divide-y divide-ink-100 dark:divide-ink-700">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex animate-pulse items-center justify-between gap-4 px-5 py-4">
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/3 rounded bg-ink-100 dark:bg-ink-700" />
            <div className="h-2.5 w-1/4 rounded bg-ink-100 dark:bg-ink-700" />
          </div>
          <div className="h-7 w-20 rounded-full bg-ink-100 dark:bg-ink-700" />
          <div className="h-7 w-16 rounded-md bg-ink-100 dark:bg-ink-700" />
        </div>
      ))}
    </div>
  </div>
);

const EmptyState = ({
  onReset,
  hasFilters,
}: {
  onReset: () => void;
  hasFilters: boolean;
}) => (
  <div className="rounded-3xl border border-dashed border-ink-100 bg-white px-6 py-16 text-center dark:border-ink-700 dark:bg-ink-900">
    <Inbox className="mx-auto h-10 w-10 text-ink-300" />
    <h3 className="mt-3 text-base font-semibold text-ink-900 dark:text-ink-100">
      {hasFilters ? 'No leads match your filters' : 'Nothing in your queue yet'}
    </h3>
    <p className="mt-1 text-sm text-ink-500">
      {hasFilters
        ? 'Try clearing the search and status filter, or refresh after an admin assigns more leads.'
        : 'When an admin assigns you a lead it will show up here.'}
    </p>
    {hasFilters && (
      <div className="mt-4">
        <button
          type="button"
          onClick={onReset}
          className="text-sm font-semibold text-brand-700 hover:text-brand-800"
        >
          Reset filters &rarr;
        </button>
      </div>
    )}
  </div>
);

interface LeadTableProps {
  leads: Lead[];
  isFetching: boolean;
  onOpenDetails: (lead: Lead) => void;
  onLeadChanged: (id: string, partial: Partial<Lead>) => void;
}

const LeadTable = ({ leads, isFetching, onOpenDetails, onLeadChanged }: LeadTableProps) => (
  <div
    className={cn(
      'overflow-hidden rounded-3xl border border-ink-100 bg-white transition dark:border-ink-700 dark:bg-ink-900',
      isFetching && 'opacity-60',
    )}
  >
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-ink-100 bg-surface-muted/60 text-[11px] font-bold uppercase tracking-wider text-ink-500 dark:border-ink-700 dark:bg-ink-700/30">
            <th className="px-4 py-3">Student</th>
            <th className="px-4 py-3">Contact</th>
            <th className="px-4 py-3">Course</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Captured</th>
            <th className="px-4 py-3 text-right" />
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100 dark:divide-ink-700">
          {leads.map((lead) => {
            const courseTitle =
              lead.interestedCourse && typeof lead.interestedCourse === 'object'
                ? lead.interestedCourse.title
                : null;
            const waNumber = (lead.whatsapp ?? lead.phone).replace(/[^0-9]/g, '');
            const noteCount = (lead.notes ?? []).length;
            return (
              <tr
                key={lead.id}
                className="transition hover:bg-surface-muted/40 dark:hover:bg-ink-700/20"
              >
                <td className="px-4 py-3 align-top">
                  <p className="truncate font-semibold text-ink-900 dark:text-ink-100">
                    {lead.name}
                  </p>
                  <p className="truncate text-xs text-ink-500">{lead.email}</p>
                  {lead.occupation && (
                    <p className="truncate text-[11px] text-ink-500">{lead.occupation}</p>
                  )}
                </td>
                <td className="px-4 py-3 align-top">
                  <p className="font-mono text-xs text-ink-700 dark:text-ink-100">
                    {lead.phone}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1">
                    <a
                      href={`tel:${lead.phone}`}
                      title={`Call ${lead.phone}`}
                      className="inline-flex h-7 items-center gap-1 rounded-md border border-ink-100 px-2 text-[10px] font-semibold text-ink-700 transition hover:border-brand-300 hover:text-brand-700 dark:border-ink-700 dark:text-ink-100"
                    >
                      <Phone className="h-3 w-3" /> Call
                    </a>
                    <a
                      href={`https://wa.me/${waNumber}`}
                      target="_blank"
                      rel="noreferrer"
                      title={`WhatsApp ${lead.whatsapp ?? lead.phone}`}
                      className="inline-flex h-7 items-center gap-1 rounded-md border border-emerald-200 px-2 text-[10px] font-semibold text-emerald-700 transition hover:bg-emerald-50"
                    >
                      <MessageCircle className="h-3 w-3" /> WhatsApp
                    </a>
                    <a
                      href={`mailto:${lead.email}`}
                      title={`Email ${lead.email}`}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-ink-100 text-ink-500 transition hover:border-brand-300 hover:text-brand-700 dark:border-ink-700"
                    >
                      <Mail className="h-3 w-3" />
                    </a>
                  </div>
                </td>
                <td className="px-4 py-3 align-top text-sm text-ink-700 dark:text-ink-100">
                  {courseTitle ? (
                    <span className="line-clamp-2">{courseTitle}</span>
                  ) : (
                    <span className="text-ink-300">—</span>
                  )}
                  {lead.preferredBatch && (
                    <p className="mt-0.5 text-[11px] text-ink-500">{lead.preferredBatch}</p>
                  )}
                  <Badge tone="brand" className="mt-1 text-[10px]">
                    {lead.source}
                  </Badge>
                </td>
                <td className="px-4 py-3 align-top">
                  <LeadStatusSelect
                    leadId={lead.id}
                    status={lead.status}
                    onChanged={(next) => onLeadChanged(lead.id, { status: next })}
                  />
                  {noteCount > 0 && (
                    <p className="mt-1 inline-flex items-center gap-1 text-[10px] text-ink-500">
                      <StickyNote className="h-3 w-3" /> {noteCount} note
                      {noteCount === 1 ? '' : 's'}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3 align-top text-right text-xs text-ink-500">
                  {formatDate(lead.createdAt)}
                </td>
                <td className="px-4 py-3 align-top text-right">
                  <button
                    type="button"
                    onClick={() => onOpenDetails(lead)}
                    className="inline-flex items-center gap-1 rounded-md border border-ink-100 px-2.5 py-1.5 text-[11px] font-semibold text-ink-700 transition hover:border-brand-300 hover:text-brand-700 dark:border-ink-700 dark:text-ink-100"
                  >
                    <Eye className="h-3.5 w-3.5" /> View Details
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
);

/**
 * Hidden on screen, revealed by `@media print` in globals.css. Renders
 * a clean two-table summary of the currently visible leads so the staff
 * can hand a hard copy to a manager or save it as a PDF.
 */
const PrintReport = ({
  leads,
  totalShown,
  debouncedSearch,
  statusFilter,
}: {
  leads: Lead[];
  totalShown: number;
  debouncedSearch: string;
  statusFilter: LeadStatus | '';
}) => {
  const printedAt = new Date().toLocaleString();
  return (
    <section className="print-only">
      <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 4px' }}>
        My Leads · CRM Report
      </h2>
      <p style={{ fontSize: '12px', color: '#444', margin: '0 0 12px' }}>
        Smart Earning Pro · Generated {printedAt}
      </p>
      <p style={{ fontSize: '12px', color: '#444', margin: '0 0 16px' }}>
        Filter: status = <strong>{statusFilter || 'All'}</strong>
        {debouncedSearch ? <> · search = <strong>{debouncedSearch}</strong></> : null}
        {' · '}showing {leads.length} of {totalShown} matching lead(s)
      </p>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
        <thead>
          <tr style={{ background: '#f3f4f6' }}>
            <th style={{ textAlign: 'left', border: '1px solid #d1d5db', padding: '6px 8px' }}>Name</th>
            <th style={{ textAlign: 'left', border: '1px solid #d1d5db', padding: '6px 8px' }}>Email</th>
            <th style={{ textAlign: 'left', border: '1px solid #d1d5db', padding: '6px 8px' }}>Phone</th>
            <th style={{ textAlign: 'left', border: '1px solid #d1d5db', padding: '6px 8px' }}>Course</th>
            <th style={{ textAlign: 'left', border: '1px solid #d1d5db', padding: '6px 8px' }}>Status</th>
            <th style={{ textAlign: 'left', border: '1px solid #d1d5db', padding: '6px 8px' }}>Captured</th>
          </tr>
        </thead>
        <tbody>
          {leads.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'center' }}>
                No leads to show.
              </td>
            </tr>
          ) : (
            leads.map((lead) => {
              const courseTitle =
                lead.interestedCourse && typeof lead.interestedCourse === 'object'
                  ? lead.interestedCourse.title
                  : '—';
              return (
                <tr key={lead.id}>
                  <td style={{ border: '1px solid #d1d5db', padding: '6px 8px' }}>{lead.name}</td>
                  <td style={{ border: '1px solid #d1d5db', padding: '6px 8px' }}>{lead.email}</td>
                  <td style={{ border: '1px solid #d1d5db', padding: '6px 8px' }}>{lead.phone}</td>
                  <td style={{ border: '1px solid #d1d5db', padding: '6px 8px' }}>{courseTitle}</td>
                  <td style={{ border: '1px solid #d1d5db', padding: '6px 8px' }}>
                    {LEAD_STATUS_META[lead.status].label}
                  </td>
                  <td style={{ border: '1px solid #d1d5db', padding: '6px 8px' }}>
                    {formatDate(lead.createdAt)}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </section>
  );
};

