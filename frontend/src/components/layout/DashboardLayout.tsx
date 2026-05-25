import type { ReactNode } from 'react';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { cn } from '@/utils';

interface DashboardLayoutProps {
  title: string;
  /** Plain subtitle shown directly under the title (always visible). */
  subtitle?: string;
  /**
   * ShopBangla-style "Overview for Today (May 26, 2026)" caption. When set,
   * it's rendered above the title in the small uppercase kicker style.
   */
  overview?: string;
  actions?: ReactNode;
  children: ReactNode;
  /**
   * When `true`, the header inner block and the main content are centered
   * inside a max-width container instead of stretching to the full viewport.
   *
   * Used by the Personal pages (Profile, History, Interested, Wishlist,
   * Support center) so long read/edit surfaces don't sprawl on wide screens.
   * Overview/analytics dashboards keep the default full-width layout.
   */
  contained?: boolean;
  /**
   * Skip rendering the default header band entirely. Useful when the page
   * wants to roll its own hero — e.g. the Profile page renders a
   * `PageHero` strip with breadcrumbs instead of the generic title bar.
   */
  hideHeader?: boolean;
}

export const DashboardLayout = ({
  title,
  subtitle,
  overview,
  actions,
  children,
  contained = false,
  hideHeader = false,
}: DashboardLayoutProps) => {
  // Shared inner-wrapper classes. When `contained` is on, we cap the width
  // and center horizontally; otherwise the inner block just inherits the
  // outer padding for the legacy full-width look.
  const innerClass = cn(
    'px-4 sm:px-8',
    contained ? 'mx-auto w-full max-w-5xl' : 'w-full',
  );

  return (
    <div className="flex min-h-screen bg-surface-muted dark:bg-ink-900">
      <DashboardSidebar />
      <div className="flex-1">
        {/* ── Top utility strip — always visible across every dashboard page.
            Currently hosts the "Visit Site" CTA so an operator can jump back
            to the public storefront in one click. Hidden when printing so it
            doesn't pollute the report output. */}
        <div className="no-print border-b border-ink-100 bg-surface-muted/40 dark:border-ink-700 dark:bg-ink-900/40">
          <div className={cn(innerClass, 'flex h-12 items-center justify-end gap-2')}>
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center gap-2 rounded-md border border-brand-300 bg-white px-3 text-xs font-semibold text-brand-700 transition hover:bg-brand-50 dark:border-brand-700/50 dark:bg-ink-900 dark:text-brand-300"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Visit Site
            </Link>
          </div>
        </div>

        {!hideHeader && (
          <header className="border-b border-ink-100 bg-white dark:border-ink-700 dark:bg-ink-900">
            <div
              className={cn(
                innerClass,
                'flex flex-col gap-4 py-6 md:flex-row md:items-center md:justify-between',
              )}
            >
              <div>
                {overview && (
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink-500">
                    {overview}
                  </p>
                )}
                <h1 className="mt-1 text-2xl font-bold text-ink-900 dark:text-ink-100">{title}</h1>
                {subtitle && <p className="mt-1 text-sm text-ink-500">{subtitle}</p>}
              </div>
              {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
            </div>
          </header>
        )}
        {/* When the caller opts out of the default header, it renders its own
            full-bleed hero followed by contained body sections — so we skip
            the container padding here and let the page handle its own widths. */}
        <main className={hideHeader ? '' : cn(innerClass, 'py-8')}>{children}</main>
      </div>
    </div>
  );
};
