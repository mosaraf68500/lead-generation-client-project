import Image from 'next/image';
import Link from 'next/link';
import {
  BookOpen,
  Trophy,
  Rocket,
  Star,
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
  // Single fetch — drives the Popular Courses row. The product team
  // curates ~11 evergreen courses (Photo Editing, Video Editing,
  // Microsoft Excel, Data Entry, Social Marketing, Spoken English,
  // Facebook Marketing, Learn Al Quran, Lead Generation, Fiverr/Upwork,
  // YouTube Marketing) which should all surface here, so the limit is
  // 12 to give a touch of headroom over the current 11.
  const { courses: popularCourses } = await fetchCourses({
    limit: 12,
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
      {/* HERO — full-width, soft purple banner with a transparent       */}
      {/*         cut-out person on the right.                            */}
      {/*                                                                 */}
      {/* Brand orange still drives the CTA buttons + headline accent so  */}
      {/* the brand identity stays consistent; the purple is purely a    */}
      {/* mood/background colour for this hero band.                      */}
      {/* ============================================================== */}
      <section className="container pt-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-100 via-purple-200 to-purple-300 dark:from-ink-900 dark:via-ink-900 dark:to-ink-800">
          {/* Decorative soft blobs so the flat purple feels alive. */}
          <span
            aria-hidden
            className="pointer-events-none absolute -top-20 -right-16 h-72 w-72 rounded-full bg-white/40 blur-2xl"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute bottom-0 left-1/3 h-48 w-48 rounded-full bg-purple-400/30 blur-2xl"
          />

          <div className="relative grid gap-8 px-6 py-12 sm:px-10 sm:py-14 md:grid-cols-[1.15fr,1fr] md:items-end md:py-0 md:pt-14">
            {/* ── Left column: copy + CTAs + social proof ───────────── */}
            <div className="space-y-6 md:pb-14">
              {/* Pill badge */}
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-4 py-1.5 text-xs font-bold text-brand-700 backdrop-blur dark:bg-ink-700 dark:text-brand-200">
                <Rocket className="h-3.5 w-3.5" />
                Start Learning Today
              </span>

              {/* Headline with brand-color accent on the brand name. */}
              <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight text-ink-900 sm:text-5xl md:text-6xl dark:text-ink-100">
                Upgrade Your Skills{' '}
                <span className="text-brand-600">With Smart Earning Pro</span>
              </h1>

              <p className="max-w-xl text-sm leading-relaxed text-ink-700 sm:text-base dark:text-ink-100">
                Join thousands of learners and build the skills you need to grow your career.
                Practical courses, expert guidance and projects — all in one place.
              </p>

              {/* Dual CTA — visitors who are logged out land on /login;
                  the "Join Us" secondary CTA points to /register so we
                  still expose sign-up without using the word. */}
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/login"
                  className="inline-flex h-12 items-center justify-center rounded-md bg-brand-600 px-7 text-sm font-bold text-white transition hover:bg-brand-700"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="inline-flex h-12 items-center justify-center rounded-md bg-brand-500 px-7 text-sm font-bold text-white transition hover:bg-brand-600"
                >
                  Join Us
                </Link>
              </div>

              {/* Social proof — three avatar circles, 5-star rating,
                  learner count. Uses Unsplash avatars so the row still
                  looks alive on a fresh database. */}
              <div className="flex items-center gap-4 pt-2">
                <div className="flex -space-x-2">
                  {[
                    'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=128&q=80',
                    'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=crop&w=128&q=80',
                    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=128&q=80',
                  ].map((src, i) => (
                    <span
                      key={src}
                      className="relative inline-block h-10 w-10 overflow-hidden rounded-full border-2 border-white"
                    >
                      <Image src={src} alt={`Happy learner ${i + 1}`} fill sizes="40px" className="object-cover" />
                    </span>
                  ))}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-500" />
                    ))}
                  </div>
                  <p className="text-sm font-semibold text-ink-900 dark:text-ink-100">
                    <span className="text-base font-extrabold">4.8k+</span> Happy Learners
                  </p>
                </div>
              </div>
            </div>

            {/* ── Right column: transparent cut-out students ──────────
                Real photo of two learners with a laptop on a clean
                transparent background — the purple band shows through
                behind them, giving the cutout look from the reference
                design.
                To swap with your own asset:
                  1. Upload a transparent PNG to Cloudinary (already in
                     `next.config.mjs`).
                  2. Replace the `src` below with the Cloudinary URL. */}
            <div className="relative hidden h-[460px] w-full md:block">
              <Image
                src="https://pngimg.com/uploads/student/student_PNG163.png"
                alt="Two learners exploring a course together on a laptop"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain object-bottom"
              />
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
