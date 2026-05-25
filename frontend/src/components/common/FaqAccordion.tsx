'use client';

/**
 * Lightweight FAQ accordion. Uses the native <details>/<summary> elements
 * so it works without JS and stays accessible. The "open" item gets a
 * brand-coloured ring to match the rest of the dashboard surfaces.
 */

import { Plus } from 'lucide-react';

export interface FaqItem {
  q: string;
  a: string;
}

interface FaqAccordionProps {
  items: FaqItem[];
}

export const FaqAccordion = ({ items }: FaqAccordionProps) => (
  <div className="space-y-3">
    {items.map((item) => (
      <details
        key={item.q}
        className="group rounded-2xl border border-ink-100 bg-white p-4 open:border-brand-200 dark:border-ink-700 dark:bg-ink-900"
      >
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-ink-900 dark:text-ink-100">
          {item.q}
          <Plus className="h-4 w-4 shrink-0 text-ink-500 transition-transform group-open:rotate-45" />
        </summary>
        <p className="mt-3 text-sm leading-relaxed text-ink-500">{item.a}</p>
      </details>
    ))}
  </div>
);
