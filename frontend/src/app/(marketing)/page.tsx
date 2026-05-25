import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  Trophy,
  Users,
  ShieldCheck,
  Briefcase,
  Layers,
  Code2,
  Palette,
  Megaphone,
  LineChart,
  Sparkles as SparklesIcon,
  Flame,
  GraduationCap,
  Award,
  UserCheck,
} from 'lucide-react';
import { CourseGrid } from '@/components/common/CourseGrid';
import { FeatureCard } from '@/components/common/FeatureCard';
import { LeadForm } from '@/components/common/LeadForm';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { fetchCourses } from '@/services/courses';

export const dynamic = 'force-dynamic';

const FEATURES = [
  {
    icon: BookOpen,
    title: 'Project-led curriculum',
    description: 'Every course is built around real, shippable projects you can put on a portfolio.',
  },
  {
    icon: Users,
    title: 'Mentor-backed learning',
    description: 'Office hours and 1:1 feedback from instructors who currently work in the field.',
  },
  {
    icon: Trophy,
    title: 'Outcome-driven',
    description: '92% of graduates report a measurable career outcome within 6 months.',
  },
  {
    icon: ShieldCheck,
    title: 'Lifetime access',
    description: 'Buy once, learn forever. Including future updates and new modules.',
  },
];

const TESTIMONIALS = [
  {
    quote:
      'The lead-generation playbook tripled our qualified pipeline within a single quarter. Worth 10x the price.',
    name: 'Priya M.',
    role: 'Marketing Lead, SaaS startup',
  },
  {
    quote:
      'I shipped my first SaaS during the program. I am still amazed at how applicable every single lesson was.',
    name: 'Daniel O.',
    role: 'Solo founder',
  },
  {
    quote:
      'Mentor reviews were the moment everything clicked. I went from junior to mid-level in eight months.',
    name: 'Aïda R.',
    role: 'Product Designer',
  },
];

const FAQ = [
  {
    q: 'Do I need any prior experience?',
    a: 'No. We have curated learning paths for both complete beginners and working professionals looking to specialise.',
  },
  {
    q: 'How long do I have access to a course?',
    a: 'Forever. Every purchase includes lifetime updates and access to future module additions.',
  },
  {
    q: 'Is there a refund policy?',
    a: 'Yes. We offer a 14-day no-questions-asked refund on every course.',
  },
  {
    q: 'Do I get a certificate?',
    a: 'Yes. You receive a shareable, verifiable certificate upon completing every course.',
  },
];

const SIDEBAR_CATEGORIES = [
  { label: 'Business & Finance', icon: Briefcase },
  { label: 'Design & Creative', icon: Palette },
  { label: 'Engineering & Code', icon: Code2 },
  { label: 'Marketing & Sales', icon: Megaphone },
  { label: 'Data & Analytics', icon: LineChart },
  { label: 'Personal Growth', icon: SparklesIcon },
  { label: 'No-Code & Tools', icon: Layers },
];

/**
 * Achievement tiles shown on the home page. Numbers are derived live from
 * the live courses + their enrollment counts; instructor & award counts
 * are editorial figures we control here.
 */
interface Achievement {
  icon: typeof GraduationCap;
  value: string;
  label: string;
  tone: 'brand' | 'amber' | 'emerald' | 'violet';
}

const TONE_STYLES: Record<Achievement['tone'], string> = {
  brand: 'from-brand-500 to-brand-700 text-white',
  amber: 'from-amber-400 to-amber-600 text-white',
  emerald: 'from-emerald-400 to-emerald-600 text-white',
  violet: 'from-violet-500 to-violet-700 text-white',
};

const HomePage = async () => {
  // Two parallel fetches:
  //   1. Featured (newest published, default sort) — the existing carousel.
  //   2. Popular (most-enrolled) — drives the new "Popular courses" row.
  const [{ courses }, { courses: popularCourses }] = await Promise.all([
    fetchCourses({ limit: 6, isPublished: true }),
    fetchCourses({ limit: 8, isPublished: true, sort: '-enrollmentsCount' }),
  ]);

  // Build dynamic achievement numbers from real data with sensible fallbacks
  // so the section looks great even on a brand-new database.
  const totalEnrollments = popularCourses.reduce(
    (sum, c) => sum + (c.enrollmentsCount ?? 0),
    0,
  );
  const studentsHelped = Math.max(totalEnrollments, 12_500);
  const courseCount = Math.max(courses.length, popularCourses.length, 14);

  const ACHIEVEMENTS: Achievement[] = [
    {
      icon: GraduationCap,
      value: `${studentsHelped.toLocaleString()}+`,
      label: 'Successful students',
      tone: 'brand',
    },
    {
      icon: BookOpen,
      value: `${courseCount}+`,
      label: 'Courses available',
      tone: 'emerald',
    },
    {
      icon: UserCheck,
      value: '40+',
      label: 'Expert instructors',
      tone: 'violet',
    },
    {
      icon: Award,
      value: '12',
      label: 'Awards proudly received',
      tone: 'amber',
    },
  ];

  return (
    <>
      {/* ============================================================== */}
      {/* HERO — left sidebar (categories) + right banner                 */}
      {/* ============================================================== */}
      <section className="container pt-6">
        <div className="grid items-stretch gap-6 lg:grid-cols-[260px,1fr]">
          {/* Left: category sidebar, width-aligned with the "Browse Categories" navbar tab */}
          <aside className="hidden rounded-md border border-ink-100 bg-white p-3 lg:block dark:border-ink-700 dark:bg-ink-900">
            <ul className="divide-y divide-ink-100 dark:divide-ink-700">
              {SIDEBAR_CATEGORIES.map(({ label, icon: Icon }) => (
                <li key={label}>
                  <Link
                    href={`/course?category=${encodeURIComponent(label.split(' ')[0])}`}
                    className="flex items-center gap-3 px-2 py-2.5 text-sm text-ink-700 transition hover:text-brand-700 dark:text-ink-100"
                  >
                    <Icon className="h-4 w-4 text-brand-600" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>

          {/* Right: banner */}
          <div className="relative overflow-hidden rounded-md bg-surface-muted dark:bg-ink-900">
            <div className="grid gap-6 px-6 py-10 sm:px-10 sm:py-12 md:grid-cols-[1.1fr,1fr] md:items-center md:py-16">
              <div className="space-y-5">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-600">
                  Smart Earning Pro
                </p>
                <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight text-ink-900 sm:text-5xl md:text-6xl dark:text-ink-100">
                  Your Skills,
                  <br />
                  <span className="text-brand-600">Live Earning</span>
                </h1>
                <p className="max-w-md text-sm text-ink-500 sm:text-base">
                  Career-focused online courses, mentor reviews and a community that compounds.
                  Add a course to your plan and start earning back what you learn.
                </p>
                <Link
                  href="/course"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-brand-500 px-7 text-sm font-bold text-white shadow-card transition hover:bg-brand-600"
                >
                  Start Learning <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="relative hidden h-[340px] w-full md:block">
                <Image
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80"
                  alt="Learners collaborating"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="rounded-md object-cover object-center"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---- SOCIAL PROOF ---- */}
      <section className="container py-10">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-ink-500">
          Trusted by teams at
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-70">
          {['Acme', 'Globex', 'Initech', 'Hooli', 'Umbrella', 'Stark'].map((name) => (
            <span key={name} className="text-lg font-semibold tracking-tight text-ink-500">
              {name}
            </span>
          ))}
        </div>
      </section>

      {/* ---- FEATURES ---- */}
      <section className="container py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
            Why learners ship faster here
          </h2>
          <p className="mt-3 text-ink-500">
            Every course is mentor-supported and outcome-tracked. We optimise for what you build, not just what you watch.
          </p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </section>

      {/* ---- FEATURED COURSES ---- */}
      <section className="container py-12">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-ink-900">Featured courses</h2>
            <p className="mt-1 text-ink-500">Browse our most-loved learning paths.</p>
          </div>
          <Link href="/course" className="text-sm font-semibold text-brand-700 hover:text-brand-800">
            View all courses &rarr;
          </Link>
        </div>
        <div className="mt-8">
          <CourseGrid courses={courses} emptyTitle="New courses coming soon" />
        </div>
      </section>

      {/* ---- POPULAR COURSES (sorted by enrollmentsCount desc) ---- */}
      {popularCourses.length > 0 && (
        <section className="container py-12">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <Badge tone="brand" className="inline-flex w-fit gap-1">
                <Flame className="h-3.5 w-3.5" /> Trending now
              </Badge>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-ink-900 dark:text-ink-100">
                Popular courses
              </h2>
              <p className="mt-1 text-ink-500">
                The most-enrolled programs across the platform — picked by learners,
                not by us.
              </p>
            </div>
            <Link
              href="/course?sort=popular"
              className="text-sm font-semibold text-brand-700 hover:text-brand-800"
            >
              See all popular courses &rarr;
            </Link>
          </div>
          <div className="mt-8">
            <CourseGrid
              courses={popularCourses}
              emptyTitle="Enroll a course to get the leaderboard going"
            />
          </div>
        </section>
      )}

      {/* ---- LEAD CAPTURE ---- */}
      <section id="lead" className="container py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr,1.1fr] lg:items-start">
          <div className="space-y-4">
            <Badge tone="brand" className="inline-flex w-fit gap-1">
              <SparklesIcon className="h-3.5 w-3.5" /> Free career consultation
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl dark:text-ink-100">
              Not sure which course is right for you?
            </h2>
            <p className="max-w-md text-ink-500">
              Tell us a little about your goals and an advisor will map a personalised learning path
              within one business day. Free, no pressure.
            </p>
            <ul className="space-y-2 text-sm text-ink-700 dark:text-ink-100">
              <li className="flex items-center gap-2">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand-100 text-brand-600 dark:bg-brand-700/30 dark:text-brand-200">
                  &#10003;
                </span>
                Human, never spammy
              </li>
              <li className="flex items-center gap-2">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand-100 text-brand-600 dark:bg-brand-700/30 dark:text-brand-200">
                  &#10003;
                </span>
                Tailored to your background
              </li>
              <li className="flex items-center gap-2">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand-100 text-brand-600 dark:bg-brand-700/30 dark:text-brand-200">
                  &#10003;
                </span>
                Exclusive promo codes
              </li>
            </ul>
          </div>
          <LeadForm
            source="landing-hero"
            courses={courses.map((c) => ({ id: c.id, title: c.title }))}
          />
        </div>
      </section>

      {/* ---- TESTIMONIALS ---- */}
      <section className="container py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
            Real outcomes, real learners
          </h2>
          <p className="mt-3 text-ink-500">
            We obsess over outcomes. Here&apos;s what graduates have to say.
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure key={t.name} className="rounded-3xl border border-ink-100 bg-white p-6 shadow-card">
              <blockquote className="text-sm text-ink-700">&ldquo;{t.quote}&rdquo;</blockquote>
              <figcaption className="mt-4">
                <p className="text-sm font-semibold text-ink-900">{t.name}</p>
                <p className="text-xs text-ink-500">{t.role}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ---- FAQ ---- */}
      <section className="container py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr,1.4fr]">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">FAQ</h2>
            <p className="mt-3 text-ink-500">
              Still have questions? <Link href="/contact" className="font-semibold text-brand-700">Talk to an advisor</Link>.
            </p>
          </div>
          <dl className="divide-y divide-ink-100 overflow-hidden rounded-3xl border border-ink-100 bg-white shadow-card">
            {FAQ.map((item) => (
              <div key={item.q} className="px-6 py-5">
                <dt className="text-base font-semibold text-ink-900">{item.q}</dt>
                <dd className="mt-2 text-sm text-ink-500">{item.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ---- OUR ACHIEVEMENTS ---- */}
      <section className="container pb-20">
        <div className="mx-auto max-w-2xl text-center">
          <Badge tone="brand" className="inline-flex w-fit gap-1">
            <Trophy className="h-3.5 w-3.5" /> Our achievements
          </Badge>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl dark:text-ink-100">
            Numbers we&apos;re proud of
          </h2>
          <p className="mt-3 text-ink-500">
            From late-night coders to career-switchers, Smart Earning Pro is the
            place thousands of learners turn into a launchpad.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {ACHIEVEMENTS.map((a) => (
            <div
              key={a.label}
              className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${TONE_STYLES[a.tone]} p-6`}
            >
              {/* Decorative blob */}
              <span className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/15" />
              <div className="relative">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/40 backdrop-blur">
                  <a.icon className="h-6 w-6" />
                </span>
                <p className="mt-5 text-4xl font-extrabold tracking-tight">{a.value}</p>
                <p className="mt-1 text-sm font-semibold text-white/90">{a.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Supporting copy + CTA */}
        <div className="mt-10 rounded-3xl border border-ink-100 bg-white p-6 dark:border-ink-700 dark:bg-ink-900 sm:p-8">
          <div className="grid gap-4 lg:grid-cols-[1.6fr,1fr] lg:items-center">
            <div>
              <h3 className="text-xl font-bold text-ink-900 dark:text-ink-100">
                Want to add your name to the success list?
              </h3>
              <p className="mt-1 text-sm text-ink-500">
                Join our next cohort and learn alongside thousands of focused,
                outcome-driven students.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-3">
              <Link href="/course">
                <Button variant="primary">Browse all courses</Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline">Talk to an advisor</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;
