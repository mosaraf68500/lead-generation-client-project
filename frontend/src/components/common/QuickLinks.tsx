'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LogOut,
  ChevronRight,
  History,
  BookmarkPlus,
  Heart,
  LifeBuoy,
  Inbox,
  GraduationCap,
  UserCircle,
  ShieldCheck,
  Users,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/utils';

/**
 * Registered icon keys QuickLinks can render. We map string keys to actual
 * Lucide components inside this client module — that way the parent (which
 * can be a Server Component) only ships plain strings across the boundary,
 * sidestepping Next.js's "functions cannot be passed to Client Components"
 * serialisation error.
 */
export type QuickLinkIconName =
  | 'history'
  | 'interested'
  | 'wishlist'
  | 'support'
  | 'inbox'
  | 'courses'
  | 'profile'
  | 'admin'
  | 'users'
  | 'settings';

const ICONS: Record<QuickLinkIconName, LucideIcon> = {
  history: History,
  interested: BookmarkPlus,
  wishlist: Heart,
  support: LifeBuoy,
  inbox: Inbox,
  courses: GraduationCap,
  profile: UserCircle,
  admin: ShieldCheck,
  users: Users,
  settings: Settings,
};

export interface QuickLinkItem {
  label: string;
  href: string;
  /** String key looked up against the local icon registry. */
  iconName?: QuickLinkIconName;
}

interface QuickLinksProps {
  /** Optional section heading text (default "Quick links"). */
  title?: string;
  /** The list of navigation items to render. */
  items: QuickLinkItem[];
  /** Whether to show the "Log out" button at the bottom of the panel. */
  showLogout?: boolean;
}

/**
 * Right-rail "Quick links" panel used on the Profile page and other
 * personal dashboard pages. Mirrors the ShopBangla account-sidebar style:
 *   - small uppercase header with a leading icon glyph
 *   - vertical list of links with the active page highlighted in brand-green
 *   - optional outlined-red "Log out" button at the bottom
 */
export const QuickLinks = ({ title = 'Quick links', items, showLogout = true }: QuickLinksProps) => {
  const pathname = usePathname();
  const { signOut } = useAuth();

  return (
    <aside className="space-y-4">
      <div className="rounded-2xl border border-ink-100 bg-white p-5 dark:border-ink-700 dark:bg-ink-900">
        <p className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-ink-500">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-700/30 dark:text-brand-200">
            <ChevronRight className="h-3 w-3" />
          </span>
          {title}
        </p>
        <nav className="space-y-1">
          {items.map((item) => {
            const Icon = item.iconName ? ICONS[item.iconName] : undefined;
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold transition',
                  active
                    ? 'text-brand-700 dark:text-brand-200'
                    : 'text-ink-700 hover:text-brand-700 dark:text-ink-100',
                )}
              >
                {Icon && <Icon className={cn('h-4 w-4', !active && 'text-ink-500')} />}
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {showLogout && (
        <button
          type="button"
          onClick={signOut}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-white text-sm font-bold uppercase tracking-wider text-red-600 transition hover:border-red-300 hover:bg-red-50 dark:border-red-700/40 dark:bg-ink-900 dark:hover:bg-red-900/20"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      )}
    </aside>
  );
};
