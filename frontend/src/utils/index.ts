import clsx, { type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Combines clsx + tailwind-merge so component variants don't fight each other. */
export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs));

export const formatCurrency = (
  amount: number,
  currency = 'USD',
  locale = 'en-US',
): string =>
  new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);

export const formatDate = (
  value: string | Date,
  locale = 'en-US',
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' },
): string => new Intl.DateTimeFormat(locale, options).format(new Date(value));

export const truncate = (text: string, max = 140): string =>
  text.length > max ? `${text.slice(0, max - 1)}\u2026` : text;

/** Safe JSON parse for localStorage values. */
export const safeJsonParse = <T>(value: string | null, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};
