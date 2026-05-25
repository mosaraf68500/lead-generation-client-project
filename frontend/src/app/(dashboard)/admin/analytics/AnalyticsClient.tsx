'use client';

/**
 * Client-rendered analytics dashboard.
 *
 * Fetches lead + course analytics from the API and re-fetches on:
 *   - manual "Refresh" button click
 *   - period filter change (Today / This week / This month / This year) —
 *     applied locally to the `byDay` time series since the backend already
 *     returns the full trailing window
 *   - 60-second background polling
 *
 * The toolbar (period filter / Refresh / Download Report) mirrors the
 * dashboard home so the two pages feel like the same product surface.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  RefreshCw,
  TrendingUp,
  Inbox,
  Activity,
  GraduationCap,
  BarChart3,
  Flame,
  Star,
  Download,
} from 'lucide-react';
import { fetchLeadAnalytics, type LeadAnalytics } from '@/services/leads';
import { fetchCourseAnalytics, type CourseAnalytics } from '@/services/courses';
import { StatCard } from '@/components/common/StatCard';
import { Button } from '@/components/ui/Button';
import { LeadFunnel } from '@/components/common/LeadFunnel';
import { MiniBarChart } from '@/components/common/MiniBarChart';
import { cn } from '@/utils';

/**
 * Same option ids as the dashboard home (`OverviewActions`) so the language
 * stays consistent for the admin. `days` is the trailing-window length we
 * trim the `byDay` time series to.
 */
const PERIODS = [
  { id: 'today', label: 'Today', days: 1 },
  { id: 'week', label: 'This week', days: 7 },
  { id: 'month', label: 'This month', days: 30 },
  { id: 'year', label: 'This year', days: 365 },
] as const;
type PeriodId = (typeof PERIODS)[number]['id'];

const POLL_MS = 60_000;

interface AnalyticsState {
  leads: LeadAnalytics | null;
  courses: CourseAnalytics | null;
  lastUpdated: number | null;
  isLoading: boolean;
}

export const AnalyticsClient = () => {
  const [state, setState] = useState<AnalyticsState>({
    leads: null,
    courses: null,
    lastUpdated: null,
    isLoading: true,
  });
  const [period, setPeriod] = useState<PeriodId>('month');
  const mountedRef = useRef(true);

  const refresh = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true }));
    const [leads, courses] = await Promise.all([
      fetchLeadAnalytics(),
      fetchCourseAnalytics(),
    ]);
    if (!mountedRef.current) return;
    setState({
      leads,
      courses,
      lastUpdated: Date.now(),
      isLoading: false,
    });
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    void refresh();
    const id = setInterval(() => void refresh(), POLL_MS);
    return () => {
      mountedRef.current = false;
      clearInterval(id);
    };
  }, [refresh]);

  // Trim the time series to the requested period.
  const trimmedByDay = useMemo(() => {
    const days = PERIODS.find((p) => p.id === period)?.days ?? 30;
    return (state.leads?.byDay ?? []).slice(-days).map((d) => ({
      label: d.date.slice(5),
      value: d.count,
    }));
  }, [state.leads?.byDay, period]);

  const currentPeriodLabel = PERIODS.find((p) => p.id === period)?.label ?? 'This month';

  const lastUpdatedLabel = state.lastUpdated
    ? new Date(state.lastUpdated).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : '—';

  const total = state.leads?.total ?? 0;
  const totalForPct = total || 1;
  const bySource = state.leads?.bySource ?? [];

  return (
    <div className="space-y-6">
      {/* ── Toolbar — mirrors the dashboard home actions so the two
          pages share the same visual grammar (period filter · outline
          refresh · green Download Report). ───────────────────────── */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink-100 bg-white p-4 dark:border-ink-700 dark:bg-ink-900">
        <div className="flex items-center gap-3 text-xs text-ink-500">
          <span
            className={cn(
              'inline-flex h-2 w-2 rounded-full',
              state.isLoading ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500',
            )}
            aria-hidden
          />
          <span>
            {state.isLoading ? 'Refreshing…' : `Live · updated ${lastUpdatedLabel}`}
          </span>
          <span className="hidden sm:inline">· auto-refresh every {POLL_MS / 1000}s</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* 1. Period filter */}
          <div className="relative">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as PeriodId)}
              aria-label="Filter period"
              className="h-10 appearance-none rounded-md border border-ink-100 bg-white pl-3 pr-8 text-sm font-semibold text-ink-700 transition focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-100"
            >
              {PERIODS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-ink-400">
              ▾
            </span>
          </div>

          {/* 2. Refresh */}
          <Button
            type="button"
            variant="outline"
            leftIcon={<RefreshCw className={cn('h-4 w-4', state.isLoading && 'animate-spin')} />}
            onClick={() => void refresh()}
            disabled={state.isLoading}
          >
            Refresh
          </Button>

          {/* 3. Download report (uses window.print which surfaces the
              `.print-only` summary block we render below). */}
          <Button
            type="button"
            variant="primary"
            leftIcon={<Download className="h-4 w-4" />}
            onClick={() => window.print()}
          >
            Download Report
          </Button>
        </div>
      </div>

      {/* ── Print-only summary (hidden on-screen, rendered on print) ─ */}
      <section className="print-only">
        <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 4px' }}>
          Analytics report · {currentPeriodLabel}
        </h2>
        <p style={{ fontSize: '12px', color: '#444', margin: '0 0 16px' }}>
          Smart Earning Pro · Generated {new Date().toLocaleString()}
        </p>

        <h3 style={{ fontSize: '14px', fontWeight: 600, margin: '12px 0 6px' }}>
          Key performance indicators
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr style={{ background: '#f3f4f6' }}>
              <th style={{ textAlign: 'left', border: '1px solid #d1d5db', padding: '6px 8px' }}>Metric</th>
              <th style={{ textAlign: 'right', border: '1px solid #d1d5db', padding: '6px 8px' }}>Value</th>
              <th style={{ textAlign: 'left', border: '1px solid #d1d5db', padding: '6px 8px' }}>Note</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #d1d5db', padding: '6px 8px' }}>Total leads</td>
              <td style={{ border: '1px solid #d1d5db', padding: '6px 8px', textAlign: 'right' }}>
                {total}
              </td>
              <td style={{ border: '1px solid #d1d5db', padding: '6px 8px' }}>Lifetime</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #d1d5db', padding: '6px 8px' }}>New / awaiting reply</td>
              <td style={{ border: '1px solid #d1d5db', padding: '6px 8px', textAlign: 'right' }}>
                {state.leads?.newCount ?? 0}
              </td>
              <td style={{ border: '1px solid #d1d5db', padding: '6px 8px' }}>Status = new</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #d1d5db', padding: '6px 8px' }}>Contacted</td>
              <td style={{ border: '1px solid #d1d5db', padding: '6px 8px', textAlign: 'right' }}>
                {state.leads?.contactedCount ?? 0}
              </td>
              <td style={{ border: '1px solid #d1d5db', padding: '6px 8px' }}>First touch made</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #d1d5db', padding: '6px 8px' }}>In progress</td>
              <td style={{ border: '1px solid #d1d5db', padding: '6px 8px', textAlign: 'right' }}>
                {state.leads?.inProgressCount ?? 0}
              </td>
              <td style={{ border: '1px solid #d1d5db', padding: '6px 8px' }}>Active</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #d1d5db', padding: '6px 8px' }}>Enrolled</td>
              <td style={{ border: '1px solid #d1d5db', padding: '6px 8px', textAlign: 'right' }}>
                {state.leads?.enrolledCount ?? 0}
              </td>
              <td style={{ border: '1px solid #d1d5db', padding: '6px 8px' }}>Converted</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #d1d5db', padding: '6px 8px' }}>Conversion rate</td>
              <td style={{ border: '1px solid #d1d5db', padding: '6px 8px', textAlign: 'right' }}>
                {state.leads?.conversionRate ?? 0}%
              </td>
              <td style={{ border: '1px solid #d1d5db', padding: '6px 8px' }}>Lead → enrolled</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #d1d5db', padding: '6px 8px' }}>Published courses</td>
              <td style={{ border: '1px solid #d1d5db', padding: '6px 8px', textAlign: 'right' }}>
                {state.courses?.published ?? 0}
              </td>
              <td style={{ border: '1px solid #d1d5db', padding: '6px 8px' }}>
                {state.courses?.drafts ?? 0} drafts · {state.courses?.onSale ?? 0} on sale
              </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #d1d5db', padding: '6px 8px' }}>Total enrolments</td>
              <td style={{ border: '1px solid #d1d5db', padding: '6px 8px', textAlign: 'right' }}>
                {(state.courses?.totalEnrollments ?? 0).toLocaleString()}
              </td>
              <td style={{ border: '1px solid #d1d5db', padding: '6px 8px' }}>Across catalog</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #d1d5db', padding: '6px 8px' }}>Average rating</td>
              <td style={{ border: '1px solid #d1d5db', padding: '6px 8px', textAlign: 'right' }}>
                {state.courses?.avgRating?.toFixed(1) ?? '0.0'}
              </td>
              <td style={{ border: '1px solid #d1d5db', padding: '6px 8px' }}>Weighted</td>
            </tr>
          </tbody>
        </table>

        <h3 style={{ fontSize: '14px', fontWeight: 600, margin: '20px 0 6px' }}>
          Top lead sources
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr style={{ background: '#f3f4f6' }}>
              <th style={{ textAlign: 'left', border: '1px solid #d1d5db', padding: '6px 8px' }}>Source</th>
              <th style={{ textAlign: 'right', border: '1px solid #d1d5db', padding: '6px 8px' }}>Leads</th>
              <th style={{ textAlign: 'right', border: '1px solid #d1d5db', padding: '6px 8px' }}>Share</th>
            </tr>
          </thead>
          <tbody>
            {bySource.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'center' }}>
                  No attribution data yet.
                </td>
              </tr>
            ) : (
              bySource.map((row) => (
                <tr key={row.source}>
                  <td style={{ border: '1px solid #d1d5db', padding: '6px 8px' }}>{row.source}</td>
                  <td style={{ border: '1px solid #d1d5db', padding: '6px 8px', textAlign: 'right' }}>
                    {row.count}
                  </td>
                  <td style={{ border: '1px solid #d1d5db', padding: '6px 8px', textAlign: 'right' }}>
                    {Math.round((row.count / totalForPct) * 100)}%
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <h3 style={{ fontSize: '14px', fontWeight: 600, margin: '20px 0 6px' }}>
          Top courses
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr style={{ background: '#f3f4f6' }}>
              <th style={{ textAlign: 'left', border: '1px solid #d1d5db', padding: '6px 8px' }}>Title</th>
              <th style={{ textAlign: 'right', border: '1px solid #d1d5db', padding: '6px 8px' }}>Enrolments</th>
              <th style={{ textAlign: 'right', border: '1px solid #d1d5db', padding: '6px 8px' }}>Rating</th>
            </tr>
          </thead>
          <tbody>
            {state.courses && state.courses.topCourses.length > 0 ? (
              state.courses.topCourses.map((c) => (
                <tr key={c.id}>
                  <td style={{ border: '1px solid #d1d5db', padding: '6px 8px' }}>{c.title}</td>
                  <td style={{ border: '1px solid #d1d5db', padding: '6px 8px', textAlign: 'right' }}>
                    {c.enrollmentsCount.toLocaleString()}
                  </td>
                  <td style={{ border: '1px solid #d1d5db', padding: '6px 8px', textAlign: 'right' }}>
                    {c.ratingAvg.toFixed(1)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'center' }}>
                  No courses yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {/* ── KPI strip ────────────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard
          icon={Inbox}
          label="Total leads"
          value={total}
          hint="Lifetime"
          tone="brand"
        />
        <StatCard
          icon={TrendingUp}
          label="Conversion rate"
          value={`${state.leads?.conversionRate ?? 0}%`}
          hint="Lead → enrolled"
          tone="accent"
        />
        <StatCard
          icon={Activity}
          label="In progress"
          value={state.leads?.inProgressCount ?? 0}
          hint="Currently engaged"
          tone="warning"
        />
        <StatCard
          icon={GraduationCap}
          label="Published courses"
          value={state.courses?.published ?? 0}
          hint={`${state.courses?.drafts ?? 0} drafts · ${state.courses?.onSale ?? 0} on sale`}
          tone="brand"
        />
        <StatCard
          icon={Star}
          label="Avg rating"
          value={state.courses?.avgRating?.toFixed(1) ?? '0.0'}
          hint="Weighted across catalog"
          tone="neutral"
        />
      </div>

      {/* ── Funnel + trend ───────────────────────────────────────── */}
      <div className="grid gap-5 lg:grid-cols-2">
        <article className="rounded-2xl border border-ink-100 bg-white p-5 dark:border-ink-700 dark:bg-ink-900">
          <header className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-700/30">
                <TrendingUp className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-ink-900 dark:text-ink-100">
                  Pipeline funnel
                </h3>
                <p className="text-xs text-ink-500">
                  {state.leads?.conversionRate ?? 0}% lead → enrolled
                </p>
              </div>
            </div>
          </header>
          {state.leads ? (
            <LeadFunnel
              newCount={state.leads.newCount}
              contacted={state.leads.contactedCount}
              inProgress={state.leads.inProgressCount}
              enrolled={state.leads.enrolledCount}
            />
          ) : (
            <p className="text-xs text-ink-500">No data yet.</p>
          )}
        </article>

        <article className="rounded-2xl border border-ink-100 bg-white p-5 dark:border-ink-700 dark:bg-ink-900">
          <header className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-700/30">
                <BarChart3 className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-ink-900 dark:text-ink-100">
                  Leads over time
                </h3>
                <p className="text-xs text-ink-500">{currentPeriodLabel}</p>
              </div>
            </div>
          </header>
          <MiniBarChart data={trimmedByDay} />
        </article>
      </div>

      {/* ── Source mix + Top courses ─────────────────────────────── */}
      <div className="grid gap-5 lg:grid-cols-2">
        <article className="rounded-2xl border border-ink-100 bg-white p-5 dark:border-ink-700 dark:bg-ink-900">
          <header className="mb-3 flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <Flame className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-ink-900 dark:text-ink-100">Top sources</h3>
              <p className="text-xs text-ink-500">Where inbound is coming from</p>
            </div>
          </header>
          {bySource.length === 0 ? (
            <p className="text-xs text-ink-500">No attribution data yet.</p>
          ) : (
            <ul className="space-y-2">
              {bySource.map((row) => {
                const pct = Math.round((row.count / totalForPct) * 100);
                return (
                  <li key={row.source} className="text-xs text-ink-500">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-ink-700 dark:text-ink-100">
                        {row.source}
                      </span>
                      <span>
                        {row.count} ({pct}%)
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-ink-100 dark:bg-ink-700">
                      <div
                        className="h-full bg-brand-500"
                        style={{ width: `${Math.max(pct, 4)}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </article>

        <article className="rounded-2xl border border-ink-100 bg-white p-5 dark:border-ink-700 dark:bg-ink-900">
          <header className="mb-3 flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <Star className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-ink-900 dark:text-ink-100">Top courses</h3>
              <p className="text-xs text-ink-500">
                {state.courses
                  ? `${state.courses.totalEnrollments.toLocaleString()} total enrolments`
                  : ''}
              </p>
            </div>
          </header>
          {state.courses && state.courses.topCourses.length > 0 ? (
            <ul className="divide-y divide-ink-100 dark:divide-ink-700">
              {state.courses.topCourses.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between py-2 text-sm"
                >
                  <span className="truncate font-medium text-ink-900 dark:text-ink-100">
                    {c.title}
                  </span>
                  <div className="ml-3 flex shrink-0 items-center gap-3 text-xs text-ink-500">
                    <span className="inline-flex items-center gap-1">
                      <Star className="h-3 w-3 text-amber-500" />
                      {c.ratingAvg.toFixed(1)}
                    </span>
                    <span>{c.enrollmentsCount.toLocaleString()} students</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-ink-500">No courses yet.</p>
          )}
        </article>
      </div>

      {/* ── Categories (course count breakdown) ──────────────────── */}
      <article className="rounded-2xl border border-ink-100 bg-white p-5 dark:border-ink-700 dark:bg-ink-900">
        <header className="mb-3 flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
            <BarChart3 className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-ink-900 dark:text-ink-100">
              Catalog mix by category
            </h3>
            <p className="text-xs text-ink-500">Course distribution across active taxonomy</p>
          </div>
        </header>
        {state.courses && state.courses.byCategory.length > 0 ? (
          <ul className="space-y-2">
            {state.courses.byCategory.map((row) => {
              const totalCourses = state.courses?.total || 1;
              const pct = Math.round((row.count / totalCourses) * 100);
              return (
                <li key={row.category} className="text-xs text-ink-500">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-ink-700 dark:text-ink-100">
                      {row.category}
                    </span>
                    <span>
                      {row.count} ({pct}%)
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-ink-100 dark:bg-ink-700">
                    <div
                      className="h-full bg-brand-500"
                      style={{ width: `${Math.max(pct, 4)}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-xs text-ink-500">No category data yet.</p>
        )}
      </article>
    </div>
  );
};
