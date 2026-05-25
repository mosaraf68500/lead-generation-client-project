import Link from 'next/link';
import Image from 'next/image';
import {
  Megaphone,
  Tag,
  Sparkles,
  ArrowUpRight,
  BadgePercent,
  AlertOctagon,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/common/StatCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { requireSessionRole } from '@/services/session';
import { fetchCourses } from '@/services/courses';
import { fetchLeadAnalytics } from '@/services/leads';
import { formatCurrency } from '@/utils';
import type { Course } from '@/types';

export const dynamic = 'force-dynamic';

interface PromoCourse {
  course: Course;
  savings: number;
  discountPct: number;
}

const buildPromos = (courses: Course[]): PromoCourse[] =>
  courses
    .filter(
      (c) =>
        typeof c.discountPrice === 'number' &&
        (c.discountPrice ?? 0) > 0 &&
        (c.discountPrice ?? 0) < c.price,
    )
    .map((c) => {
      const savings = c.price - (c.discountPrice ?? 0);
      const discountPct = Math.round((savings / c.price) * 100);
      return { course: c, savings, discountPct };
    })
    .sort((a, b) => b.discountPct - a.discountPct);

const PromotionsPage = async () => {
  await requireSessionRole('super_admin');

  const [{ courses }, leadAnalytics] = await Promise.all([
    fetchCourses({ limit: 100, isPublished: true }),
    fetchLeadAnalytics(),
  ]);

  const promos = buildPromos(courses);
  const averageDiscount =
    promos.length === 0
      ? 0
      : Math.round(
          promos.reduce((sum, p) => sum + p.discountPct, 0) / promos.length,
        );

  // How many leads come from the special-offer surfaces vs everywhere else.
  const specialOfferSources = ['special-offers', 'special-offer-card', 'offer-popup'];
  const offerSources = (leadAnalytics?.bySource ?? []).filter((row) =>
    specialOfferSources.some((s) => row.source.toLowerCase().includes(s.toLowerCase())),
  );
  const totalFromOffers = offerSources.reduce((sum, row) => sum + row.count, 0);

  return (
    <DashboardLayout
      title="Promotions"
      subtitle="Manage your active offers and see which campaigns are driving leads."
      actions={
        <Link href="/admin/courses">
          <Button leftIcon={<Tag className="h-4 w-4" />}>Manage in courses</Button>
        </Link>
      }
    >
      {/* ── KPIs ────────────────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Megaphone}
          label="Active promotions"
          value={promos.length}
          hint={`of ${courses.length} published courses`}
          tone="brand"
        />
        <StatCard
          icon={BadgePercent}
          label="Avg discount"
          value={`${averageDiscount}%`}
          tone="accent"
          hint="Across all live offers"
        />
        <StatCard
          icon={Sparkles}
          label="Leads from offers"
          value={totalFromOffers}
          hint="Last 30 days"
          tone="warning"
        />
        <StatCard
          icon={Tag}
          label="Total enrolments"
          value={
            promos.reduce((sum, p) => sum + (p.course.enrollmentsCount ?? 0), 0) ||
            0
          }
          hint="From discounted courses only"
          tone="neutral"
        />
      </div>

      {/* ── Promotion cards ────────────────────────────────────── */}
      <section className="mt-10">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="text-lg font-semibold text-ink-900 dark:text-ink-100">
              Live offers
            </h2>
            <p className="text-sm text-ink-500">
              Sorted by discount — biggest savings first.
            </p>
          </div>
          <Link
            href="/special-offers"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-800"
          >
            View landing page <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {promos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink-100 bg-white px-6 py-12 text-center dark:border-ink-700 dark:bg-ink-900">
            <AlertOctagon className="mx-auto h-9 w-9 text-ink-300" />
            <h3 className="mt-3 text-base font-semibold text-ink-900 dark:text-ink-100">
              No live promotions
            </h3>
            <p className="mt-1 text-sm text-ink-500">
              Set a course&apos;s <code>discountPrice</code> below its price to put it
              on sale.
            </p>
            <div className="mt-4">
              <Link href="/admin/courses">
                <Button variant="outline" leftIcon={<Tag className="h-4 w-4" />}>
                  Go to course catalog
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {promos.map(({ course, savings, discountPct }) => (
              <article
                key={course.id}
                className="overflow-hidden rounded-2xl border border-ink-100 bg-white dark:border-ink-700 dark:bg-ink-900"
              >
                <div className="relative aspect-video w-full bg-ink-100">
                  {course.thumbnail?.url && (
                    <Image
                      src={course.thumbnail.url}
                      alt={course.title}
                      fill
                      sizes="(min-width: 1280px) 400px, (min-width: 768px) 50vw, 100vw"
                      className="object-cover"
                    />
                  )}
                  <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                    <BadgePercent className="h-3 w-3" /> -{discountPct}%
                  </span>
                </div>
                <div className="space-y-2 p-4">
                  <Badge tone="brand" className="text-[10px]">
                    {course.category}
                  </Badge>
                  <h3 className="line-clamp-2 text-sm font-bold text-ink-900 dark:text-ink-100">
                    {course.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-extrabold text-brand-700 dark:text-brand-300">
                      {formatCurrency(course.discountPrice ?? course.price)}
                    </span>
                    <span className="text-xs text-ink-500 line-through">
                      {formatCurrency(course.price)}
                    </span>
                    <span className="ml-auto text-[10px] font-semibold text-emerald-700">
                      Save {formatCurrency(savings)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <p className="text-[11px] text-ink-500">
                      {course.enrollmentsCount ?? 0} enrolments
                    </p>
                    <Link
                      href={`/admin/courses/${course.slug}/edit`}
                      className="text-[11px] font-semibold text-brand-700 hover:text-brand-800"
                    >
                      Edit offer &rarr;
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* ── Offer-source lead mix ───────────────────────────────── */}
      <section className="mt-10 rounded-2xl border border-ink-100 bg-white p-5 dark:border-ink-700 dark:bg-ink-900">
        <h2 className="text-base font-semibold text-ink-900 dark:text-ink-100">
          Lead sources tagged as offers
        </h2>
        <p className="text-xs text-ink-500">
          Captures that came in from <code>special-offers</code> /{' '}
          <code>special-offer-card</code> / <code>offer-popup</code>.
        </p>

        {offerSources.length === 0 ? (
          <p className="mt-4 text-sm text-ink-500">
            No leads from special-offer surfaces in the last 30 days.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {offerSources.map((row) => {
              const pct = leadAnalytics?.total
                ? Math.round((row.count / leadAnalytics.total) * 100)
                : 0;
              return (
                <li
                  key={row.source}
                  className="flex items-center gap-3 rounded-xl border border-ink-100 px-3 py-2 dark:border-ink-700"
                >
                  <span className="flex-1 truncate text-sm font-medium text-ink-700 dark:text-ink-100">
                    {row.source}
                  </span>
                  <span className="text-xs text-ink-500">{pct}% of platform</span>
                  <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[11px] font-bold text-brand-700 dark:bg-brand-700/30">
                    {row.count} leads
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </DashboardLayout>
  );
};

export default PromotionsPage;
