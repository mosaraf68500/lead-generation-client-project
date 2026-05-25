import type { ReactNode } from 'react';
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
