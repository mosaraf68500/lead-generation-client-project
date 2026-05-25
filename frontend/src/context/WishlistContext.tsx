'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { safeJsonParse } from '@/utils';

export interface WishlistItem {
  id: string;
  title: string;
  slug: string;
  thumbnail?: string;
  price: number;
}

interface WishlistContextValue {
  items: WishlistItem[];
  count: number;
  isInWishlist: (id: string) => boolean;
  add: (item: WishlistItem) => void;
  remove: (id: string) => void;
  toggle: (item: WishlistItem) => void;
  clear: () => void;
}

const STORAGE_KEY = 'sep-wishlist';
const WishlistContext = createContext<WishlistContextValue | null>(null);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<WishlistItem[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setItems(safeJsonParse<WishlistItem[]>(window.localStorage.getItem(STORAGE_KEY), []));
  }, []);

  // Persist on every change so a refresh keeps the list.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const isInWishlist = useCallback((id: string) => items.some((i) => i.id === id), [items]);

  const add = useCallback((item: WishlistItem) => {
    setItems((current) => (current.some((i) => i.id === item.id) ? current : [...current, item]));
  }, []);

  const remove = useCallback((id: string) => {
    setItems((current) => current.filter((i) => i.id !== id));
  }, []);

  const toggle = useCallback((item: WishlistItem) => {
    setItems((current) =>
      current.some((i) => i.id === item.id)
        ? current.filter((i) => i.id !== item.id)
        : [...current, item],
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({ items, count: items.length, isInWishlist, add, remove, toggle, clear }),
    [items, isInWishlist, add, remove, toggle, clear],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlist = (): WishlistContextValue => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within <WishlistProvider>');
  return ctx;
};
