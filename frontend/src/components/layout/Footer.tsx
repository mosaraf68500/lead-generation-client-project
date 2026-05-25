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

export const Footer = () => (
  <footer className="mt-24 border-t border-ink-100 bg-white dark:border-ink-700 dark:bg-ink-900">
    {/* `md:grid-cols-5` now that we added a Legal column. */}
    <div className="container grid gap-10 py-12 md:grid-cols-5">
      <div className="md:col-span-2">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-ink-900 dark:text-ink-100">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl gradient-brand text-white">
            SE
          </span>
          Smart Earning Pro
        </Link>
        <p className="mt-3 max-w-xs text-sm text-ink-500">
          Career-focused online courses, designed by industry experts, optimised for real-world results.
        </p>
        <div className="mt-4 flex items-center gap-3 text-ink-500">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-brand-700">
            <Facebook className="h-4 w-4" />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="hover:text-brand-700">
            <Twitter className="h-4 w-4" />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hover:text-brand-700">
            <Linkedin className="h-4 w-4" />
          </a>
        </div>
      </div>

      {links.map((group) => (
        <div key={group.label}>
          <p className="text-sm font-semibold text-ink-900 dark:text-ink-100">{group.label}</p>
          <ul className="mt-3 space-y-2">
            {group.items.map((item) => (
              <li key={item.label}>
                <Link href={item.href} className="text-sm text-ink-500 transition hover:text-brand-700">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>

    <div className="border-t border-ink-100 dark:border-ink-700">
      <div className="container flex flex-col items-center justify-between gap-3 py-5 text-xs text-ink-500 md:flex-row">
        <div className="flex flex-wrap items-center gap-3 md:gap-4">
          <p>(c) {new Date().getFullYear()} Smart Earning Pro. All rights reserved.</p>
          <span className="hidden h-3 w-px bg-ink-200 md:inline-block dark:bg-ink-700" />
          {/* Compact legal-link row so users can find these from any page. */}
          <Link href="/privacy-policy" className="hover:text-brand-700">
            Privacy Policy
          </Link>
          <Link href="/terms-and-conditions" className="hover:text-brand-700">
            Terms &amp; Conditions
          </Link>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <a href="tel:+8801700000000" className="inline-flex items-center gap-1 hover:text-brand-700">
            <Phone className="h-3.5 w-3.5" /> +880 1700-000000
          </a>
          <a href="mailto:hello@smartearningpro.com" className="inline-flex items-center gap-1 hover:text-brand-700">
            <Mail className="h-3.5 w-3.5" /> hello@smartearningpro.com
          </a>
          <a
            href="https://wa.me/8801700000000"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-accent-600 hover:text-accent-500"
          >
            <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
          </a>
        </div>
      </div>
    </div>
  </footer>
);
