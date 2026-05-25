/**
 * About page for Smart Earning Pro.
 *
 * Structure (top → bottom):
 *   1. "The Dream Team of E-Learning" — 3 instructor cards with photo +
 *       number badge + name pill. Acts as the page hero.
 *   2. "Our Dream is Global Learning Transformation" — left copy column
 *       + right hero image with a 2×2 grid of headline stats.
 *   3. "Built by practitioners, for ambitious learners" intro block.
 *   4. Pillar cards — Outcome / Mentor / Global.
 *   5. Mission split card — Our mission + Where we're headed.
 *
 * Both new sections are static — copy and instructor data live in plain
 * arrays inside this file because they're editorial content, not data
 * that changes on a per-request basis. Move into a CMS later if needed.
 */

import Image from 'next/image';
import Link from 'next/link';
import {
  Globe2,
  HeartHandshake,
  Target,
  Award,
  GraduationCap,
  Sparkles,
  Smile,
  Briefcase,
  Compass,
} from 'lucide-react';
import { FeatureCard } from '@/components/common/FeatureCard';
import { Button } from '@/components/ui/Button';

// ─────────────────────────────────────────────────────────────────────
// Editorial content
// ─────────────────────────────────────────────────────────────────────

interface Instructor {
  /** Two-digit badge shown in the bottom-left of the photo (01, 02, 03). */
  number: string;
  /** Instructor portrait (square-friendly Unsplash crop works best). */
  photo: string;
  /** Short display name shown on the pill that floats on the photo. */
  name: string;
  /** Course/role title — also acts as the card heading. */
  role: string;
  /** Two-line description directly under the role. */
  description: string;
}

/**
 * Professional MALE instructor portraits — clean studio shots from
 * Unsplash. Each one is framed chest-up against a neutral background so
 * the 4:5 card crop reads cleanly. `role` is intentionally short (1–3
 * words, e.g. "CEO & Founder") so it works as the card's big title.
 */
const INSTRUCTORS: Instructor[] = [
  {
    number: '01',
    photo:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=900&q=80',
    name: 'Dr. Arif Hossain',
    role: 'CEO & Founder',
    description:
      'Sets the long-term vision for Smart Earning Pro and personally mentors every senior cohort through their capstone projects.',
  },
  {
    number: '02',
    photo:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80',
    name: 'Rifat Ahmed',
    role: 'Lead Instructor',
    description:
      'Senior full-stack engineer with 9+ years shipping real products. Designs our portfolio-led web development tracks.',
  },
  {
    number: '03',
    photo:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=80',
    name: 'Sajid Khan',
    role: 'Senior Career Coach',
    description:
      'Helps learners turn skills into income — from first client pitch to scaling a freelance agency profitably.',
  },
];

interface Stat {
  value: string;
  label: string;
  icon: typeof GraduationCap;
}

const STATS: Stat[] = [
  { value: '5+', label: 'Years of Teaching', icon: Award },
  { value: '14+', label: 'Active Courses', icon: GraduationCap },
  { value: '830+', label: 'Positive Reviews', icon: Smile },
  { value: '12K+', label: 'Successful Students', icon: Sparkles },
];

// ─────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────

const About = () => (
  <>
    {/* ── 1. The Dream Team of E-Learning (now first) ─────────── */}
    <section className="bg-surface-muted/40 py-20 dark:bg-ink-900/50">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.32em] text-ink-400">
            About
          </p>
          <h1 className="mt-3 text-4xl font-extrabold leading-tight tracking-tight text-ink-900 sm:text-5xl md:text-6xl dark:text-ink-100">
            The dream team of <br />
            <span className="text-brand-600">Smart Earning Pro.</span>
          </h1>
          <p className="mt-4 text-base text-ink-500 sm:text-lg">
            We grow careers online. Period.
          </p>
        </div>

        {/* Instructor cards — staggered on desktop: the middle card drops
            a little so the row reads as "up · down · up", matching the
            supplied reference. On mobile we collapse to a single column
            and the offsets are ignored. */}
        <div className="mt-14 grid items-start gap-8 md:grid-cols-3">
          {INSTRUCTORS.map((person, idx) => (
            <div
              key={person.number}
              className={idx === 1 ? 'md:mt-16' : 'md:mt-0'}
            >
              <InstructorCard person={person} />
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── 2. Our Dream is Global Learning Transformation ──────── */}
    <section className="container py-20">
      <div className="grid gap-8 rounded-3xl border border-brand-100 bg-brand-50/40 p-6 dark:border-brand-700/30 dark:bg-brand-700/10 sm:p-10 lg:grid-cols-2 lg:items-stretch lg:gap-12 lg:p-14">
        {/* ── Left column: copy ────────────────────────────────── */}
        <div className="flex flex-col justify-center">
          <p className="inline-flex w-fit items-center gap-2 rounded-full bg-brand-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-700 dark:bg-brand-700/30 dark:text-brand-200">
            <Compass className="h-3.5 w-3.5" />
            How It Started
          </p>
          <h2 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight text-ink-900 sm:text-5xl dark:text-ink-100">
            Our Dream is{' '}
            <span className="text-brand-600">Global Learning</span>{' '}
            Transformation
          </h2>
          <p className="mt-6 max-w-lg text-sm leading-relaxed text-ink-600 sm:text-base dark:text-ink-300">
            Smart Earning Pro was founded by a small team of practitioners and
            educators who believed online learning could be{' '}
            <strong>practical, mentor-backed and outcome-driven</strong> at the
            same time. United by that belief, we built a platform where
            ambitious learners from every corner of Bangladesh — and beyond —
            can pick up career-defining skills, ship real projects, and turn
            classroom hours into measurable income.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/course">
              <Button variant="primary" leftIcon={<GraduationCap className="h-4 w-4" />}>
                Explore courses
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" leftIcon={<Briefcase className="h-4 w-4" />}>
                Talk to an advisor
              </Button>
            </Link>
          </div>
        </div>

        {/* ── Right column: image + stats ──────────────────────── */}
        <div className="flex flex-col gap-5">
          <div className="relative h-56 w-full overflow-hidden rounded-2xl bg-brand-200 sm:h-72 lg:h-80">
            {/* Decorative diagonal pattern */}
            <span className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rotate-12 rounded-3xl bg-brand-500/20" />
            <span className="pointer-events-none absolute -left-8 -bottom-8 h-32 w-32 -rotate-12 rounded-3xl bg-brand-500/15" />
            <Image
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80"
              alt="Learners collaborating on a project"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          {/* 2 × 2 stat grid */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {STATS.map(({ value, label, icon: Icon }) => (
              <div
                key={label}
                className="rounded-2xl border border-ink-100 bg-white p-4 transition hover:border-brand-300 sm:p-5 dark:border-ink-700 dark:bg-ink-900"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 text-brand-700 dark:bg-brand-700/30 dark:text-brand-200">
                  <Icon className="h-4 w-4" />
                </span>
                <p className="mt-3 text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl dark:text-ink-100">
                  {value}
                </p>
                <p className="mt-1 text-xs font-medium text-ink-500 sm:text-sm">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>

    {/* ── 3. Original "Built by practitioners" intro ──────────── */}
    <section className="container py-16">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">
          About us
        </p>
        <h2 className="mt-3 text-4xl font-bold tracking-tight text-ink-900 sm:text-5xl dark:text-ink-100">
          Built by practitioners, for ambitious learners.
        </h2>
        <p className="mt-4 text-lg text-ink-500">
          Smart Earning Pro began as an internal lead-generation training program
          for our own remote agency. Today it&apos;s an outcome-focused school
          helping thousands of professionals turn skills into real income.
        </p>
      </div>

      {/* ── 4. Pillar cards ──────────────────────────────────── */}
      <div className="mt-12 grid gap-6 sm:grid-cols-3">
        <FeatureCard
          icon={Target}
          title="Outcome-first"
          description="Every program is built backwards from a specific career or revenue outcome."
        />
        <FeatureCard
          icon={HeartHandshake}
          title="Mentor-led"
          description="Our instructors are senior practitioners actively working in the field they teach."
        />
        <FeatureCard
          icon={Globe2}
          title="Globally distributed"
          description="Asynchronous-first cohorts let learners from 50+ countries study on their own schedule."
        />
      </div>

      {/* ── 5. Mission split card ────────────────────────────── */}
      <div className="mt-16 grid gap-10 rounded-3xl border border-ink-100 bg-white p-8 lg:grid-cols-2 lg:p-12 dark:border-ink-700 dark:bg-ink-900">
        <div>
          <h2 className="text-2xl font-bold text-ink-900 dark:text-ink-100">
            Our mission
          </h2>
          <p className="mt-3 text-ink-500">
            To make career-changing skills as accessible as a Netflix subscription,
            with the rigour of a top-tier bootcamp and the freedom of self-paced
            learning.
          </p>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-ink-900 dark:text-ink-100">
            Where we&apos;re headed
          </h2>
          <p className="mt-3 text-ink-500">
            We&apos;re investing in mentor networks, employer partnerships and
            AI-assisted feedback to shorten the path from learner to professional.
          </p>
        </div>
      </div>
    </section>
  </>
);

// ─────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────

/**
 * Single instructor card — photo at the top (4:5 portrait crop) with a
 * number badge in the bottom-left and a floating name pill in the
 * bottom-right; body text below.
 *
 * We use plain `object-cover` here so the original Unsplash backdrop of
 * each portrait remains visible (no cutout trickery). The professional
 * male portraits referenced in `INSTRUCTORS` all have clean, neutral
 * studio backdrops, so the row still reads as one consistent team.
 */
const InstructorCard = ({ person }: { person: Instructor }) => (
  <article className="overflow-hidden rounded-3xl border border-ink-100 bg-white transition hover:border-brand-300 dark:border-ink-700 dark:bg-ink-900">
    <div className="relative aspect-[4/5] w-full bg-brand-100/50">
      <Image
        src={person.photo}
        alt={person.name}
        fill
        sizes="(max-width: 768px) 100vw, 33vw"
        className="object-cover object-center"
      />
      {/* Number badge (bottom-left). */}
      <span className="absolute bottom-3 left-3 inline-flex items-center rounded-md bg-white/95 px-3 py-1 text-sm font-extrabold text-ink-900 dark:bg-ink-900/95 dark:text-ink-100">
        {person.number}
      </span>
      {/* Floating name pill (bottom-right). */}
      <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-ink-700 dark:bg-ink-900/95 dark:text-ink-100">
        <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
        {person.name}
      </span>
    </div>
    <div className="p-5">
      <h3 className="text-lg font-bold text-ink-900 dark:text-ink-100">
        {person.role}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-500">
        {person.description}
      </p>
    </div>
  </article>
);

export default About;
