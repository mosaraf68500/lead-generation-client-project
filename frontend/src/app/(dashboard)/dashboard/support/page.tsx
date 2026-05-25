/**
 * Shared /dashboard/support page — the in-app Support Center.
 *
 * Layout (matches the marketing /contact page style):
 *   Left  → quick-contact tiles (email / phone / hours) + FAQ accordion
 *   Right → authenticated SupportTicketForm
 *
 * Same `/leads` endpoint is used for ticket submissions, tagged with
 * `source: 'support-ticket'` so staff can triage support requests
 * separately from marketing leads.
 */
import Link from 'next/link';
import { Mail, Phone, Clock, LifeBuoy, MessagesSquare } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SupportTicketForm } from '@/components/common/SupportTicketForm';
import { FaqAccordion, type FaqItem } from '@/components/common/FaqAccordion';
import { requireSessionRole } from '@/services/session';

export const dynamic = 'force-dynamic';

const SUPPORT_CONTACTS = {
  email: 'hello@smartearningpro.com',
  phone: '+8801783176838',
  hoursLabel: 'Sat – Thu: 10:00 AM – 8:00 PM',
};

const FAQ: FaqItem[] = [
  {
    q: 'How do I reset my password?',
    a: 'Go to Login → "Forgot password" and follow the email link. If the email never arrives, open a support ticket below and we will help you in person.',
  },
  {
    q: 'Where can I see the courses I enrolled in?',
    a: 'Your enrolled courses appear on the Overview page of your dashboard and inside History when applications have been converted.',
  },
  {
    q: 'How long do I have access to a course?',
    a: 'Every purchase includes lifetime access and free updates to any future modules released for that course.',
  },
  {
    q: 'Is there a refund policy?',
    a: 'Yes — we offer a 14-day no-questions-asked refund on every course. Open a Billing ticket below within 14 days of purchase.',
  },
  {
    q: 'I think there is a bug in the dashboard.',
    a: 'Please open a Technical ticket below with the page URL and a screenshot if possible. We respond to bug reports within one business day.',
  },
];

const SupportPage = async () => {
  const user = await requireSessionRole();

  return (
    <DashboardLayout
      title="Support center"
      subtitle="We're here to help. Browse FAQs or send our team a message — most tickets are answered within one business day."
      contained
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,360px)_1fr]">
        {/* Left rail */}
        <div className="space-y-4">
          <div className="rounded-3xl border border-ink-100 bg-white p-5 dark:border-ink-700 dark:bg-ink-900">
            <h2 className="inline-flex items-center gap-2 text-base font-semibold text-ink-900 dark:text-ink-100">
              <LifeBuoy className="h-4 w-4 text-brand-600" /> Contact us
            </h2>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                  <Mail className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="font-medium text-ink-900 dark:text-ink-100">Email</p>
                  <Link
                    href={`mailto:${SUPPORT_CONTACTS.email}`}
                    className="truncate text-brand-600 hover:underline"
                  >
                    {SUPPORT_CONTACTS.email}
                  </Link>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <Phone className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-medium text-ink-900 dark:text-ink-100">Phone</p>
                  <Link
                    href={`tel:${SUPPORT_CONTACTS.phone.replace(/[^+\d]/g, '')}`}
                    className="text-brand-600 hover:underline"
                  >
                    {SUPPORT_CONTACTS.phone}
                  </Link>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                  <Clock className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-medium text-ink-900 dark:text-ink-100">Hours</p>
                  <p className="text-ink-500">{SUPPORT_CONTACTS.hoursLabel}</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="rounded-3xl border border-ink-100 bg-white p-5 dark:border-ink-700 dark:bg-ink-900">
            <h2 className="inline-flex items-center gap-2 text-base font-semibold text-ink-900 dark:text-ink-100">
              <MessagesSquare className="h-4 w-4 text-brand-600" /> Common questions
            </h2>
            <p className="mt-1 text-xs text-ink-500">
              Quick answers to the most-asked questions. Still stuck? Open a ticket.
            </p>
            <div className="mt-4">
              <FaqAccordion items={FAQ} />
            </div>
          </div>
        </div>

        {/* Right column: ticket form */}
        <SupportTicketForm user={user} />
      </div>
    </DashboardLayout>
  );
};

export default SupportPage;
