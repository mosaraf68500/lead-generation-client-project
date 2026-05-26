'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  GaugeCircle,
  GraduationCap,
  Inbox,
  Users,
  ShieldCheck,
  Settings,
  LogOut,
  UserCircle,
  History,
  Heart,
  LifeBuoy,
  BookmarkPlus,
  Activity,
  Palette,
  Megaphone,
  Radar,
  LineChart,
  Contact2,
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

// Personal items (profile, history, wishlist, interested, support center) are
// reachable from the navbar account dropdown for every authenticated user, so
// the sidebar exposes them ONLY on the student dashboard — staff / admin /
// super-admin sidebars stay focused on workspace + system tooling.
const ITEMS: SidebarItem[] = [
  { label: 'Dashboard', href: '/student', icon: GaugeCircle, roles: ['student'] },
  { label: 'Dashboard', href: '/staff', icon: GaugeCircle, roles: ['staff'] },
  { label: 'Dashboard', href: '/admin', icon: GaugeCircle, roles: ['admin'] },
  { label: 'Dashboard', href: '/super-admin', icon: ShieldCheck, roles: ['super_admin'] },

  // Workspace (gated by privileged roles).
  // Staff land on the dedicated `/staff/leads` CRM (debounced search,
  // print, refresh, optimistic status updates). Admin / super-admin keep
  // using `/admin/leads` which adds assignment + export + delete.
  { label: 'My Leads', href: '/staff/leads', icon: Inbox, roles: ['staff'], group: 'Main Menu' },
  { label: 'Leads', href: '/admin/leads', icon: Inbox, roles: ['admin', 'super_admin'], group: 'Main Menu' },
  { label: 'Courses', href: '/admin/courses', icon: GraduationCap, roles: ['admin', 'super_admin'], group: 'Main Menu' },
  // 'Categories' nav was removed — courses no longer live under a
  // category in the visible UX. The model + page remain on the backend
  // (reachable by direct URL) but are no longer linked from anywhere.
  { label: 'Customers', href: '/admin/customers', icon: Contact2, roles: ['admin', 'super_admin'], group: 'Main Menu' },
  { label: 'Promotions', href: '/super-admin/promotions', icon: Megaphone, roles: ['admin', 'super_admin'], group: 'Main Menu' },
  { label: 'Analytics', href: '/admin/analytics', icon: LineChart, roles: ['admin', 'super_admin'], group: 'Main Menu' },
  { label: 'Users', href: '/admin/users', icon: Users, roles: ['admin', 'super_admin'], group: 'Main Menu' },

  // System (super-admin only).
  { label: 'System settings', href: '/super-admin/settings', icon: Settings, roles: ['super_admin'], group: 'System' },
  { label: 'API scanner', href: '/super-admin/api-scanner', icon: Radar, roles: ['super_admin'], group: 'System' },
  { label: 'System health', href: '/super-admin/system-health', icon: Activity, roles: ['super_admin'], group: 'System' },
  { label: 'Theme', href: '/super-admin/theme', icon: Palette, roles: ['super_admin'], group: 'System' },

  // Personal — student dashboard only (other roles use the navbar dropdown).
  { label: 'Profile', href: '/dashboard/profile', icon: UserCircle, roles: ['student'], group: 'Personal' },
  { label: 'History', href: '/dashboard/history', icon: History, roles: ['student'], group: 'Personal' },
  { label: 'Interested', href: '/dashboard/interested', icon: BookmarkPlus, roles: ['student'], group: 'Personal' },
  { label: 'Wishlist', href: '/dashboard/wishlist', icon: Heart, roles: ['student'], group: 'Personal' },
  { label: 'Support center', href: '/dashboard/support', icon: LifeBuoy, roles: ['student'], group: 'Personal' },
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

const roleBadge = (role: UserRole): string => {
  switch (role) {
    case 'super_admin':
      return 'Super Admin Panel';
    case 'admin':
      return 'Admin Panel';
    case 'staff':
      return 'Staff Panel';
    default:
      return 'Student Panel';
  }
};

export const DashboardSidebar = () => {
  const { user, signOut } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const homeHref = dashboardHomeForRole(user.role);
  // STRICT role matching — no super_admin auto-elevation here.
  const items = ITEMS.filter((item) => item.roles.includes(user.role));

  return (
    <aside className="hidden w-64 shrink-0 flex-col bg-[#0b1220] py-0 lg:flex">
      {/* Brand header */}
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
        <Link href={homeHref} className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-base font-extrabold text-white">
            SE
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-base font-extrabold text-white">SmartEarning</span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">
              {roleBadge(user.role)}
            </span>
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {items.map((item, idx) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const isFirstOfGroup =
            item.group && (idx === 0 || items[idx - 1]?.group !== item.group);

          return (
            <div key={item.href}>
              {isFirstOfGroup && (
                <p className="mt-5 px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-white/40">
                  {item.group}
                </p>
              )}
              <Link
                href={item.href}
                className={cn(
                  'group relative mt-0.5 flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition',
                  active
                    ? 'bg-brand-500/15 text-brand-300'
                    : 'text-white/75 hover:bg-white/5 hover:text-white',
                )}
              >
                {active && (
                  <span
                    aria-hidden
                    className="absolute inset-y-1 left-0 w-1 rounded-r-full bg-brand-500"
                  />
                )}
                <Icon className={cn('h-4 w-4', active ? 'text-brand-400' : 'text-white/60 group-hover:text-white')} />
                {item.label}
              </Link>
            </div>
          );
        })}
      </nav>

      {/* Footer / sign-out */}
      <div className="border-t border-white/10 px-3 py-4">
        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.22em] text-white/40">
          Settings
        </p>
        <button
          type="button"
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-white/75 transition hover:bg-white/5 hover:text-white"
        >
          <LogOut className="h-4 w-4 text-white/60" /> Logout
        </button>
      </div>
    </aside>
  );
};
