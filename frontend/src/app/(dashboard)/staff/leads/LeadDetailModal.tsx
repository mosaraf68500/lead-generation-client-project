'use client';

/**
 * Lead detail slide-over for the staff "My Leads" CRM.
 *
 * Differs from the admin LeadDetailDrawer in two important ways:
 *   1. No assign / delete affordances — staff can't reassign or remove leads.
 *   2. After a note is added we mirror the server's returned lead into the
 *      parent's in-memory cache via `onLeadChanged`. This avoids a full
 *      `router.refresh()` (the staff page is fully client-rendered) and
 *      keeps the notes timeline + table row in sync instantly.
 */

import { useEffect, useState } from 'react';
import {
  X,
  Mail,
  Phone,
  MessageCircle,
  Briefcase,
  Clock,
  Globe,
  Tag,
  StickyNote,
  Send,
  ExternalLink,
  Calendar,
} from 'lucide-react';
import type { Lead, UserRole } from '@/types';
import { LEAD_STATUS_META } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { LeadStatusSelect } from '@/app/(dashboard)/admin/leads/LeadStatusSelect';
import { useToast } from '@/context/ToastContext';
import { addLeadNote } from '@/services/leads';
import { ApiError } from '@/services/api';
import { formatDate } from '@/utils';

interface LeadDetailModalProps {
  lead: Lead | null;
  currentUserId: string;
  currentUserRole: UserRole;
  onClose: () => void;
  /** Mutate the parent's in-memory lead cache (used after add-note). */
  onLeadChanged: (id: string, partial: Partial<Lead>) => void;
}

/** Pretty timestamp like "Mar 14, 2025 · 4:30 PM". */
const formatTimestamp = (value: string | Date): string => {
  const d = new Date(value);
  const date = d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const time = d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
  return `${date} · ${time}`;
};

export const LeadDetailModal = ({
  lead,
  onClose,
  onLeadChanged,
}: LeadDetailModalProps) => {
  const { push } = useToast();
  const [noteDraft, setNoteDraft] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  // Wipe the textarea when the modal swaps leads (or closes).
  useEffect(() => {
    setNoteDraft('');
  }, [lead?.id]);

  // Esc closes the modal — common a11y expectation for slide-overs.
  useEffect(() => {
    if (!lead) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lead, onClose]);

  if (!lead) return null;

  // Snapshot of derived values for rendering.
  const courseTitle =
    lead.interestedCourse && typeof lead.interestedCourse === 'object'
      ? lead.interestedCourse.title
      : null;
  const courseSlug =
    lead.interestedCourse && typeof lead.interestedCourse === 'object'
      ? lead.interestedCourse.slug
      : null;
  const waNumber = (lead.whatsapp ?? lead.phone).replace(/[^0-9]/g, '');
  const notes = lead.notes ?? [];

  const handleAddNote = async () => {
    const message = noteDraft.trim();
    if (!message) return;
    setIsSubmittingNote(true);
    try {
      const updated = await addLeadNote(lead.id, message);
      // Mirror the server's authoritative copy back into the parent —
      // this updates both the modal AND the underlying row in the
      // table (which shares the same lead object via id matching).
      onLeadChanged(lead.id, { notes: updated.notes, updatedAt: updated.updatedAt });
      push({ variant: 'success', title: 'Note added' });
      setNoteDraft('');
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Could not add note';
      push({ variant: 'error', title: 'Failed', description: msg });
    } finally {
      setIsSubmittingNote(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 no-print">
      {/* Click-outside backdrop */}
      <button
        type="button"
        aria-label="Close drawer"
        onClick={onClose}
        className="absolute inset-0 bg-ink-900/40"
      />

      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-ink-100 bg-white dark:border-ink-700 dark:bg-ink-900">
        {/* ── Header ─────────────────────────────────────────────── */}
        <header className="sticky top-0 z-10 border-b border-ink-100 bg-white px-5 py-4 dark:border-ink-700 dark:bg-ink-900">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                Lead Details
              </p>
              <h2 className="mt-0.5 truncate text-lg font-bold text-ink-900 dark:text-ink-100">
                {lead.name}
              </h2>
              <p className="truncate text-xs text-ink-500">
                Captured {formatDate(lead.createdAt)}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-ink-100 text-ink-500 hover:text-ink-700 dark:border-ink-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Status + source on the header so it's always visible */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <LeadStatusSelect
              leadId={lead.id}
              status={lead.status}
              onChanged={(next) => onLeadChanged(lead.id, { status: next })}
            />
            <Badge tone="neutral" className="bg-transparent">
              <Tag className="mr-1 h-3 w-3" /> {lead.source}
            </Badge>
          </div>
        </header>

        {/* ── Body ───────────────────────────────────────────────── */}
        <div className="flex-1 space-y-5 px-5 py-5">
          {/* Quick-action contact buttons — big & tactile */}
          <section className="grid grid-cols-3 gap-2">
            <a
              href={`tel:${lead.phone}`}
              className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-ink-100 bg-white px-3 py-3 text-center text-xs font-semibold text-ink-700 transition hover:border-brand-300 hover:bg-brand-50 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-100"
            >
              <Phone className="h-4 w-4 text-brand-600" />
              Call
            </a>
            <a
              href={`https://wa.me/${waNumber}`}
              target="_blank"
              rel="noreferrer"
              className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-center text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
            <a
              href={`mailto:${lead.email}`}
              className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-ink-100 bg-white px-3 py-3 text-center text-xs font-semibold text-ink-700 transition hover:border-brand-300 hover:bg-brand-50 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-100"
            >
              <Mail className="h-4 w-4 text-brand-600" />
              Email
            </a>
          </section>

          {/* Detail rows */}
          <section className="grid grid-cols-1 gap-2">
            <ContactRow icon={Mail} label="Email" value={lead.email} href={`mailto:${lead.email}`} />
            <ContactRow icon={Phone} label="Mobile" value={lead.phone} href={`tel:${lead.phone}`} />
            {lead.whatsapp && (
              <ContactRow
                icon={MessageCircle}
                label="WhatsApp"
                value={lead.whatsapp}
                href={`https://wa.me/${lead.whatsapp.replace(/[^0-9]/g, '')}`}
                external
              />
            )}
            {lead.occupation && (
              <ContactRow icon={Briefcase} label="Occupation" value={lead.occupation} />
            )}
            {lead.preferredBatch && (
              <ContactRow icon={Clock} label="Preferred batch" value={lead.preferredBatch} />
            )}
            {lead.country && <ContactRow icon={Globe} label="Country" value={lead.country} />}
            <ContactRow
              icon={Calendar}
              label="Last updated"
              value={formatTimestamp(lead.updatedAt)}
            />
          </section>

          {/* Interested course block */}
          {courseTitle && (
            <section className="rounded-2xl border border-ink-100 bg-surface-muted/40 p-4 dark:border-ink-700">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                Interested course
              </p>
              <p className="mt-1 text-sm font-semibold text-ink-900 dark:text-ink-100">
                {courseTitle}
              </p>
              {courseSlug && (
                <a
                  href={`/course/${courseSlug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-brand-700 hover:text-brand-800"
                >
                  Open landing page <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </section>
          )}

          {/* Original message from the lead-capture form */}
          {lead.message && (
            <section className="rounded-2xl border border-ink-100 bg-white p-4 dark:border-ink-700 dark:bg-ink-900">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                Message from student
              </p>
              <p className="mt-1 whitespace-pre-line text-sm text-ink-700 dark:text-ink-100">
                {lead.message}
              </p>
            </section>
          )}

          {/* Notes timeline — vertical history */}
          <section>
            <div className="flex items-center gap-2">
              <StickyNote className="h-4 w-4 text-brand-600" />
              <h3 className="text-sm font-semibold text-ink-900 dark:text-ink-100">
                Conversation log
              </h3>
              <span className="ml-auto text-[11px] text-ink-500">
                {notes.length} {notes.length === 1 ? 'entry' : 'entries'}
              </span>
            </div>

            {/* The actual timeline. Each item is a horizontal card with a
                left-side timeline marker so glancing at the column shows
                the order of touch-points quickly. */}
            {notes.length === 0 ? (
              <div className="mt-3 rounded-xl border border-dashed border-ink-100 px-3 py-6 text-center text-xs text-ink-500 dark:border-ink-700">
                No notes yet. Drop the first call summary below.
              </div>
            ) : (
              <ol className="mt-3 space-y-2 border-l-2 border-brand-100 pl-4 dark:border-brand-700/40">
                {notes.map((n, idx) => (
                  <li
                    key={n._id ?? `${n.createdAt}-${idx}`}
                    className="relative rounded-xl border border-ink-100 bg-surface-muted/40 px-3 py-2 text-sm text-ink-700 dark:border-ink-700 dark:text-ink-100"
                  >
                    {/* Timeline dot */}
                    <span className="absolute -left-[22px] top-3 inline-flex h-3 w-3 items-center justify-center rounded-full border-2 border-white bg-brand-500 dark:border-ink-900" />
                    <p className="whitespace-pre-line">{n.message}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-wider text-ink-500">
                      {n.authorName ?? 'Staff'} · {formatTimestamp(n.createdAt)}
                    </p>
                  </li>
                ))}
              </ol>
            )}

            {/* Add-note form */}
            <div className="mt-4 space-y-2">
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                Add a note
              </label>
              <Textarea
                placeholder='e.g. "Called at 4pm — student will confirm payment by Friday"'
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                rows={3}
              />
              <div className="flex justify-end">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddNote}
                  isLoading={isSubmittingNote}
                  rightIcon={<Send className="h-3.5 w-3.5" />}
                  disabled={!noteDraft.trim()}
                >
                  Save note
                </Button>
              </div>
            </div>
          </section>

          {/* Footer pill — show lifecycle stage */}
          <div className="rounded-2xl border border-dashed border-ink-100 px-3 py-2 text-[11px] text-ink-500 dark:border-ink-700">
            Lifecycle:{' '}
            <Badge tone={LEAD_STATUS_META[lead.status].tone} className="ml-1">
              {LEAD_STATUS_META[lead.status].label}
            </Badge>
            {' · '}Updated {formatTimestamp(lead.updatedAt)}
          </div>
        </div>
      </aside>
    </div>
  );
};

// ---------------------------------------------------------------------
// Helper: a single contact / metadata row
// ---------------------------------------------------------------------
const ContactRow = ({
  icon: Icon,
  label,
  value,
  href,
  external = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  href?: string;
  external?: boolean;
}) => {
  const content = (
    <div className="flex items-center gap-3 rounded-xl border border-ink-100 bg-white px-3 py-2 dark:border-ink-700 dark:bg-ink-900">
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 text-brand-700 dark:bg-brand-700/30">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-ink-500">{label}</p>
        <p className="truncate text-sm font-medium text-ink-900 dark:text-ink-100">{value}</p>
      </div>
    </div>
  );
  if (!href) return content;
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
      className="transition hover:opacity-90"
    >
      {content}
    </a>
  );
};
