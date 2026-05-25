'use client';

/**
 * Global lead-capture flow.
 *
 * The new platform philosophy: there is NO traditional checkout. When a user
 * clicks "Enroll Now" / "Claim Offer" / "Proceed" (from the cart) we instead
 * open a high-converting LeadCaptureModal. Submitting the modal:
 *   1. POSTs the lead to `/api/leads` (backend stores it under the `leads`
 *      collection with status 'new').
 *   2. If the submitter is a brand-new email the backend auto-provisions a
 *      `student` user account and returns one-time credentials.
 *   3. The frontend uses those credentials to transparently sign them in via
 *      Better Auth and redirects them to /student so they land on a fully
 *      personalised dashboard immediately.
 *
 * This context is a tiny shell: it owns an `intent` payload describing what
 * the user expressed interest in (single course, multiple courses from the
 * cart, generic landing, etc.) and exposes `open()` / `close()` helpers any
 * component can call without prop-drilling.
 */

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

export interface LeadCaptureCourseRef {
  id: string;
  title: string;
  /** When true, the modal will pitch "Claim Special Offer" copy instead of "Enroll Now". */
  onSale?: boolean;
}

export interface LeadCaptureIntent {
  /** Free-form source string used both for analytics and CRM filtering. */
  source: string;
  /** Optional single course (course detail page, course card, special offer CTA). */
  course?: LeadCaptureCourseRef;
  /** Optional multi-course bucket (the cart / "Interested" page proceed action). */
  courses?: LeadCaptureCourseRef[];
  /** Custom modal heading override. */
  heading?: string;
  /** Custom modal sub-heading / value-prop override. */
  subheading?: string;
  /** Custom CTA button label. */
  cta?: string;
}

interface LeadCaptureContextValue {
  isOpen: boolean;
  intent: LeadCaptureIntent | null;
  open: (intent: LeadCaptureIntent) => void;
  close: () => void;
}

const LeadCaptureContext = createContext<LeadCaptureContextValue | null>(null);

export const LeadCaptureProvider = ({ children }: { children: ReactNode }) => {
  const [intent, setIntent] = useState<LeadCaptureIntent | null>(null);

  const open = useCallback((next: LeadCaptureIntent) => {
    setIntent(next);
  }, []);
  const close = useCallback(() => setIntent(null), []);

  const value = useMemo<LeadCaptureContextValue>(
    () => ({ isOpen: intent !== null, intent, open, close }),
    [intent, open, close],
  );

  return (
    <LeadCaptureContext.Provider value={value}>{children}</LeadCaptureContext.Provider>
  );
};

export const useLeadCapture = (): LeadCaptureContextValue => {
  const ctx = useContext(LeadCaptureContext);
  if (!ctx) throw new Error('useLeadCapture must be used within <LeadCaptureProvider>');
  return ctx;
};
