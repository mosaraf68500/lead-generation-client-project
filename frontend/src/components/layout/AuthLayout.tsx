import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/utils';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  footer: ReactNode;
  children: ReactNode;
  /** Tighter max-width for login (where there are fewer fields). */
  size?: 'sm' | 'md';
}

/**
 * Centered card auth layout (ShopBangla style). A subtle gray surface, a
 * single rounded card with brand chip on top, and centered title + subtitle.
 * Pages just pass their form into `children` and a footer link slot.
 */
export const AuthLayout = ({ title, subtitle, footer, children, size = 'md' }: AuthLayoutProps) => (
  <main className="flex min-h-screen items-center justify-center bg-surface-muted px-4 py-10 dark:bg-ink-900">
    <div
      className={cn(
        'w-full',
        size === 'sm' ? 'max-w-md' : 'max-w-xl',
      )}
    >
      {/* Brand strip above the card */}
      <div className="mb-5 flex justify-center">
        <Link href="/" className="inline-flex items-center gap-2 text-lg font-extrabold text-ink-900 dark:text-ink-100">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-white">
            S
          </span>
          Smart<span className="text-brand-600">Earning</span>
        </Link>
      </div>

      <section className="rounded-2xl border border-ink-100 bg-white px-6 py-8 shadow-card sm:px-10 sm:py-10 dark:border-ink-700 dark:bg-ink-900">
        <header className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl dark:text-ink-100">
            {title}
          </h1>
          <p className="mt-2 text-sm text-ink-500 sm:text-base">{subtitle}</p>
        </header>

        <div className="mt-7">{children}</div>

        <footer className="mt-7 border-t border-ink-100 pt-5 text-center text-sm text-ink-500 dark:border-ink-700">
          {footer}
        </footer>
      </section>
    </div>
  </main>
);
