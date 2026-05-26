/**
 * Shared period-filter constants used by both:
 *   - `admin/page.tsx`        (Server Component)
 *   - `admin/OverviewActions.tsx`  (Client Component, `'use client'`)
 *
 * They CANNOT live inside `OverviewActions.tsx`. Importing values from a
 * `'use client'` module into a Server Component turns every export into a
 * proxy "client reference" — calling array methods on those proxies
 * fails at runtime with:
 *
 *   "Attempted to call find() from the server but find is on the client."
 *
 * Plain-TS constants in this file are safe to import from either side.
 */

export const PERIOD_OPTIONS = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This week' },
  { id: 'month', label: 'This month' },
  { id: 'year', label: 'This year' },
] as const;

export type PeriodId = (typeof PERIOD_OPTIONS)[number]['id'];
