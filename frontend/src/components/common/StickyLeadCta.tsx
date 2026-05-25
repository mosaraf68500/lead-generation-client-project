'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight, MessageCircle, X, Phone } from 'lucide-react';
import { safeJsonParse } from '@/utils';

/**
 * Sticky bottom CTA bar. Appears on marketing routes only, after a tiny
 * scroll, and stays dismissable per session. Designed to maximise inbound
 * lead capture without obstructing reading.
 */

const STORAGE_KEY = 'sep-sticky-cta-dismissed';
const WHATSAPP_LINK = '8801522114096';
const PHONE_TEL = '+8801783175638';

// Routes where the CTA should NOT show (avoid duplicating the bar on
// dashboard/auth screens that already have their own focused CTAs).
const HIDE_ON = ['/login', '/register', '/student', '/staff', '/admin', '/super-admin'];

export const StickyLeadCta = () => {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  // Decide visibility on mount: hide if already dismissed this session OR if
  // the route is excluded.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const dismissed = safeJsonParse<boolean>(window.sessionStorage.getItem(STORAGE_KEY), false);
    if (dismissed) return;
    if (HIDE_ON.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return;

    const onScroll = () => {
      if (window.scrollY > 320) setVisible(true);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);

  if (!visible) return null;

  const dismiss = (): void => {
    setVisible(false);
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(true));
    }
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-3 z-30 px-3 sm:bottom-5 sm:px-5 animate-fadeIn">
      <div className="pointer-events-auto mx-auto flex max-w-4xl items-center gap-3 rounded-full border border-ink-100 bg-white px-3 py-2 shadow-cardHover dark:border-ink-700 dark:bg-ink-900 sm:px-4">
        <span className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white sm:inline-flex">
          <MessageCircle className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink-900 dark:text-ink-100">
            Talk to an advisor and get a free roadmap
          </p>
          <p className="hidden truncate text-xs text-ink-500 sm:block">
            We&apos;ll reply on WhatsApp within 24 hours.
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <a
            href={`https://wa.me/${WHATSAPP_LINK}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden h-9 items-center gap-1.5 rounded-full bg-brand-50 px-3 text-xs font-semibold text-brand-700 hover:bg-brand-100 sm:inline-flex"
          >
            <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
          </a>
          <a
            href={`tel:${PHONE_TEL}`}
            className="hidden h-9 w-9 items-center justify-center rounded-full text-ink-700 hover:bg-ink-100 dark:text-ink-100 dark:hover:bg-ink-700 md:inline-flex"
            aria-label="Call us"
          >
            <Phone className="h-4 w-4" />
          </a>
          <Link
            href="/contact"
            className="inline-flex h-9 items-center gap-1 rounded-full bg-brand-600 px-3.5 text-xs font-bold text-white shadow transition hover:bg-brand-700"
          >
            Free consult <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={dismiss}
            className="ml-1 inline-flex h-7 w-7 items-center justify-center rounded-full text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-700"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
