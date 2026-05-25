'use client';

import { useState } from 'react';
import { Eye, Mail, MessageCircle, Phone, UserCheck } from 'lucide-react';
import type { Lead, LeadAssignee } from '@/types';
import { formatDate } from '@/utils';
import { LeadStatusSelect } from './LeadStatusSelect';
import { LeadDetailDrawer } from './LeadDetailDrawer';

interface LeadsCrmTableProps {
  leads: Lead[];
  /** True for admin / super-admin: surface assignee column + assign actions. */
  canAssign?: boolean;
  /** True for admin / super-admin: enable drawer delete button. */
  canDelete?: boolean;
  /** Pool of assignable users — required when `canAssign` is true. */
  assignees?: LeadAssignee[];
}

/**
 * Mini-CRM table for the admin / staff dashboard. Each row exposes:
 *   - Quick contact actions (call / WhatsApp / email)
 *   - Inline status changer
 *   - "Open" button that pops a detail drawer with notes + full info
 *
 * Admins additionally see an "Assigned to" column and can reassign / delete
 * from the detail drawer. Staff see the row WITHOUT those affordances since
 * the backend already prevents them from acting on someone else's lead.
 */
export const LeadsCrmTable = ({
  leads,
  canAssign = false,
  canDelete = false,
  assignees = [],
}: LeadsCrmTableProps) => {
  const [activeLead, setActiveLead] = useState<Lead | null>(null);

  return (
    <>
      <div className="overflow-hidden rounded-3xl border border-ink-100 bg-white dark:border-ink-700 dark:bg-ink-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-ink-100 bg-surface-muted/60 text-[11px] font-bold uppercase tracking-wider text-ink-500 dark:border-ink-700 dark:bg-ink-700/30">
                <th className="px-4 py-3">Lead</th>
                <th className="px-4 py-3">Course</th>
                <th className="px-4 py-3">Channel</th>
                {canAssign && <th className="px-4 py-3">Assigned to</th>}
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Captured</th>
                <th className="px-4 py-3 text-right" />
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100 dark:divide-ink-700">
              {leads.map((lead) => {
                const courseTitle =
                  lead.interestedCourse && typeof lead.interestedCourse === 'object'
                    ? lead.interestedCourse.title
                    : null;
                const waNumber = (lead.whatsapp ?? lead.phone).replace(/[^0-9]/g, '');
                const assignee =
                  lead.assignedTo && typeof lead.assignedTo === 'object'
                    ? (lead.assignedTo as LeadAssignee)
                    : null;
                return (
                  <tr
                    key={lead.id}
                    className="transition hover:bg-surface-muted/40 dark:hover:bg-ink-700/20"
                  >
                    <td className="px-4 py-3 align-top">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-ink-900 dark:text-ink-100">
                          {lead.name}
                        </p>
                        <p className="truncate text-xs text-ink-500">{lead.email}</p>
                        {lead.occupation && (
                          <p className="truncate text-xs text-ink-500">{lead.occupation}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top text-sm text-ink-700 dark:text-ink-100">
                      {courseTitle ? (
                        <span className="line-clamp-2">{courseTitle}</span>
                      ) : (
                        <span className="text-ink-300">—</span>
                      )}
                      {lead.preferredBatch && (
                        <p className="mt-0.5 text-[11px] text-ink-500">{lead.preferredBatch}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex items-center gap-1.5">
                        <a
                          href={`tel:${lead.phone}`}
                          aria-label="Call"
                          title={`Call ${lead.phone}`}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-ink-100 text-ink-500 hover:border-brand-300 hover:text-brand-700 dark:border-ink-700"
                        >
                          <Phone className="h-3.5 w-3.5" />
                        </a>
                        <a
                          href={`https://wa.me/${waNumber}`}
                          target="_blank"
                          rel="noreferrer"
                          aria-label="WhatsApp"
                          title={`WhatsApp ${lead.whatsapp ?? lead.phone}`}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-ink-100 text-ink-500 hover:border-green-300 hover:text-green-600 dark:border-ink-700"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                        </a>
                        <a
                          href={`mailto:${lead.email}`}
                          aria-label="Email"
                          title={`Email ${lead.email}`}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-ink-100 text-ink-500 hover:border-brand-300 hover:text-brand-700 dark:border-ink-700"
                        >
                          <Mail className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </td>
                    {canAssign && (
                      <td className="px-4 py-3 align-top">
                        {assignee ? (
                          <div className="flex items-center gap-1.5 text-xs">
                            <UserCheck className="h-3.5 w-3.5 text-brand-600" />
                            <div className="min-w-0">
                              <p className="truncate font-medium text-ink-700 dark:text-ink-100">
                                {assignee.name || assignee.email}
                              </p>
                              <p className="truncate text-[10px] capitalize text-ink-500">
                                {assignee.role.replace('_', ' ')}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] italic text-ink-400">Unassigned</span>
                        )}
                      </td>
                    )}
                    <td className="px-4 py-3 align-top text-xs text-ink-500">{lead.source}</td>
                    <td className="px-4 py-3 align-top">
                      <LeadStatusSelect leadId={lead.id} status={lead.status} />
                      {(lead.notes ?? []).length > 0 && (
                        <p className="mt-1 text-[10px] text-ink-500">
                          {(lead.notes ?? []).length} note{(lead.notes ?? []).length === 1 ? '' : 's'}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top text-right text-xs text-ink-500">
                      {formatDate(lead.createdAt)}
                    </td>
                    <td className="px-4 py-3 align-top text-right">
                      <button
                        type="button"
                        onClick={() => setActiveLead(lead)}
                        className="inline-flex items-center gap-1 rounded-md border border-ink-100 px-2.5 py-1.5 text-[11px] font-semibold text-ink-700 transition hover:border-brand-300 hover:text-brand-700 dark:border-ink-700 dark:text-ink-100"
                      >
                        <Eye className="h-3.5 w-3.5" /> Open
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <LeadDetailDrawer
        lead={activeLead}
        onClose={() => setActiveLead(null)}
        canAssign={canAssign}
        canDelete={canDelete}
        assignees={assignees}
      />
    </>
  );
};
