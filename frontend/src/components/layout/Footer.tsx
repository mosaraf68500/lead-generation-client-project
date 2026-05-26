import Link from 'next/link';
import { Facebook, Twitter, Linkedin, Phone, Mail, MessageCircle } from 'lucide-react';

const links = [
  {
    label: 'Platform',
    items: [
      { label: 'Course', href: '/course' },
      { label: 'Special Offers', href: '/special-offers' },
      { label: 'Instructors', href: '/about' },
    ],
  },
  {
    label: 'Company',
    items: [
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'FAQ', href: '/contact' },
    ],
  },
  {
    label: 'Account',
    items: [
      { label: 'Sign in', href: '/login' },
      { label: 'Get started', href: '/register' },
    ],
  },
  // New legal column — links live both here (footer grid) AND in the
  // bottom bar so visitors can always find them.
  {
    label: 'Legal',
    items: [
      { label: 'Privacy Policy', href: '/privacy-policy' },
      { label: 'Terms & Conditions', href: '/terms-and-conditions' },
    ],
  },
];

// Footer now sits on the brand-orange band (`brand-500` = #FF6900).
// Body copy switches to white / white-with-opacity so the contrast
// against the vivid orange is WCAG-friendly. Hover state lifts to
// pure white for clear interaction feedback.
export const Footer = () => (
  <footer className="mt-24 bg-brand-500 text-white dark:border-ink-700 dark:bg-ink-900">
    {/* `md:grid-cols-5` now that we added a Legal column. */}
    <div className="container grid gap-10 py-12 md:grid-cols-5">
      <div className="md:col-span-2">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-white">
          {/* The "SE" badge inverts to white-on-deep-orange so it
              still pops on the lighter orange band behind it. */}
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-brand-700 text-white">
            SE
          </span>
          Smart Earning Pro
        </Link>
        <p className="mt-3 max-w-xs text-sm text-white/85">
          Career-focused online courses, designed by industry experts, optimised for real-world results.
        </p>
        <div className="mt-4 flex items-center gap-3 text-white/80">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="transition hover:text-white">
            <Facebook className="h-4 w-4" />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="transition hover:text-white">
            <Twitter className="h-4 w-4" />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="transition hover:text-white">
            <Linkedin className="h-4 w-4" />
          </a>
        </div>
      </div>

      {links.map((group) => (
        <div key={group.label}>
          <p className="text-sm font-semibold text-white">{group.label}</p>
          <ul className="mt-3 space-y-2">
            {group.items.map((item) => (
              <li key={item.label}>
                <Link href={item.href} className="text-sm text-white/80 transition hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>

    {/* Bottom bar — `border-white/20` keeps the divider visible on
        orange without being harsh. */}
    <div className="border-t border-white/20 dark:border-ink-700">
      <div className="container flex flex-col items-center justify-between gap-3 py-5 text-xs text-white/80 md:flex-row">
        <div className="flex flex-wrap items-center gap-3 md:gap-4">
          <p>(c) {new Date().getFullYear()} Smart Earning Pro. All rights reserved.</p>
          <span className="hidden h-3 w-px bg-white/30 md:inline-block" />
          {/* Compact legal-link row so users can find these from any page. */}
          <Link href="/privacy-policy" className="transition hover:text-white">
            Privacy Policy
          </Link>
          <Link href="/terms-and-conditions" className="transition hover:text-white">
            Terms &amp; Conditions
          </Link>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <a href="tel:+8801700000000" className="inline-flex items-center gap-1 transition hover:text-white">
            <Phone className="h-3.5 w-3.5" /> +880 1700-000000
          </a>
          <a href="mailto:hello@smartearningpro.com" className="inline-flex items-center gap-1 transition hover:text-white">
            <Mail className="h-3.5 w-3.5" /> hello@smartearningpro.com
          </a>
          <a
            href="https://wa.me/8801700000000"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-white transition hover:opacity-90"
          >
            <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
          </a>
        </div>
      </div>
    </div>
  </footer>
);
