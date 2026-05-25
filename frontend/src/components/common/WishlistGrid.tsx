'use client';

/**
 * Wishlist grid rendered on /dashboard/wishlist.
 *
 * Reads from the client-side WishlistContext (localStorage-backed). Each card
 * lets the user jump to the course detail page or remove the item from the
 * list. The full "Clear wishlist" action lives at the top.
 */

import Link from 'next/link';
import Image from 'next/image';
import { Heart, Trash2, ExternalLink, ShoppingBag } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/utils';

export const WishlistGrid = () => {
  const { items, remove, clear, count } = useWishlist();

  if (count === 0) {
    return (
      <EmptyState
        icon={Heart}
        title="Your wishlist is empty"
        description="Save courses you'd like to enroll in later — they'll show up here on every device you log into."
        action={
          <Link
            href="/course"
            className="inline-flex h-10 items-center gap-1.5 rounded-md bg-brand-600 px-4 text-xs font-bold uppercase tracking-wider text-white hover:bg-brand-700"
          >
            <ShoppingBag className="h-4 w-4" /> Browse courses
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-500">
          {count} saved item{count === 1 ? '' : 's'}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (window.confirm('Remove all items from your wishlist?')) clear();
          }}
        >
          Clear all
        </Button>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white dark:border-ink-700 dark:bg-ink-900"
          >
            <div className="relative h-40 w-full bg-ink-100">
              {item.thumbnail && (
                <Image
                  src={item.thumbnail}
                  alt={item.title}
                  fill
                  sizes="(min-width: 1024px) 33vw, 50vw"
                  className="object-cover"
                />
              )}
            </div>
            <div className="flex flex-1 flex-col gap-3 p-4">
              <h3 className="line-clamp-2 text-sm font-semibold text-ink-900 dark:text-ink-100">
                {item.title}
              </h3>
              <p className="text-base font-bold text-brand-600">{formatCurrency(item.price)}</p>
              <div className="mt-auto flex items-center gap-2">
                <Link
                  href={`/course/${item.slug}`}
                  className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-brand-600 px-3 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-brand-700"
                >
                  View <ExternalLink className="h-3.5 w-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={() => remove(item.id)}
                  aria-label={`Remove ${item.title} from wishlist`}
                  title="Remove from wishlist"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-ink-100 text-red-600 transition hover:border-red-300 dark:border-ink-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
