import Link from 'next/link';
import { ArrowDownAZ, BadgePercent, Compass } from 'lucide-react';
import { CourseFilters } from '@/components/common/CourseFilters';
import { CourseGrid } from '@/components/common/CourseGrid';
import { Badge } from '@/components/ui/Badge';
import { fetchCourses } from '@/services/courses';
import type { Course } from '@/types';

export const dynamic = 'force-dynamic';

const STATIC_CATEGORIES = [
  'Business',
  'Design',
  'Engineering',
  'Marketing',
  'No-Code',
  'Productivity',
  'Finance',
];

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

const getParam = (searchParams: PageProps['searchParams'], key: string): string | undefined => {
  const value = searchParams[key];
  if (Array.isArray(value)) return value[0];
  return value;
};

const filterClientSide = (
  courses: Course[],
  filters: { minPrice?: number; maxPrice?: number; onSale?: boolean },
): Course[] => {
  return courses.filter((course) => {
    const effectivePrice = course.discountPrice ?? course.price;
    if (filters.minPrice !== undefined && effectivePrice < filters.minPrice) return false;
    if (filters.maxPrice !== undefined && effectivePrice > filters.maxPrice) return false;
    if (filters.onSale && !(course.discountPrice && course.discountPrice < course.price)) return false;
    return true;
  });
};

const CoursesPage = async ({ searchParams }: PageProps) => {
  const search = getParam(searchParams, 'search');
  const category = getParam(searchParams, 'category');
  const level = getParam(searchParams, 'level');
  const sort = getParam(searchParams, 'sort') ?? '-createdAt';
  const minPrice = getParam(searchParams, 'minPrice');
  const maxPrice = getParam(searchParams, 'maxPrice');
  const onSale = getParam(searchParams, 'onSale') === 'true';
  const page = Number(getParam(searchParams, 'page') ?? 1);

  // Pull a generous slice so we can post-filter by client-side price/onSale
  // without re-querying. For a real production catalog this should move to a
  // dedicated backend filter.
  const { courses, meta } = await fetchCourses({
    search,
    category,
    level,
    page,
    limit: 24,
    isPublished: true,
  });

  const visible = filterClientSide(courses, {
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    onSale,
  });

  const dynamicCategories = Array.from(new Set(courses.map((c) => c.category)));
  const categories = Array.from(new Set([...dynamicCategories, ...STATIC_CATEGORIES])).sort();

  // Sort by price/newness/popularity locally so the sort UI feels instant
  // without a roundtrip. Backend `sort` query stays the source of truth for
  // pagination.
  const sorted = [...visible].sort((a, b) => {
    switch (sort) {
      case 'price-asc':
        return (a.discountPrice ?? a.price) - (b.discountPrice ?? b.price);
      case 'price-desc':
        return (b.discountPrice ?? b.price) - (a.discountPrice ?? a.price);
      case 'popular':
        return b.enrollmentsCount - a.enrollmentsCount;
      case 'rating':
        return b.ratingAvg - a.ratingAvg;
      default:
        return 0;
    }
  });

  // Build pagination query-string preserving every active filter.
  const buildPageHref = (p: number): string => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (level) params.set('level', level);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (onSale) params.set('onSale', 'true');
    if (sort) params.set('sort', sort);
    params.set('page', String(p));
    return `/course?${params.toString()}`;
  };

  const buildSortHref = (next: string): string => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (level) params.set('level', level);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (onSale) params.set('onSale', 'true');
    params.set('sort', next);
    return `/course?${params.toString()}`;
  };

  return (
    <section className="container py-10">
      {/* Page header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-600">All courses</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl dark:text-ink-100">
            Find your next learning path
          </h1>
          <p className="mt-2 text-ink-500">
            {sorted.length} {sorted.length === 1 ? 'course' : 'courses'} match your filters
            {meta?.total ? ` (of ${meta.total} total)` : ''}.
          </p>
        </div>

        {/* Sort */}
        <div className="inline-flex items-center gap-2 rounded-md border border-ink-100 bg-white p-1 text-xs font-semibold dark:border-ink-700 dark:bg-ink-900">
          <span className="inline-flex items-center gap-1 px-2 text-ink-500">
            <ArrowDownAZ className="h-3.5 w-3.5" /> Sort
          </span>
          {[
            { value: '-createdAt', label: 'Newest' },
            { value: 'popular', label: 'Popular' },
            { value: 'rating', label: 'Top rated' },
            { value: 'price-asc', label: 'Price ↑' },
            { value: 'price-desc', label: 'Price ↓' },
          ].map((opt) => (
            <Link
              key={opt.value}
              href={buildSortHref(opt.value)}
              className={
                sort === opt.value
                  ? 'rounded-md bg-brand-500 px-2.5 py-1 text-white'
                  : 'rounded-md px-2.5 py-1 text-ink-700 hover:text-brand-700 dark:text-ink-100'
              }
            >
              {opt.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid items-start gap-6 lg:grid-cols-[260px,1fr]">
        <CourseFilters categories={categories} />

        <div className="space-y-6">
          {/* Inline offer banner — the "Claim Offer" CTA the spec calls for */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-brand-200 bg-brand-50 px-5 py-4 dark:border-brand-700/30 dark:bg-brand-700/20">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-brand-500 text-white">
                <BadgePercent className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-brand-700 dark:text-brand-100">
                  Limited-time bundle: save up to 40%
                </p>
                <p className="text-xs text-brand-700/80 dark:text-brand-200">
                  Stack any 3 courses and we&apos;ll discount the cheapest one.
                </p>
              </div>
            </div>
            <Link
              href="/special-offers"
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-brand-600 px-4 text-xs font-bold text-white transition hover:bg-brand-700"
            >
              Claim Offer
            </Link>
          </div>

          {/* Grid */}
          <CourseGrid courses={sorted} emptyTitle="No courses match these filters" />

          {/* No results helper */}
          {sorted.length === 0 && (
            <div className="rounded-md border border-dashed border-ink-100 bg-white p-6 text-sm text-ink-500 dark:border-ink-700 dark:bg-ink-900">
              <p className="inline-flex items-center gap-2">
                <Compass className="h-4 w-4 text-brand-600" />
                Tip: try the "On sale only" toggle, or widen the price range.
              </p>
            </div>
          )}

          {/* Pagination — based on the backend meta */}
          {meta && meta.totalPages > 1 && (
            <nav className="flex items-center justify-center gap-2 text-sm" aria-label="Pagination">
              {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={buildPageHref(p)}
                  className={
                    p === meta.page
                      ? 'inline-flex h-9 w-9 items-center justify-center rounded-md bg-brand-600 text-white'
                      : 'inline-flex h-9 w-9 items-center justify-center rounded-md border border-ink-100 bg-white text-ink-700 hover:border-brand-300 hover:text-brand-700 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-100'
                  }
                >
                  {p}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </div>

      {/* Trust strip */}
      <div className="mt-12 flex flex-wrap items-center justify-center gap-3 text-xs text-ink-500">
        <Badge tone="brand" className="capitalize">14-day refund</Badge>
        <Badge tone="brand" className="capitalize">Mentor reviews</Badge>
        <Badge tone="brand" className="capitalize">Lifetime updates</Badge>
        <Badge tone="brand" className="capitalize">Certificate included</Badge>
      </div>
    </section>
  );
};

export default CoursesPage;
