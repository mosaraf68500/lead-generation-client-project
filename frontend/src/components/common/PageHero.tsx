import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

/**
 * "ShopBangla"-style page hero strip. Renders a breadcrumb on a muted band,
 * a big two-tone headline (first word inherits ink, accent word is brand-
 * green), and an optional supporting paragraph below.
 *
 * Used at the top of dashboard "Personal" pages (Profile, History,
 * Interested, Wishlist, Support) so they feel like consistent storefront
 * pages and not generic admin chrome.
 */

export interface BreadcrumbItem {
  label: string;
  /** Omit for the current (last) crumb so it renders as plain text. */
  href?: string;
}

interface PageHeroProps {
  /** Breadcrumb items ordered from root to current page. */
  breadcrumbs?: BreadcrumbItem[];
  /** Main heading. Split into `lead` (default colour) + `accent` (brand-green). */
  lead: string;
  accent?: string;
  /** Optional sub-description sitting below the headline. */
  description?: string;
}

export const PageHero = ({
  breadcrumbs = [{ label: 'Home', href: '/' }],
  lead,
  accent,
  description,
}: PageHeroProps) => (
  <section className="border-b border-ink-100 bg-surface-muted dark:border-ink-700 dark:bg-ink-900/60">
    <div className="px-4 py-10 sm:px-8 sm:py-12">
      {breadcrumbs.length > 0 && (
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.18em] text-ink-500"
        >
          {breadcrumbs.map((c, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <span key={`${c.label}-${idx}`} className="flex items-center gap-1">
                {c.href && !isLast ? (
                  <Link href={c.href} className="hover:text-brand-600">
                    {c.label}
                  </Link>
                ) : (
                  <span className={isLast ? 'text-ink-900 dark:text-ink-100' : ''}>
                    {c.label}
                  </span>
                )}
                {!isLast && <ChevronRight className="h-3 w-3" />}
              </span>
            );
          })}
        </nav>
      )}
      <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl dark:text-ink-100">
        {lead}
        {accent && <span className="text-brand-600"> {accent}</span>}
      </h1>
      {description && (
        <p className="mt-2 max-w-xl text-sm text-ink-500">{description}</p>
      )}
    </div>
  </section>
);
