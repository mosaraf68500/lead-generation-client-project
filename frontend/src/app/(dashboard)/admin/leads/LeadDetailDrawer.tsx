'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
} from 'lucide-react';
import type { Lead } from '@/types';
import { LEAD_STATUS_META } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { LeadStatusSelect } from './LeadStatusSelect';
import { useToast } from '@/context/ToastContext';
import { addLeadNote } from '@/services/leads';
import { ApiError } from '@/services/api';
import { formatDate } from '@/utils';

interface LeadDetailDrawerProps {
  lead: Lead | null;
  onClose: () => void;
}

/** Right-side slide-out drawer that shows everything about a single lead. */
export const LeadDetailDrawer = ({ lead, onClose }: LeadDetailDrawerProps) => {
  const router = useRouter();
  const { push } = useToast();
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset the local note state when the drawer swaps leads.
  useEffect(() => {
    setNote('');
  }, [lead?.id]);

  // Esc to close.
  useEffect(() => {
    if (!lead) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lead, onClose]);

  if (!lead) return null;

  const addNote = async () => {
    const trimmed = note.trim();
    if (!trimmed) return;
    setIsSubmitting(true);
    try {
      await addLeadNote(lead.id, trimmed);
      push({ variant: 'success', title: 'Note added' });
      setNote('');
      router.refresh();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Could not add note';
      push({ variant: 'error', title: 'Failed', description: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const courseTitle =
    lead.interestedCourse && typeof lead.interestedCourse === 'object'
      ? lead.interestedCourse.title
      : null;
  const courseSlug =
    lead.interestedCourse && typeof lead.interestedCourse === 'object'
      ? lead.interestedCourse.slug
      : null;

  return (
    <div className="fixed inset-0 z-40">
      <button
        type="button"
        aria-label="Close drawer"
        onClick={onClose}
        className="absolute inset-0 bg-ink-900/40"
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-ink-100 bg-white dark:border-ink-700 dark:bg-ink-900">
        {/* Header */}
        <header className="sticky top-0 z-10 border-b border-ink-100 bg-white px-5 py-4 dark:border-ink-700 dark:bg-ink-900">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">Lead</p>
              <h2 className="mt-0.5 truncate text-lg font-bold text-ink-900 dark:text-ink-100">
                {lead.name}
              </h2>
              <p className="truncate text-xs text-ink-500">Captured {formatDate(lead.createdAt)}</p>
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

          <div className="mt-3 flex items-center gap-2">
            <LeadStatusSelect leadId={lead.id} status={lead.status} />
            <Badge tone="neutral" className="bg-transparent">
              <Tag className="mr-1 h-3 w-3" /> {lead.source}
            </Badge>
          </div>
        </header>

        {/* Body */}
        <div className="flex-1 px-5 py-5 space-y-5">
          {/* Contact tiles */}
          <section className="grid grid-cols-1 gap-2">
            <ContactRow
              icon={Mail}
              label="Email"
              value={lead.email}
              href={`mailto:${lead.email}`}
            />
            <ContactRow
              icon={Phone}
              label="Mobile"
              value={lead.phone}
              href={`tel:${lead.phone}`}
            />
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
          </section>

          {/* Interested course */}
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

          {/* Message */}
          {lead.message && (
            <section className="rounded-2xl border border-ink-100 bg-white p-4 dark:border-ink-700 dark:bg-ink-900">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                Message
              </p>
              <p className="mt-1 whitespace-pre-line text-sm text-ink-700 dark:text-ink-100">
                {lead.message}
              </p>
            </section>
          )}

          {/* Notes thread */}
          <section>
            <div className="flex items-center gap-2">
              <StickyNote className="h-4 w-4 text-brand-600" />
              <h3 className="text-sm font-semibold text-ink-900 dark:text-ink-100">Staff notes</h3>
            </div>

            <ul className="mt-3 space-y-2">
              {(lead.notes ?? []).length === 0 ? (
                <li className="rounded-xl border border-dashed border-ink-100 px-3 py-4 text-center text-xs text-ink-500 dark:border-ink-700">
                  No notes yet. Add the first one below.
                </li>
              ) : (
                (lead.notes ?? []).map((n, idx) => (
                  <li
                    key={n._id ?? `${n.createdAt}-${idx}`}
                    className="rounded-xl border border-ink-100 bg-surface-muted/40 px-3 py-2 text-sm text-ink-700 dark:border-ink-700 dark:text-ink-100"
                  >
                    <p className="whitespace-pre-line">{n.message}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-wider text-ink-500">
                      {n.authorName ?? 'Staff'} · {formatDate(n.createdAt)}
                    </p>
                  </li>
                ))
              )}
            </ul>

            <div className="mt-3 space-y-2">
              <Textarea
                placeholder='e.g. "Called at 4pm — said to ring back Fri morning"'
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
              />
              <div className="flex justify-end">
                <Button
                  type="button"
                  size="sm"
                  onClick={addNote}
                  isLoading={isSubmitting}
                  rightIcon={<Send className="h-3.5 w-3.5" />}
                  disabled={!note.trim()}
                >
                  Add note
                </Button>
              </div>
            </div>
          </section>

          {/* Status meta */}
          <div className="rounded-2xl border border-dashed border-ink-100 px-3 py-2 text-[11px] text-ink-500 dark:border-ink-700">
            Lifecycle: <Badge tone={LEAD_STATUS_META[lead.status].tone} className="ml-1">
              {LEAD_STATUS_META[lead.status].label}
            </Badge>
            {' · '}
            Updated {formatDate(lead.updatedAt)}
          </div>
        </div>
      </aside>
    </div>
  );
};

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
