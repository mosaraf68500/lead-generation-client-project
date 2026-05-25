'use client';

import Link from 'next/link';
import {
  CheckCircle2,
  CircleDot,
  Clock,
  Inbox,
  Mail,
  Phone,
  Tag,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/common/EmptyState';
import type { Lead, LeadStatus } from '@/types';
import { formatDate } from '@/utils';

interface StudentLeadsTimelineProps {
  leads: Lead[];
}

const STATUS_TONE: Record<LeadStatus, 'brand' | 'success' | 'warning' | 'danger' | 'neutral'> = {
  new: 'brand',
  contacted: 'neutral',
  in_progress: 'warning',
  enrolled: 'success',
  junk: 'danger',
};

const STATUS_LABEL: Record<LeadStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  in_progress: 'In progress',
  enrolled: 'Enrolled',
  junk: 'Junk',
};

const STATUS_ORDER: LeadStatus[] = ['new', 'contacted', 'in_progress', 'enrolled'];

/**
 * Application / inquiry tracker for the student. Each row shows the
 * normalised lifecycle (new -> contacted -> in_progress -> enrolled) so the
 * learner knows what to expect next.
 */
export const StudentLeadsTimeline = ({ leads }: StudentLeadsTimelineProps) => {
  if (leads.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title="No applications yet"
        description="When you submit the lead form on a course or contact us, your requests will show up here."
        action={
          <Link
            href="/course"
            className="inline-flex h-10 items-center gap-1.5 rounded-md bg-brand-600 px-4 text-xs font-bold uppercase tracking-wider text-white"
          >
            Browse courses
          </Link>
        }
      />
    );
  }

  return (
    <div className="rounded-3xl border border-ink-100 bg-white shadow-card dark:border-ink-700 dark:bg-ink-900">
      <header className="flex items-center justify-between border-b border-ink-100 px-5 py-4 dark:border-ink-700">
        <div>
          <h2 className="text-base font-semibold text-ink-900 dark:text-ink-100">
            My applications
          </h2>
          <p className="text-xs text-ink-500">{leads.length} request{leads.length === 1 ? '' : 's'} tracked</p>
        </div>
      </header>

      <ul className="divide-y divide-ink-100 dark:divide-ink-700">
        {leads.map((lead) => {
          const stage = STATUS_ORDER.indexOf(lead.status);
          const course = typeof lead.interestedCourse === 'string' ? null : lead.interestedCourse;
          return (
            <li key={lead.id} className="px-5 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink-900 dark:text-ink-100">
                    {course?.title ?? 'General career consultation'}
                  </p>
                  <p className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-ink-500">
                    <Clock className="h-3 w-3" /> Submitted {formatDate(lead.createdAt)}
                    <span className="text-ink-300">|</span>
                    <Tag className="h-3 w-3" /> {lead.source}
                  </p>
                </div>
                <Badge tone={STATUS_TONE[lead.status]}>
                  {STATUS_LABEL[lead.status]}
                </Badge>
              </div>

              {/* Stage progress */}
              <ol className="mt-3 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider">
                {STATUS_ORDER.map((s, idx) => {
                  const reached = stage >= idx;
                  const isCurrent = lead.status === s;
                  return (
                    <li key={s} className="flex flex-1 items-center gap-1">
                      <span
                        className={
                          reached
                            ? 'inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-white'
                            : 'inline-flex h-5 w-5 items-center justify-center rounded-full border border-ink-100 bg-white text-ink-300 dark:border-ink-700 dark:bg-ink-900'
                        }
                      >
                        {reached ? <CheckCircle2 className="h-3 w-3" /> : <CircleDot className="h-3 w-3" />}
                      </span>
                      <span
                        className={
                          isCurrent
                            ? 'text-brand-700 dark:text-brand-200'
                            : reached
                              ? 'text-ink-700 dark:text-ink-100'
                              : 'text-ink-300'
                        }
                      >
                        {STATUS_LABEL[s]}
                      </span>
                      {idx < STATUS_ORDER.length - 1 && (
                        <span className={reached ? 'h-px flex-1 bg-brand-200' : 'h-px flex-1 bg-ink-100 dark:bg-ink-700'} />
                      )}
                    </li>
                  );
                })}
              </ol>

              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-ink-500">
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="h-3 w-3" /> {lead.email}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="h-3 w-3" /> {lead.whatsapp ?? lead.phone}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
