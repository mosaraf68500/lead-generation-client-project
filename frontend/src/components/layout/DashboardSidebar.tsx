'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  GaugeCircle,
  GraduationCap,
  Inbox,
  Users,
  ShieldCheck,
  LogOut,
  UserCircle,
  History,
  Heart,
  LifeBuoy,
  BookmarkPlus,
} from 'lucide-react';
import type { UserRole } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/utils';

interface SidebarItem {
  label: string;
  href: string;
  icon: typeof GaugeCircle;
  roles: UserRole[];
  /** Optional group label that appears above this item as a section header. */
  group?: string;
}

// All four authenticated roles get the same Personal section. Work-area
// items (Leads / Courses / Users) remain role-gated as before; super_admin
// transparently sees every item via the filter below.
const ALL_ROLES: UserRole[] = ['student', 'staff', 'admin', 'super_admin'];

const ITEMS: SidebarItem[] = [
  { label: 'Overview', href: '/student', icon: GaugeCircle, roles: ['student'] },
  { label: 'Overview', href: '/staff', icon: GaugeCircle, roles: ['staff'] },
  { label: 'Overview', href: '/admin', icon: GaugeCircle, roles: ['admin'] },
  { label: 'Overview', href: '/super-admin', icon: ShieldCheck, roles: ['super_admin'] },

  // Workspace (gated by privileged roles)
  { label: 'Leads', href: '/admin/leads', icon: Inbox, roles: ['staff', 'admin', 'super_admin'], group: 'Workspace' },
  { label: 'Courses', href: '/admin/courses', icon: GraduationCap, roles: ['staff', 'admin', 'super_admin'], group: 'Workspace' },
  { label: 'Users', href: '/admin/users', icon: Users, roles: ['admin', 'super_admin'], group: 'Workspace' },

  // Personal (every authenticated role)
  { label: 'Profile', href: '/dashboard/profile', icon: UserCircle, roles: ALL_ROLES, group: 'Personal' },
  { label: 'History', href: '/dashboard/history', icon: History, roles: ALL_ROLES, group: 'Personal' },
  { label: 'Interested', href: '/dashboard/interested', icon: BookmarkPlus, roles: ALL_ROLES, group: 'Personal' },
  { label: 'Wishlist', href: '/dashboard/wishlist', icon: Heart, roles: ALL_ROLES, group: 'Personal' },
  { label: 'Support center', href: '/dashboard/support', icon: LifeBuoy, roles: ALL_ROLES, group: 'Personal' },
];

const dashboardHomeForRole = (role: UserRole): string => {
  switch (role) {
    case 'super_admin':
      return '/super-admin';
    case 'admin':
      return '/admin';
    case 'staff':
      return '/staff';
    default:
      return '/student';
  }
};

export const DashboardSidebar = () => {
  const { user, signOut } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const homeHref = dashboardHomeForRole(user.role);
  const items = ITEMS.filter(
    (item) => item.roles.includes(user.role) || user.role === 'super_admin',
  );

  return (
    <aside className="hidden w-64 shrink-0 border-r border-ink-100 bg-white py-6 lg:block dark:border-ink-700 dark:bg-ink-900">
      <div className="px-6">
        <Link href={homeHref} className="flex items-center gap-2 text-lg font-bold text-ink-900 dark:text-ink-100">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl gradient-brand text-white">
            SE
          </span>
          Smart Earning
        </Link>
        <p className="mt-1 text-xs capitalize text-ink-500">{user.role.replace('_', ' ')}</p>
      </div>

      <nav className="mt-8 space-y-1 px-4">
        {items.map((item, idx) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          // Render a group header above the first item of each new group.
          const isFirstOfGroup =
            item.group && (idx === 0 || items[idx - 1]?.group !== item.group);

          return (
            <div key={item.href}>
              {isFirstOfGroup && (
                <p className="mt-5 px-3 pb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-ink-500">
                  {item.group}
                </p>
              )}
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium transition',
                  active
                    ? 'bg-brand-100 text-brand-700 dark:bg-brand-700/30 dark:text-brand-200'
                    : 'text-ink-700 hover:bg-ink-100 dark:text-ink-100 dark:hover:bg-ink-700',
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            </div>
          );
        })}
      </nav>

      <div className="mt-10 border-t border-ink-100 px-4 pt-4 dark:border-ink-700">
        <button
          type="button"
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium text-ink-700 hover:bg-ink-100 dark:text-ink-100 dark:hover:bg-ink-700"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </aside>
  );
};
