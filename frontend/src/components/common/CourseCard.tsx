'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Clock, Heart, BookmarkPlus, Star, Users, BadgePercent } from 'lucide-react';
import type { Course } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, truncate } from '@/utils';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { useLeadCapture } from '@/context/LeadCaptureContext';

interface CourseCardProps {
  course: Course;
}

export const CourseCard = ({ course }: CourseCardProps) => {
  const effectivePrice = course.discountPrice ?? course.price;
  const onSale = Boolean(course.discountPrice && course.discountPrice < course.price);
  const discountPct = onSale
    ? Math.round(((course.price - (course.discountPrice ?? 0)) / course.price) * 100)
    : 0;

  const { isInWishlist, toggle: toggleWishlist } = useWishlist();
  const { isInCart, add: addToCart } = useCart();
  const { push } = useToast();
  const { open: openLeadCapture } = useLeadCapture();

  const onWishlist = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    toggleWishlist({
      id: course.id,
      title: course.title,
      slug: course.slug,
      thumbnail: course.thumbnail?.url,
      price: effectivePrice,
    });
    push({
      variant: 'info',
      title: isInWishlist(course.id) ? 'Removed from wishlist' : 'Added to wishlist',
    });
  };

  /**
   * "Add to my list" button. There's no checkout flow — the cart acts as a
   * lead bucket the student can submit for batched follow-up. We still call
   * it "add to cart" internally because that's what the CartContext exposes.
   */
  const onAddToList = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!isInCart(course.id)) {
      addToCart({
        id: course.id,
        title: course.title,
        slug: course.slug,
        thumbnail: course.thumbnail?.url,
        price: effectivePrice,
      });
      push({ variant: 'success', title: 'Saved to your list', description: course.title });
    }
  };

  const onEnroll = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    // No traditional checkout: open the LeadCaptureModal pre-bound to THIS
    // course. The modal POSTs to /leads and (for new emails) auto-creates the
    // student account before redirecting them to /student.
    openLeadCapture({
      source: `course:${course.slug}`,
      course: { id: course.id, title: course.title, onSale },
      heading: onSale ? `Claim your offer — ${course.title}` : `Enroll in ${course.title}`,
      cta: onSale ? 'Claim my offer' : 'Submit & enroll',
    });
  };

  return (
    <Link
      href={`/course/${course.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-card transition hover:-translate-y-1 hover:shadow-cardHover dark:bg-ink-900"
    >
      {/* Media */}
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        <Image
          src={course.thumbnail.url}
          alt={course.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Top-left badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          <Badge tone="brand" className="bg-white/95 text-ink-900 backdrop-blur">
            {course.level}
          </Badge>
          {onSale && (
            <Badge tone="warning" className="inline-flex items-center gap-1 bg-amber-500 text-white">
              <BadgePercent className="h-3 w-3" /> -{discountPct}%
            </Badge>
          )}
          {!course.isPublished && <Badge tone="warning">Draft</Badge>}
        </div>
        {/* Wishlist */}
        <button
          type="button"
          aria-label="Toggle wishlist"
          onClick={onWishlist}
          className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-ink-700 shadow transition hover:text-red-500"
        >
          <Heart className={`h-4 w-4 ${isInWishlist(course.id) ? 'fill-red-500 text-red-500' : ''}`} />
        </button>
      </div>

      {/* Body — the legacy category pill was removed; courses no longer
          surface a category in the user-facing UX. */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="text-lg font-semibold text-ink-900 group-hover:text-brand-700 dark:text-ink-100">
          {course.title}
        </h3>
        <p className="text-sm text-ink-500">{truncate(course.shortDescription, 110)}</p>

        <div className="mt-auto flex items-center justify-between pt-3 text-xs text-ink-500">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {course.durationHours}h
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5" /> {course.enrollmentsCount.toLocaleString()}
          </span>
          <span className="inline-flex items-center gap-1">
            <Star className="h-3.5 w-3.5 text-amber-500" /> {course.ratingAvg.toFixed(1)}
          </span>
        </div>

        {/* Price + CTAs */}
        <div className="border-t border-ink-100 pt-3 dark:border-ink-700">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-ink-900 dark:text-ink-100">
                {formatCurrency(effectivePrice)}
              </span>
              {onSale && (
                <span className="text-xs text-ink-300 line-through">
                  {formatCurrency(course.price)}
                </span>
              )}
            </div>
            {onSale && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                Save {discountPct}%
              </span>
            )}
          </div>

          <div className="mt-3 flex items-stretch gap-2">
            <button
              type="button"
              onClick={onEnroll}
              className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-md bg-brand-600 px-3 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-brand-700"
            >
              {onSale ? 'Claim Offer' : 'Enroll Now'}
            </button>
            <button
              type="button"
              onClick={onAddToList}
              aria-label={isInCart(course.id) ? 'Already in your list' : 'Add to my list'}
              title={isInCart(course.id) ? 'Already in your list' : 'Add to my list'}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-ink-100 text-ink-700 transition hover:border-brand-300 hover:text-brand-700 disabled:opacity-60 dark:border-ink-700 dark:text-ink-100"
              disabled={isInCart(course.id)}
            >
              <BookmarkPlus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};
