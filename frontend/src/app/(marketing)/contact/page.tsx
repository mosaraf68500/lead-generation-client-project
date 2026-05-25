/**
 * Contact page
 * ------------
 * Three-section ShopBangla-style layout:
 *   1. Hero strip with breadcrumb + "Contact Us" headline on a muted band.
 *   2. Two-column body: left = info tiles + "Connect with us" social card,
 *      right = "Send message" form (ContactMessageForm).
 *   3. Store location section with an embedded Google Map pointing at
 *      Mymensingh, Bangladesh and a footer info bar with a directions CTA.
 */

import Link from 'next/link';
import { ChevronRight, MapPin, Phone, Mail, Clock, ExternalLink, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { ContactMessageForm } from '@/components/common/ContactMessageForm';

export const dynamic = 'force-dynamic';

// --- Store / contact info ------------------------------------------------
// Centralised so we don't repeat strings in the layout vs. the map footer.
const STORE = {
  name: 'Smart Earning Pro',
  city: 'Mymensingh',
  region: 'Mymensingh Sadar',
  country: 'Bangladesh',
  fullAddress: 'Mymensingh, Mymensingh Sadar, Bangladesh',
  phone: '+8801783176838',
  email: 'hello@smartearningpro.com',
  hoursLabel: 'Sat – Thu: 10:00 AM – 8:00 PM',
};

// Google Maps embed URL centred on Mymensingh, Bangladesh.
const MAP_EMBED_URL =
  'https://www.google.com/maps?q=Mymensingh%2C%20Bangladesh&t=&z=13&ie=UTF8&iwloc=&output=embed';
const MAP_DIRECTIONS_URL = 'https://www.google.com/maps/dir/?api=1&destination=Mymensingh%2C%20Bangladesh';
const MAP_VIEW_URL = 'https://www.google.com/maps?q=Mymensingh%2C+Bangladesh';

// --- Info tile (left column) --------------------------------------------
interface InfoTileProps {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
  action?: { href: string; label: string; external?: boolean };
}

const InfoTile = ({ icon, iconBg, label, value, action }: InfoTileProps) => (
  <div className="flex items-start gap-4 rounded-2xl border border-ink-100 bg-white p-5 dark:border-ink-700 dark:bg-ink-900">
    <span
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconBg}`}
      aria-hidden
    >
      {icon}
    </span>
    <div className="min-w-0">
      <p className="text-sm font-semibold text-ink-900 dark:text-ink-100">{label}</p>
      <p className="mt-0.5 truncate text-sm text-ink-500">{value}</p>
      {action && (
        <Link
          href={action.href}
          target={action.external ? '_blank' : undefined}
          rel={action.external ? 'noopener noreferrer' : undefined}
          className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
        >
          {action.label}
          {action.external && <ExternalLink className="h-3 w-3" />}
        </Link>
      )}
    </div>
  </div>
);

const ContactPage = () => {
  return (
    <>
      {/* 1. Hero strip ----------------------------------------------------- */}
      <section className="bg-surface-muted dark:bg-ink-900/40">
        <div className="container py-12 sm:py-16">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-ink-500"
          >
            <Link href="/" className="hover:text-brand-600">
              Home
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-ink-900 dark:text-ink-100">Contact</span>
          </nav>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-ink-900 sm:text-5xl dark:text-ink-100">
            Contact <span className="text-brand-600">Us</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm text-ink-500">
            Visit our office in {STORE.city} or reach us by phone and email. We are happy to help
            with courses, enrollments, and student support.
          </p>
        </div>
      </section>

      {/* 2. Info tiles + Send message form -------------------------------- */}
      <section className="container py-12 sm:py-16">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,360px)_1fr]">
          {/* Left column: info tiles + social card */}
          <div className="space-y-4">
            <InfoTile
              icon={<MapPin className="h-5 w-5 text-sky-600" />}
              iconBg="bg-sky-100"
              label="Store location"
              value={`${STORE.city}, ${STORE.region}`}
              action={{ href: MAP_VIEW_URL, label: 'Open in Google Maps', external: true }}
            />
            <InfoTile
              icon={<Phone className="h-5 w-5 text-emerald-600" />}
              iconBg="bg-emerald-100"
              label="Phone"
              value={STORE.phone}
              action={{ href: `tel:${STORE.phone.replace(/[^+\d]/g, '')}`, label: 'Call now' }}
            />
            <InfoTile
              icon={<Mail className="h-5 w-5 text-rose-600" />}
              iconBg="bg-rose-100"
              label="Email"
              value={STORE.email}
              action={{ href: `mailto:${STORE.email}`, label: 'Send email' }}
            />
            <InfoTile
              icon={<Clock className="h-5 w-5 text-amber-600" />}
              iconBg="bg-amber-100"
              label="Opening hours"
              value={STORE.hoursLabel}
            />

            <div className="rounded-2xl bg-ink-900 p-5 text-white">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink-100/70">
                Connect with us
              </p>
              <div className="mt-3 flex items-center gap-2">
                {[
                  { href: 'https://facebook.com', label: 'Facebook', Icon: Facebook },
                  { href: 'https://twitter.com', label: 'Twitter', Icon: Twitter },
                  { href: 'https://instagram.com', label: 'Instagram', Icon: Instagram },
                  { href: 'https://linkedin.com', label: 'LinkedIn', Icon: Linkedin },
                ].map(({ href, label, Icon }) => (
                  <Link
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 transition hover:bg-white/20"
                  >
                    <Icon className="h-4 w-4" />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right column: the actual contact form */}
          <ContactMessageForm />
        </div>
      </section>

      {/* 3. Store location with embedded Google Map ----------------------- */}
      <section className="container pb-20">
        <h2 className="text-2xl font-bold text-ink-900 dark:text-ink-100">Store location</h2>
        <p className="mt-1 text-sm text-ink-500">{STORE.fullAddress}</p>

        <div className="mt-6 overflow-hidden rounded-2xl border border-ink-100 dark:border-ink-700">
          <iframe
            title={`${STORE.name} store location — ${STORE.city}`}
            src={MAP_EMBED_URL}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-[420px] w-full border-0"
            allowFullScreen
          />

          <div className="flex flex-col gap-4 border-t border-ink-100 bg-white p-5 sm:flex-row sm:items-center sm:justify-between dark:border-ink-700 dark:bg-ink-900">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100">
                <MapPin className="h-5 w-5 text-brand-600" />
              </span>
              <div className="text-sm">
                <p className="font-semibold text-ink-900 dark:text-ink-100">{STORE.name}</p>
                <p className="text-ink-500">{STORE.fullAddress}</p>
                <p className="text-ink-500">
                  {STORE.phone} · {STORE.email}
                </p>
              </div>
            </div>
            <Link
              href={MAP_DIRECTIONS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center justify-center gap-2 self-start rounded-xl bg-brand-600 px-5 text-[12px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-brand-700 sm:self-auto"
            >
              Get directions
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default ContactPage;
