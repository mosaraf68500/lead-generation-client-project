'use client';

import { useEffect, useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { LeadForm } from '@/components/common/LeadForm';
import { safeJsonParse } from '@/utils';

/**
 * Global lead-capture pop-up.
 *
 * Triggers:
 *  - Time-delayed: after `delayMs` of active session time
 *  - Exit-intent:  cursor leaves the viewport from the top edge
 *
 * Once submitted OR dismissed it stores a timestamp in localStorage so the
 * same visitor isn't pestered. The cooldown window is configurable.
 */

interface PopupLeadCaptureProps {
  delayMs?: number;
  /** Milliseconds to remember the dismissal for. Default: 7 days. */
  cooldownMs?: number;
  /** Optional lead source override. Defaults to `'popup'`. */
  source?: string;
}

const STORAGE_KEY = 'sep-popup-dismissed-at';

export const PopupLeadCapture = ({
  delayMs = 25_000,
  cooldownMs = 7 * 24 * 60 * 60 * 1000,
  source = 'popup',
}: PopupLeadCaptureProps) => {
  const [open, setOpen] = useState(false);
  const [armed, setArmed] = useState(false);

  // Bootstrap: decide whether this visitor should ever see the popup.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const dismissedAt = safeJsonParse<number | null>(window.localStorage.getItem(STORAGE_KEY), null);
    if (dismissedAt && Date.now() - dismissedAt < cooldownMs) {
      return;
    }
    setArmed(true);
  }, [cooldownMs]);

  // Time-delayed trigger
  useEffect(() => {
    if (!armed) return;
    const timer = window.setTimeout(() => setOpen(true), delayMs);
    return () => window.clearTimeout(timer);
  }, [armed, delayMs]);

  // Exit-intent trigger (top-of-viewport mouseleave)
  useEffect(() => {
    if (!armed) return;
    const onMouseLeave = (event: MouseEvent) => {
      if (event.clientY <= 0) setOpen(true);
    };
    document.addEventListener('mouseleave', onMouseLeave);
    return () => document.removeEventListener('mouseleave', onMouseLeave);
  }, [armed]);

  // Body scroll lock while open
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const dismiss = (): void => {
    setOpen(false);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Date.now()));
    }
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="popup-lead-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={dismiss}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-cardHover dark:bg-ink-900">
        <div className="relative gradient-brand px-6 py-6 text-white sm:px-8">
          <button
            type="button"
            aria-label="Close"
            onClick={dismiss}
            className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/15 hover:bg-white/25"
          >
            <X className="h-4 w-4" />
          </button>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" /> Exclusive offer
          </span>
          <h2 id="popup-lead-title" className="mt-3 text-2xl font-bold leading-tight">
            Save 20% on your first course
          </h2>
          <p className="mt-1 text-sm text-white/85">
            Drop your details and we&apos;ll send a personal recommendation + a one-time discount code on WhatsApp.
          </p>
        </div>
        <div className="px-6 py-6 sm:px-8">
          <LeadForm
            source={source}
            variant="bare"
            compact
            heading=""
            subheading=""
            onSuccess={dismiss}
          />
        </div>
      </div>
    </div>
  );
};
