import Link from 'next/link';
import { Tag, Percent, Clock3, Flame } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { CourseGrid } from '@/components/common/CourseGrid';
import { OfferCardCta, OfferCaptureCta, ClaimAllOffers } from './OfferCtaButtons';
import { fetchCourses } from '@/services/courses';

export const dynamic = 'force-dynamic';

const DEALS = [
  {
    title: 'Career Bundle - 40% off',
    description: 'Three career-focused courses, one bundled price. Perfect for switching roles.',
    discount: '40%',
    cta: 'Claim 40% off',
    source: 'offer:career-bundle',
  },
  {
    title: 'Student starter pack',
    description: 'Pay 1, get 3. Includes Productivity, No-Code and Personal Growth fundamentals.',
    discount: '3 for 1',
    cta: 'Claim offer',
    source: 'offer:student-pack',
  },
  {
    title: 'Team license',
    description: 'Onboard a team of 5+ at 50% off. Includes mentor sessions for all seats.',
    discount: '50%',
    cta: 'Talk to sales',
    source: 'offer:team-license',
  },
];

const SpecialOffersPage = async () => {
  const { courses } = await fetchCourses({ limit: 6, isPublished: true });
  // Pretend any course with a discountPrice is "on sale". In production a real
  // promotions service would drive this.
  const onSale = courses.filter((c) => c.discountPrice && c.discountPrice < c.price);
  const featured = onSale.length > 0 ? onSale : courses;

  return (
    <>
      {/* ---- HERO ---- */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 gradient-brand" aria-hidden />
        <div className="container py-20 text-center text-white">
          <Badge tone="brand" className="inline-flex bg-white/15 text-white">
            <Flame className="mr-1 h-3.5 w-3.5" /> Limited time
          </Badge>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Special offers, hand-picked for ambitious learners.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/85">
            Save big on bundled tracks, refer friends, or unlock team licenses. These deals
            rotate weekly - grab them while they&apos;re live.
          </p>
        </div>
      </section>

      {/* ---- DEALS GRID ---- */}
      <section className="container -mt-12 mb-16">
        <div className="grid gap-6 md:grid-cols-3">
          {DEALS.map((deal) => (
            <article
              key={deal.title}
              className="relative overflow-hidden rounded-3xl border border-ink-100 bg-white p-6 shadow-card dark:border-ink-700 dark:bg-ink-900"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-100 text-brand-700 dark:bg-brand-700/30 dark:text-brand-200">
                  <Tag className="h-5 w-5" />
                </span>
                <span className="rounded-full bg-accent-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-accent-600">
                  Save {deal.discount}
                </span>
              </div>
              <h2 className="mt-5 text-xl font-semibold text-ink-900 dark:text-ink-100">{deal.title}</h2>
              <p className="mt-2 text-sm text-ink-500">{deal.description}</p>
              <div className="mt-6">
                <OfferCardCta title={deal.title} cta={deal.cta} source={deal.source} />
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ---- COURSES ON SALE ---- */}
      <section className="container py-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <Badge tone="warning" className="inline-flex">
              <Percent className="mr-1 h-3.5 w-3.5" /> Discounted now
            </Badge>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-ink-900 dark:text-ink-100">
              Courses on offer
            </h2>
            <p className="mt-1 text-ink-500">Top picks at the best prices we&apos;ve ever offered.</p>
          </div>
          <Link href="/course" className="text-sm font-semibold text-brand-700 hover:text-brand-800">
            See all courses &rarr;
          </Link>
        </div>
        <CourseGrid courses={featured} emptyTitle="No active offers right now" />
      </section>

      {/* ---- LEAD CAPTURE BANNER ---- */}
      <section id="lead" className="container py-12">
        <div className="grid gap-8 rounded-3xl border border-brand-200 bg-brand-50/40 p-6 sm:p-10 lg:grid-cols-[1.2fr,1fr] lg:items-center dark:border-brand-700/30 dark:bg-brand-700/10">
          <div className="space-y-4">
            <Badge tone="brand" className="inline-flex w-fit gap-1">
              <Flame className="h-3.5 w-3.5" /> Claim your discount
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl dark:text-ink-100">
              Lock in your seat at a special price.
            </h2>
            <p className="max-w-md text-ink-500">
              Drop your details and we will send a personalised offer to your WhatsApp.
              No spam, no follow-up calls without your consent.
            </p>
            <ul className="space-y-2 text-sm text-ink-700 dark:text-ink-100">
              <li>· Custom discount code valid for 7 days</li>
              <li>· Advisor pairs you with the right cohort</li>
              <li>· Confirmation within 24 business hours</li>
            </ul>
          </div>
          <div className="flex flex-col items-start gap-3 sm:items-end">
            <OfferCaptureCta courses={featured.map((c) => ({ id: c.id, title: c.title }))} />
            <ClaimAllOffers cta="Talk to an advisor" />
            <p className="text-[11px] text-ink-500 sm:text-right">
              We&apos;ll create your student account automatically — no payment up front.
            </p>
          </div>
        </div>
      </section>

      {/* ---- FINE PRINT ---- */}
      <section className="container py-12">
        <div className="grid gap-6 rounded-3xl border border-ink-100 bg-white p-8 shadow-card sm:p-10 md:grid-cols-3 dark:border-ink-700 dark:bg-ink-900">
          <div className="flex items-start gap-3">
            <Clock3 className="mt-0.5 h-5 w-5 text-brand-600" />
            <div>
              <p className="text-sm font-semibold text-ink-900 dark:text-ink-100">Time-limited</p>
              <p className="mt-1 text-xs text-ink-500">Most offers expire within 7 days of going live.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Tag className="mt-0.5 h-5 w-5 text-brand-600" />
            <div>
              <p className="text-sm font-semibold text-ink-900 dark:text-ink-100">One-time use</p>
              <p className="mt-1 text-xs text-ink-500">Each offer can be redeemed once per account.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Percent className="mt-0.5 h-5 w-5 text-brand-600" />
            <div>
              <p className="text-sm font-semibold text-ink-900 dark:text-ink-100">Stackable refunds</p>
              <p className="mt-1 text-xs text-ink-500">Our 14-day refund still applies on all discounts.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default SpecialOffersPage;
