import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, Lock, Eye, Cookie, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy · Smart Earning Pro',
  description:
    'How Smart Earning Pro collects, uses and safeguards the personal information you share when you join a course or submit a lead.',
};

const LAST_UPDATED = 'May 25, 2026';

/** Static marketing page — no live data needed. */
const PrivacyPolicyPage = () => (
  <div className="bg-surface-muted/40 dark:bg-ink-900">
    {/* ── Hero strip ───────────────────────────────────────────── */}
    <header className="border-b border-ink-100 bg-white py-12 dark:border-ink-700 dark:bg-ink-900">
      <div className="container">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-600">
          Legal
        </p>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-ink-900 sm:text-5xl dark:text-ink-100">
          Privacy Policy
        </h1>
        <p className="mt-3 max-w-2xl text-base text-ink-500">
          We respect your privacy. This document explains exactly what data we
          collect, why we collect it, and how we keep it safe.
        </p>
        <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-ink-400">
          Last updated: {LAST_UPDATED}
        </p>
      </div>
    </header>

    {/* ── Body ────────────────────────────────────────────────── */}
    <main className="container py-12">
      <div className="grid gap-10 lg:grid-cols-[260px,1fr]">
        {/* Side nav — anchors for quick scrolling. */}
        <aside className="hidden lg:block">
          <nav className="sticky top-24 space-y-1 text-sm">
            {[
              { href: '#overview', label: 'Overview' },
              { href: '#data-we-collect', label: 'Data we collect' },
              { href: '#how-we-use', label: 'How we use it' },
              { href: '#cookies', label: 'Cookies & tracking' },
              { href: '#sharing', label: 'Third-party sharing' },
              { href: '#security', label: 'Security' },
              { href: '#your-rights', label: 'Your rights' },
              { href: '#contact', label: 'Contact us' },
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
              icon={ShieldCheck}
              title="Plain English"
              body="No legal walls of text. Every section is summarised in normal language up top."
            />
            <HighlightCard
              icon={Lock}
              title="Encrypted in transit"
              body="Everything you submit moves over TLS 1.3 and is stored in encrypted databases."
            />
            <HighlightCard
              icon={Eye}
              title="You own your data"
              body="Export, correct, or delete it at any time — just email us with the address below."
            />
          </div>

          <Section id="overview" title="1. Overview">
            <p>
              Smart Earning Pro (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;)
              operates an online learning platform that includes a lead-generation
              workflow for prospective students. This policy describes the personal
              information we collect through our courses, lead capture forms, and
              account flow, and how we handle it.
            </p>
          </Section>

          <Section id="data-we-collect" title="2. Data we collect">
            <ul className="ml-5 list-disc space-y-2">
              <li>
                <strong>Account info</strong> — name, email, phone, WhatsApp number,
                preferred batch, occupation. Collected when you register or submit
                a lead form.
              </li>
              <li>
                <strong>Course activity</strong> — courses you have viewed, added
                to your &ldquo;Interested&rdquo; list, or enrolled in, plus
                progress and certificate data.
              </li>
              <li>
                <strong>Communications</strong> — emails, WhatsApp messages, and
                support tickets you exchange with our team.
              </li>
              <li>
                <strong>Device &amp; usage</strong> — IP address, browser type,
                pages visited and timestamps. Used purely for analytics and
                security.
              </li>
            </ul>
          </Section>

          <Section id="how-we-use" title="3. How we use your data">
            <ul className="ml-5 list-disc space-y-2">
              <li>To deliver, personalise, and improve our courses and services.</li>
              <li>
                To respond to enrollment enquiries and run our sales/support
                workflows (which is why our staff dashboard shows leads
                assigned to them).
              </li>
              <li>To send transactional emails and, with your consent, marketing updates.</li>
              <li>To detect and prevent fraud, abuse, and security incidents.</li>
            </ul>
          </Section>

          <Section id="cookies" title="4. Cookies & tracking">
            <div className="flex items-start gap-3">
              <Cookie className="mt-1 h-5 w-5 text-brand-600" />
              <p>
                We use a small number of first-party cookies to keep you signed in
                and remember your preferences (theme, language). Aggregated
                analytics may be processed by privacy-friendly providers. You can
                clear cookies in your browser at any time without losing your
                course progress.
              </p>
            </div>
          </Section>

          <Section id="sharing" title="5. Third-party sharing">
            <p>
              We do <strong>not</strong> sell your personal data. We share it only
              with trusted infrastructure providers (hosting, email delivery,
              payment processing, media CDN) that are bound by data-processing
              agreements and may only use it to provide their service to us.
            </p>
          </Section>

          <Section id="security" title="6. Security">
            <p>
              Personal information is encrypted both in transit (TLS) and at rest.
              Passwords are hashed with industry-standard algorithms. Access to
              raw data is limited to specific operations roles and is fully
              audited.
            </p>
          </Section>

          <Section id="your-rights" title="7. Your rights">
            <p>You can, at any time:</p>
            <ul className="mt-2 ml-5 list-disc space-y-2">
              <li>Request a copy of every piece of data we hold on you.</li>
              <li>Correct or update anything inaccurate.</li>
              <li>Ask us to delete your account and personal data.</li>
              <li>Withdraw consent for marketing communications.</li>
            </ul>
          </Section>

          <Section id="contact" title="8. Contact us">
            <div className="flex items-start gap-3 rounded-2xl border border-brand-100 bg-brand-50/40 p-4 dark:border-brand-700/30 dark:bg-brand-700/10">
              <Mail className="mt-0.5 h-5 w-5 text-brand-700" />
              <div>
                <p className="font-semibold text-ink-900 dark:text-ink-100">
                  Email us anytime
                </p>
                <p className="text-sm text-ink-600 dark:text-ink-300">
                  Have a question about this policy or want to exercise your
                  rights? Reach the team at{' '}
                  <a
                    href="mailto:privacy@smartearningpro.com"
                    className="font-semibold text-brand-700 underline-offset-2 hover:underline"
                  >
                    privacy@smartearningpro.com
                  </a>{' '}
                  or via the{' '}
                  <Link
                    href="/contact"
                    className="font-semibold text-brand-700 underline-offset-2 hover:underline"
                  >
                    Contact page
                  </Link>
                  .
                </p>
              </div>
            </div>
          </Section>
        </article>
      </div>
    </main>
  </div>
);

// ─────────────────────────────────────────────────────────────────────
// Local helpers
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

export default PrivacyPolicyPage;
