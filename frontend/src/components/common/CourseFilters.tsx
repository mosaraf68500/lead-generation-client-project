'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState, useTransition } from 'react';
import { Search, Filter, X, Tag, BadgePercent, GraduationCap, DollarSign } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { COURSE_LEVELS, type CourseLevel } from '@/types';
import { cn } from '@/utils';

interface CourseFiltersProps {
  /**
   * Categories used to be a filterable facet, but the product moved
   * away from surfacing courses under a category in the UX. The prop
   * is kept (optional) so existing parents don't break — it's a no-op
   * here.
   */
  categories?: string[];
  /** Top-end of the price slider; defaults to 500 when not provided. */
  priceCeiling?: number;
}

const PRESET_PRICE_RANGES = [
  { label: 'Under $50', max: 50, min: 0 },
  { label: '$50 - $100', min: 50, max: 100 },
  { label: '$100 - $250', min: 100, max: 250 },
  { label: '$250 +', min: 250, max: undefined as number | undefined },
];

const FilterSection = ({
  title,
  icon: Icon,
  children,
  defaultOpen = true,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="border-b border-ink-100 px-4 py-4 last:border-b-0 dark:border-ink-700">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-ink-900 dark:text-ink-100">
          <Icon className="h-4 w-4 text-brand-600" />
          {title}
        </span>
        <span className={cn('text-xs text-ink-500 transition', open && 'rotate-180')}>&#9662;</span>
      </button>
      {open && <div className="mt-3 space-y-2">{children}</div>}
    </section>
  );
};

export const CourseFilters = ({ priceCeiling = 500 }: CourseFiltersProps) => {
  const router = useRouter();
  const search = useSearchParams();
  const [pending, startTransition] = useTransition();

  const activeSearch = search.get('search') ?? '';
  const activeLevel = (search.get('level') as CourseLevel | '') ?? '';
  const activeMin = Number(search.get('minPrice') ?? 0);
  const activeMax = Number(search.get('maxPrice') ?? priceCeiling);
  const activeOnSale = search.get('onSale') === 'true';

  // Local controlled state for inputs that should debounce / batch (search,
  // price). Selecting a checkbox commits immediately.
  const [searchTerm, setSearchTerm] = useState(activeSearch);
  const [priceMax, setPriceMax] = useState<number>(activeMax || priceCeiling);

  const commit = (patch: Record<string, string | undefined>) => {
    const params = new URLSearchParams(search.toString());
    Object.entries(patch).forEach(([k, v]) => {
      if (v === undefined || v === '' || v === null) params.delete(k);
      else params.set(k, v);
    });
    params.delete('page');
    startTransition(() => {
      router.push(`/course${params.toString() ? `?${params.toString()}` : ''}`);
    });
  };

  const clearAll = () => {
    setSearchTerm('');
    setPriceMax(priceCeiling);
    startTransition(() => router.push('/course'));
  };

  const activeChips = useMemo(() => {
    const chips: Array<{ key: string; label: string; onClear: () => void }> = [];
    if (activeSearch) chips.push({ key: 'search', label: `Search: ${activeSearch}`, onClear: () => commit({ search: undefined }) });
    if (activeLevel) chips.push({ key: 'level', label: activeLevel, onClear: () => commit({ level: undefined }) });
    if (activeOnSale) chips.push({ key: 'onSale', label: 'On sale', onClear: () => commit({ onSale: undefined }) });
    if (activeMin > 0 || (activeMax > 0 && activeMax < priceCeiling))
      chips.push({
        key: 'price',
        label: `$${activeMin} - $${activeMax || priceCeiling}`,
        onClear: () => commit({ minPrice: undefined, maxPrice: undefined }),
      });
    return chips;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSearch, activeLevel, activeOnSale, activeMin, activeMax, priceCeiling]);

  return (
    <aside className="overflow-hidden rounded-md border border-ink-100 bg-white shadow-sm dark:border-ink-700 dark:bg-ink-900">
      <header className="flex items-center justify-between bg-brand-600 px-4 py-3 text-sm font-bold uppercase tracking-wider text-white">
        <span className="inline-flex items-center gap-2">
          <Filter className="h-4 w-4" /> Filters
        </span>
        {activeChips.length > 0 && (
          <button type="button" onClick={clearAll} className="text-xs font-semibold underline-offset-2 hover:underline">
            Clear all
          </button>
        )}
      </header>

      {/* Active chips (so users always see what's applied) */}
      {activeChips.length > 0 && (
        <div className="border-b border-ink-100 px-4 py-3 dark:border-ink-700">
          <div className="flex flex-wrap gap-2">
            {activeChips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={chip.onClear}
                className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-2.5 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-200 dark:bg-brand-700/30 dark:text-brand-200"
              >
                {chip.label}
                <X className="h-3 w-3" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <FilterSection title="Search" icon={Search}>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            commit({ search: searchTerm.trim() || undefined });
          }}
          className="relative"
        >
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
          <Input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Course, topic, tag..."
            className="pl-9"
          />
        </form>
      </FilterSection>

      {/* Level */}
      <FilterSection title="Level" icon={GraduationCap}>
        <div className="flex flex-wrap gap-1.5">
          {COURSE_LEVELS.map((level) => {
            const active = activeLevel === level;
            return (
              <button
                key={level}
                type="button"
                onClick={() => commit({ level: active ? undefined : level })}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-semibold capitalize transition',
                  active
                    ? 'border-brand-500 bg-brand-500 text-white'
                    : 'border-ink-100 text-ink-700 hover:border-brand-300 hover:text-brand-700 dark:border-ink-700 dark:text-ink-100',
                )}
              >
                {level}
              </button>
            );
          })}
        </div>
      </FilterSection>

      {/* Price */}
      <FilterSection title="Price" icon={DollarSign}>
        <div className="space-y-3">
          <ul className="space-y-1.5">
            {PRESET_PRICE_RANGES.map((range) => {
              const isActive =
                activeMin === range.min &&
                ((range.max === undefined && activeMax === priceCeiling) ||
                  activeMax === range.max);
              return (
                <li key={range.label}>
                  <button
                    type="button"
                    onClick={() => {
                      const next = isActive
                        ? { minPrice: undefined, maxPrice: undefined }
                        : {
                            minPrice: String(range.min),
                            maxPrice: range.max ? String(range.max) : String(priceCeiling),
                          };
                      setPriceMax(range.max ?? priceCeiling);
                      commit(next);
                    }}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm',
                      isActive
                        ? 'bg-brand-50 text-brand-700 dark:bg-brand-700/20'
                        : 'text-ink-700 hover:bg-ink-100 dark:text-ink-100 dark:hover:bg-ink-700',
                    )}
                  >
                    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-current text-[10px]">
                      {isActive ? '\u2713' : ''}
                    </span>
                    {range.label}
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Custom max-price slider for finer control */}
          <div className="pt-2">
            <label htmlFor="maxPrice" className="flex items-center justify-between text-xs font-medium text-ink-500">
              <span>Max price</span>
              <span className="font-semibold text-ink-900 dark:text-ink-100">${priceMax}</span>
            </label>
            <input
              id="maxPrice"
              type="range"
              min={0}
              max={priceCeiling}
              step={10}
              value={priceMax}
              onChange={(event) => setPriceMax(Number(event.target.value))}
              onMouseUp={() => commit({ minPrice: '0', maxPrice: String(priceMax) })}
              onTouchEnd={() => commit({ minPrice: '0', maxPrice: String(priceMax) })}
              className="mt-2 w-full accent-brand-600"
            />
          </div>
        </div>
      </FilterSection>

      {/* Discount offers */}
      <FilterSection title="Offers" icon={BadgePercent}>
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={activeOnSale}
            onChange={(event) => commit({ onSale: event.target.checked ? 'true' : undefined })}
            className="mt-1 h-4 w-4 rounded border-ink-100 text-brand-600 focus:ring-brand-500"
          />
          <span>
            <span className="font-semibold text-ink-900 dark:text-ink-100">On sale only</span>
            <span className="block text-xs text-ink-500">Show courses with an active discount.</span>
          </span>
        </label>
      </FilterSection>

      {/* Tagline + reset */}
      <div className="border-t border-ink-100 bg-surface-muted px-4 py-3 text-xs text-ink-500 dark:border-ink-700 dark:bg-ink-900">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1">
            <Tag className="h-3 w-3" /> {pending ? 'Updating...' : 'Filters apply instantly'}
          </span>
          {activeChips.length > 0 && (
            <Button size="sm" variant="ghost" onClick={clearAll}>
              Reset
            </Button>
          )}
        </div>
      </div>
    </aside>
  );
};
