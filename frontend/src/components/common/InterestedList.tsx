'use client';

/**
 * "Interested" page — what used to be the cart in a traditional e-commerce
 * site. In this lead-generation platform the cart is simply a *bucket of
 * interest*: students stack courses they're curious about, then hit
 * "Proceed" which opens the high-converting LeadCaptureModal pre-bound to
 * the whole list.
 */

import Image from 'next/image';
import Link from 'next/link';
import { BookmarkX, ArrowRight, Sparkles, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/context/CartContext';
import { useLeadCapture } from '@/context/LeadCaptureContext';
import { formatCurrency } from '@/utils';
import { useAuth } from '@/context/AuthContext';

export const InterestedList = () => {
  const { items, remove, clear, total } = useCart();
  const { open } = useLeadCapture();
  const { isAuthenticated } = useAuth();

  const handleProceed = () => {
    open({
      source: 'interested-bucket',
      courses: items.map((i) => ({ id: i.id, title: i.title })),
      heading:
        items.length === 1
          ? `Enroll in ${items[0].title}`
          : `Reserve seats for ${items.length} courses`,
      subheading:
        'Tell us a bit about yourself — our advisor will lock in a custom plan within one business day. No payment required up front.',
      cta: items.length === 1 ? 'Submit & enroll' : 'Reserve all seats',
    });
  };

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-ink-100 bg-white px-6 py-16 text-center dark:border-ink-700 dark:bg-ink-900">
        <Sparkles className="mx-auto h-10 w-10 text-ink-300" />
        <h3 className="mt-3 text-base font-semibold text-ink-900 dark:text-ink-100">
          Your list is empty
        </h3>
        <p className="mt-1 text-sm text-ink-500">
          Browse the catalog and tap the bookmark icon to stash courses here. When you&apos;re ready, hit
          &ldquo;Proceed&rdquo; and our team will reach out to design a personalised plan.
        </p>
        <Link href="/course" className="mt-4 inline-block">
          <Button variant="primary" rightIcon={<ArrowRight className="h-4 w-4" />}>
            Browse courses
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr,360px]">
      {/* Items list */}
      <div className="space-y-3">
        {items.map((item) => (
          <article
            key={item.id}
            className="flex items-center gap-3 rounded-2xl border border-ink-100 bg-white p-3 dark:border-ink-700 dark:bg-ink-900"
          >
            <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-ink-100 dark:bg-ink-700">
              {item.thumbnail ? (
                <Image
                  src={item.thumbnail}
                  alt={item.title}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-ink-300">
                  <GraduationCap className="h-6 w-6" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <Link
                href={`/course/${item.slug}`}
                className="truncate text-sm font-semibold text-ink-900 hover:text-brand-700 dark:text-ink-100"
              >
                {item.title}
              </Link>
              <p className="mt-0.5 text-xs text-ink-500">{formatCurrency(item.price)} · approx</p>
            </div>
            <button
              type="button"
              onClick={() => remove(item.id)}
              aria-label={`Remove ${item.title}`}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-ink-100 text-ink-500 transition hover:border-red-300 hover:text-red-600 dark:border-ink-700"
            >
              <BookmarkX className="h-4 w-4" />
            </button>
          </article>
        ))}

        <button
          type="button"
          onClick={clear}
          className="text-xs font-semibold text-ink-500 underline-offset-2 hover:text-red-600 hover:underline"
        >
          Clear the list
        </button>
      </div>

      {/* Proceed panel */}
      <aside className="h-fit rounded-3xl border border-ink-100 bg-white p-5 dark:border-ink-700 dark:bg-ink-900 lg:sticky lg:top-28">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">
          Your interest summary
        </p>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-bold text-ink-900 dark:text-ink-100">
            {items.length} {items.length === 1 ? 'course' : 'courses'}
          </span>
          <span className="text-sm text-ink-500">~ {formatCurrency(total)}</span>
        </div>

        <ul className="mt-4 space-y-1 text-xs text-ink-500">
          <li>✓ No payment required up front</li>
          <li>✓ Free advisor consultation</li>
          <li>✓ Personalised cohort recommendation</li>
        </ul>

        <Button
          type="button"
          onClick={handleProceed}
          size="lg"
          className="mt-5 w-full"
          rightIcon={<ArrowRight className="h-4 w-4" />}
        >
          Proceed to enrolment
        </Button>

        {!isAuthenticated && (
          <p className="mt-3 text-center text-[11px] text-ink-500">
            We&apos;ll create your student account automatically — no signup needed.
          </p>
        )}
      </aside>
    </div>
  );
};
