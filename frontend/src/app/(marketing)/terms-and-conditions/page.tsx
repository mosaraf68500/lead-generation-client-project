import type { Metadata } from 'next';
import Link from 'next/link';
import { ScrollText, CreditCard, RefreshCcw, Ban, Gavel } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms & Conditions · Smart Earning Pro',
  description:
    'The rules that govern your use of Smart Earning Pro — including account, payment, refund and acceptable-use policies.',
};

const LAST_UPDATED = 'May 25, 2026';

/** Static marketing page — no live data needed. */
const TermsPage = () => (
  <div className="bg-surface-muted/40 dark:bg-ink-900">
    {/* ── Hero strip ──────────────────────────────────────────── */}
    <header className="border-b border-ink-100 bg-white py-12 dark:border-ink-700 dark:bg-ink-900">
      <div className="container">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-600">
          Legal
        </p>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-ink-900 sm:text-5xl dark:text-ink-100">
          Terms &amp; Conditions
        </h1>
        <p className="mt-3 max-w-2xl text-base text-ink-500">
          By using Smart Earning Pro you agree to the rules below. Please read
          them carefully — they cover your account, payments, refunds, and
          acceptable behaviour.
        </p>
        <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-ink-400">
          Last updated: {LAST_UPDATED}
        </p>
      </div>
    </header>

    {/* ── Body ────────────────────────────────────────────────── */}
    <main className="container py-12">
      <div className="grid gap-10 lg:grid-cols-[260px,1fr]">
        {/* Anchor nav */}
        <aside className="hidden lg:block">
          <nav className="sticky top-24 space-y-1 text-sm">
            {[
              { href: '#acceptance', label: 'Acceptance' },
              { href: '#account', label: 'Your account' },
              { href: '#enrolment', label: 'Course enrolment' },
              { href: '#payments', label: 'Payments' },
              { href: '#refunds', label: 'Refunds' },
              { href: '#conduct', label: 'Acceptable use' },
              { href: '#ip', label: 'Intellectual property' },
              { href: '#termination', label: 'Termination' },
              { href: '#governing-law', label: 'Governing law' },
            ].map((a) => (
              <a
                key={a.href}
                href={a.href}
                className="block rounded-md px-3 py-1.5 text-ink-500 transition hover:bg-ink-100 hover:text-brand-700 dark:hover:bg-ink-700/40"
              >
                {a.label}
              </a>
            ))}
          </nav>
        </aside>

        <article className="space-y-10 rounded-2xl border border-ink-100 bg-white p-8 dark:border-ink-700 dark:bg-ink-900">
          {/* Highlight cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <HighlightCard
              icon={CreditCard}
              title="Transparent pricing"
              body="The price on the course page is the final price. No surprises at checkout."
            />
            <HighlightCard
              icon={RefreshCcw}
              title="14-day refund"
              body="Don't love it? Get a full refund within 14 days of enrolment, no questions asked."
            />
            <HighlightCard
              icon={ScrollText}
              title="Lifetime access"
              body="One-time purchase unlocks every future update to the same course."
            />
          </div>

          <Section id="acceptance" title="1. Acceptance of Terms">
            <p>
              By creating an account, submitting a lead form, or enrolling in a
              course you accept these Terms, our{' '}
              <Link
                href="/privacy-policy"
                className="font-semibold text-brand-700 underline-offset-2 hover:underline"
              >
                Privacy Policy
              </Link>{' '}
              and any additional rules referenced from them. If you do not agree,
              please discontinue using the platform.
            </p>
          </Section>

          <Section id="account" title="2. Your account">
            <ul className="ml-5 list-disc space-y-2">
              <li>You must be at least 16 years old (or have parental consent).</li>
              <li>You are responsible for keeping your login credentials safe.</li>
              <li>One account per person; sharing accounts is not permitted.</li>
              <li>
                Notify us immediately if you suspect any unauthorised access at{' '}
                <a
                  href="mailto:support@smartearningpro.com"
                  className="font-semibold text-brand-700 underline-offset-2 hover:underline"
                >
                  support@smartearningpro.com
                </a>
                .
              </li>
            </ul>
          </Section>

          <Section id="enrolment" title="3. Course enrolment">
            <p>
              Course enrolments are personal and non-transferable. We may update
              course content, add lessons, or replace outdated material at our
              discretion to keep the curriculum current.
            </p>
          </Section>

          <Section id="payments" title="4. Payments">
            <p>
              All prices are displayed in the local currency shown on the course
              page and are inclusive of any applicable taxes unless stated
              otherwise. Payment is captured at the time of enrolment via our
              certified payment processors.
            </p>
          </Section>

          <Section id="refunds" title="5. Refunds">
            <p>
              We offer a full refund within 14 days of purchase, provided you
              have not completed more than 30% of the course. To request a
              refund email{' '}
              <a
                href="mailto:billing@smartearningpro.com"
                className="font-semibold text-brand-700 underline-offset-2 hover:underline"
              >
                billing@smartearningpro.com
              </a>{' '}
              from your registered address.
            </p>
          </Section>

          <Section id="conduct" title="6. Acceptable use">
            <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50/60 p-4 dark:border-red-900/30 dark:bg-red-900/10">
              <Ban className="mt-0.5 h-5 w-5 text-red-600" />
              <div className="text-sm text-red-900 dark:text-red-200">
                <p className="font-semibold">You agree NOT to:</p>
                <ul className="mt-2 ml-5 list-disc space-y-1">
                  <li>Reproduce, redistribute or resell course material.</li>
                  <li>Reverse-engineer or scrape the platform.</li>
                  <li>Harass instructors, staff, or other learners.</li>
                  <li>Submit false information to lead capture forms.</li>
                </ul>
              </div>
            </div>
          </Section>

          <Section id="ip" title="7. Intellectual property">
            <p>
              All course videos, slide decks, source code, written materials,
              logos, and branding remain the property of Smart Earning Pro and
              its instructors. Your purchase grants you a personal, non-exclusive,
              non-transferable licence to access and use them for learning.
            </p>
          </Section>

          <Section id="termination" title="8. Termination">
            <p>
              We may suspend or terminate your account if you breach these
              Terms — including unauthorised sharing, payment chargebacks, or
              harmful conduct. In serious cases this may be without refund.
            </p>
          </Section>

          <Section id="governing-law" title="9. Governing law">
            <div className="flex items-start gap-3">
              <Gavel className="mt-1 h-5 w-5 text-brand-600" />
              <p>
                These Terms are governed by the laws of Bangladesh. Any disputes
                shall be resolved in the competent courts located in
                Mymensingh, unless a different jurisdiction is required by
                applicable consumer law.
              </p>
            </div>
          </Section>
        </article>
      </div>
    </main>
  </div>
);

// ─────────────────────────────────────────────────────────────────────
// Local helpers (kept in-file to avoid a tiny shared module)
// ─────────────────────────────────────────────────────────────────────

const Section = ({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) => (
  <section id={id} className="scroll-mt-24">
    <h2 className="text-xl font-bold text-ink-900 dark:text-ink-100">{title}</h2>
    <div className="mt-3 space-y-3 text-sm leading-relaxed text-ink-600 dark:text-ink-300">
      {children}
    </div>
  </section>
);

const HighlightCard = ({
  icon: Icon,
  title,
  body,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
}) => (
  <div className="rounded-2xl border border-ink-100 bg-surface-muted/40 p-4 dark:border-ink-700 dark:bg-ink-700/20">
    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-700/30">
      <Icon className="h-4 w-4" />
    </span>
    <p className="mt-3 text-sm font-semibold text-ink-900 dark:text-ink-100">
      {title}
    </p>
    <p className="mt-1 text-xs text-ink-500">{body}</p>
  </div>
);

export default TermsPage;
