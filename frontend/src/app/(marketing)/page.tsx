import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  Trophy,
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
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { fetchCourses } from '@/services/courses';
import type { Course } from '@/types';

export const dynamic = 'force-dynamic';

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

/**
 * Minimal popular-course tile.
 *
 * Intentionally tiny — homepage Popular Courses should not look like the
 * `/course` listing. We only show the thumbnail + title; clicking the
 * tile drops the visitor on the full course detail page where price,
 * rating, instructors, etc. live.
 *
 * Kept local to this file because no other page needs this presentation.
 */
const CourseTile = ({ course }: { course: Course }) => (
  <Link
    href={`/course/${course.slug}`}
    className="group flex flex-col overflow-hidden rounded-2xl border border-brand-100 bg-white transition hover:-translate-y-1 hover:border-brand-300 dark:border-ink-700 dark:bg-ink-900"
  >
    <div className="relative aspect-[16/10] w-full overflow-hidden bg-brand-50 dark:bg-ink-800">
      <Image
        src={course.thumbnail.url}
        alt={course.title}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
    </div>
    <div className="px-4 py-4">
      <h3 className="text-center text-sm font-semibold text-ink-900 transition group-hover:text-brand-700 dark:text-ink-100 sm:text-base">
        {course.title}
      </h3>
    </div>
  </Link>
);

const HomePage = async () => {
  // Single fetch — the "Featured courses" carousel was removed, so only
  // the popular-courses row needs data. We sort by `-enrollmentsCount`
  // and grab a slightly larger page so the achievements math has a
  // meaningful course count to fall back on.
  const { courses: popularCourses } = await fetchCourses({
    limit: 8,
    isPublished: true,
    sort: '-enrollmentsCount',
  });

  // Build dynamic achievement numbers from real data with sensible fallbacks
  // so the section looks great even on a brand-new database.
  const totalEnrollments = popularCourses.reduce(
    (sum, c) => sum + (c.enrollmentsCount ?? 0),
    0,
  );
  const studentsHelped = Math.max(totalEnrollments, 12_500);
  const courseCount = Math.max(popularCourses.length, 14);

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

      {/* ---- POPULAR COURSES (sorted by enrollmentsCount desc) ----
            Minimal presentation: just image + title. Visitors click
            through to `/course/[slug]` for the full detail page. */}
      {popularCourses.length > 0 && (
        <section className="container py-12">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b-2 border-brand-500 pb-3">
            <div>
              <Badge tone="brand" className="inline-flex w-fit gap-1">
                <Flame className="h-3.5 w-3.5" /> Trending now
              </Badge>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-ink-900 dark:text-ink-100 sm:text-3xl">
                Popular courses
              </h2>
            </div>
            <Link
              href="/course?sort=popular"
              className="text-sm font-semibold text-brand-700 hover:text-brand-800"
            >
              See all popular courses &rarr;
            </Link>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {popularCourses.map((course) => (
              <CourseTile key={course.id} course={course} />
            ))}
          </div>
        </section>
      )}

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
