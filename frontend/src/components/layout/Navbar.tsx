'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import {
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  UserCircle,
  History,
  LifeBuoy,
  Search,
  Phone,
  HelpCircle,
  ChevronDown,
  Heart,
  BookmarkPlus,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  MessageCircle,
  Sun,
  Moon,
  LogIn,
  User as UserIcon,
  PackageSearch,
  Globe,
  LayoutGrid,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { cn } from '@/utils';

/**
 * ShopBangla-style three-tier global header.
 *
 *  Tier 1 (top, light gray): phone + WhatsApp (left)  |  track order, FAQ,
 *                            dark/light toggle, language, social icons (right)
 *  Tier 2 (middle, white):   logo + brand + tagline   |  search bar
 *                            with green submit button |  wishlist, cart with
 *                            currency badge, account/login
 *  Tier 3 (main menu):       green "BROWSE CATEGORIES" tab (left, fixed
 *                            width that aligns with the homepage category
 *                            sidebar)                 |  Home, Course,
 *                            Special Offers, Blog, Contact (active item
 *                            shown with a green underline)
 */

const PHONE_NUMBER = '01783175638';
const PHONE_TEL = '+8801783175638';
const WHATSAPP_NUMBER = '01522114096';
const WHATSAPP_LINK = '8801522114096';

const MAIN_MENU = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Course', href: '/course' },
  { label: 'Special Offers', href: '/special-offers' },
  { label: 'Contact', href: '/contact' },
];

const CATEGORIES = [
  'Business',
  'Design',
  'Engineering',
  'Marketing',
  'No-Code',
  'Productivity',
  'Finance',
];

const dashboardPathForRole = (role: string): string => {
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

const ThemeToggleButton = ({ tone = 'dark' }: { tone?: 'dark' | 'light' }) => {
  const { theme, toggle } = useTheme();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle theme"
      className={cn(
        'inline-flex h-6 w-6 items-center justify-center rounded-full transition',
        tone === 'dark'
          ? 'text-ink-500 hover:bg-ink-100 hover:text-ink-900'
          : 'text-white/80 hover:bg-white/10 hover:text-white',
      )}
    >
      {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
    </button>
  );
};

const SocialIcons = () => (
  <div className="flex items-center gap-1.5 text-ink-500">
    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="transition hover:text-brand-600">
      <Facebook className="h-3.5 w-3.5" />
    </a>
    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="transition hover:text-brand-600">
      <Twitter className="h-3.5 w-3.5" />
    </a>
    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="transition hover:text-brand-600">
      <Instagram className="h-3.5 w-3.5" />
    </a>
    <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="transition hover:text-brand-600">
      <Linkedin className="h-3.5 w-3.5" />
    </a>
  </div>
);

export const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, signOut } = useAuth();
  const { count: cartCount } = useCart();
  const { count: wishlistCount } = useWishlist();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const onSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.set('search', searchTerm.trim());
    router.push(`/course${params.toString() ? `?${params.toString()}` : ''}`);
    setMobileOpen(false);
  };

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm dark:bg-ink-900">
      {/* ============================================================== */}
      {/* TIER 1 — utility bar                                            */}
      {/* ============================================================== */}
      <div className="hidden border-b border-ink-100 bg-[#f7f7f7] md:block dark:border-ink-700 dark:bg-ink-900">
        <div className="container flex h-9 items-center justify-between text-xs text-ink-700 dark:text-ink-100">
          <div className="flex items-center gap-5">
            <a
              href={`tel:${PHONE_TEL}`}
              className="inline-flex items-center gap-1.5 font-medium hover:text-brand-600"
            >
              <Phone className="h-3.5 w-3.5 text-brand-600" />
              {PHONE_NUMBER}
            </a>
            <a
              href={`https://wa.me/${WHATSAPP_LINK}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-medium hover:text-brand-600"
            >
              <MessageCircle className="h-3.5 w-3.5 text-brand-600" />
              {WHATSAPP_NUMBER}
            </a>
          </div>

          <div className="flex items-center gap-4 text-ink-500">
            <Link href="/student" className="inline-flex items-center gap-1 hover:text-brand-600">
              <PackageSearch className="h-3.5 w-3.5" /> Track Order
            </Link>
            <Link href="/contact" className="inline-flex items-center gap-1 hover:text-brand-600">
              <HelpCircle className="h-3.5 w-3.5" /> FAQ
            </Link>
            <ThemeToggleButton tone="dark" />
            <button
              type="button"
              className="inline-flex items-center gap-1 hover:text-brand-600"
              aria-label="Language"
            >
              <Globe className="h-3.5 w-3.5" /> English <ChevronDown className="h-3 w-3" />
            </button>
            <span className="h-3.5 w-px bg-ink-100 dark:bg-ink-700" />
            <SocialIcons />
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* TIER 2 — brand + search + cart/wishlist/account                 */}
      {/* ============================================================== */}
      <div className="border-b border-ink-100 bg-white dark:border-ink-700 dark:bg-ink-900">
        <div className="container flex h-20 items-center gap-6">
          {/* Logo + brand */}
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500 text-2xl font-extrabold text-white shadow-sm">
              S
            </span>
            <span className="hidden flex-col leading-tight sm:flex">
              <span className="text-xl font-extrabold text-ink-900 dark:text-ink-100">
                Smart<span className="text-brand-600">Earning</span>
              </span>
              <span className="text-[10px] font-semibold tracking-[0.18em] text-ink-300">
                PREMIUM E-LEARNING
              </span>
            </span>
          </Link>

          {/* Search */}
          <form
            onSubmit={onSearch}
            className="hidden h-12 flex-1 items-center overflow-hidden rounded-md border border-ink-100 bg-white md:flex dark:border-ink-700 dark:bg-ink-900"
          >
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search courses, instructors and more..."
              aria-label="Search"
              className="h-full flex-1 bg-transparent px-4 text-sm text-ink-700 placeholder:text-ink-300 focus:outline-none dark:text-ink-100"
            />
            <button
              type="submit"
              aria-label="Search"
              className="inline-flex h-full w-14 items-center justify-center bg-brand-500 text-white transition hover:bg-brand-600"
            >
              <Search className="h-5 w-5" />
            </button>
          </form>

          {/* Wishlist */}
          <Link
            href="/dashboard/wishlist"
            aria-label="Wishlist"
            className="relative hidden h-12 w-12 items-center justify-center rounded-md text-ink-700 transition hover:text-brand-600 md:inline-flex dark:text-ink-100"
          >
            <Heart className="h-6 w-6" />
            {wishlistCount > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Interested (lead bucket — replaces the old "Cart") */}
          <Link
            href="/dashboard/interested"
            aria-label="Interested courses"
            className="relative hidden items-center gap-2 md:flex"
          >
            <span className="relative inline-flex h-12 w-12 items-center justify-center text-ink-700 dark:text-ink-100">
              <BookmarkPlus className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                Interested
              </span>
              <span className="text-sm font-bold text-brand-600">
                {cartCount} course{cartCount === 1 ? '' : 's'}
              </span>
            </span>
          </Link>

          {/* Account / login */}
          <div className="hidden md:block">
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setAccountOpen((v) => !v)}
                  className="flex items-center gap-2"
                >
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-ink-100 text-ink-700 dark:bg-ink-700 dark:text-ink-100">
                    {user.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={user.avatar} alt={user.name} className="h-12 w-12 rounded-full object-cover" />
                    ) : (
                      <UserIcon className="h-5 w-5" />
                    )}
                  </span>
                  <span className="flex flex-col leading-tight text-left">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                      Account
                    </span>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-ink-900 dark:text-ink-100">
                      {user.name?.split(' ')[0] ?? 'Profile'}
                      <ChevronDown className="h-3 w-3" />
                    </span>
                  </span>
                </button>

                {accountOpen && (
                  <>
                    <button
                      type="button"
                      aria-label="Close menu"
                      className="fixed inset-0 z-10 cursor-default"
                      onClick={() => setAccountOpen(false)}
                    />
                    <div className="absolute right-0 z-20 mt-2 w-60 overflow-hidden rounded-lg border border-ink-100 bg-white shadow-cardHover dark:border-ink-700 dark:bg-ink-900">
                      <div className="border-b border-ink-100 px-4 py-3 dark:border-ink-700">
                        <p className="text-sm font-semibold text-ink-900 dark:text-ink-100">{user.name || 'Account'}</p>
                        <p className="truncate text-xs text-ink-500">{user.email}</p>
                        <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-brand-600">
                          {user.role.replace('_', ' ')}
                        </p>
                      </div>
                      <Link
                        href={dashboardPathForRole(user.role)}
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-ink-700 transition hover:bg-surface-muted dark:text-ink-100 dark:hover:bg-ink-700"
                      >
                        <LayoutDashboard className="h-4 w-4" /> Dashboard
                      </Link>
                      <Link
                        href="/dashboard/profile"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-ink-700 transition hover:bg-surface-muted dark:text-ink-100 dark:hover:bg-ink-700"
                      >
                        <UserCircle className="h-4 w-4" /> Profile
                      </Link>
                      <Link
                        href="/dashboard/history"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-ink-700 transition hover:bg-surface-muted dark:text-ink-100 dark:hover:bg-ink-700"
                      >
                        <History className="h-4 w-4" /> History
                      </Link>
                      <Link
                        href="/dashboard/wishlist"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-ink-700 transition hover:bg-surface-muted dark:text-ink-100 dark:hover:bg-ink-700"
                      >
                        <Heart className="h-4 w-4" /> Wishlist
                        {wishlistCount > 0 && (
                          <span className="ml-auto rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                            {wishlistCount}
                          </span>
                        )}
                      </Link>
                      <Link
                        href="/dashboard/support"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-ink-700 transition hover:bg-surface-muted dark:text-ink-100 dark:hover:bg-ink-700"
                      >
                        <LifeBuoy className="h-4 w-4" /> Support center
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setAccountOpen(false);
                          void signOut();
                        }}
                        className="flex w-full items-center gap-2 border-t border-ink-100 px-4 py-2.5 text-left text-sm text-ink-700 transition hover:bg-surface-muted dark:border-ink-700 dark:text-ink-100 dark:hover:bg-ink-700"
                      >
                        <LogOut className="h-4 w-4" /> Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link href="/login" className="flex items-center gap-2">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-ink-100 text-ink-700 dark:bg-ink-700 dark:text-ink-100">
                  <UserIcon className="h-5 w-5" />
                </span>
                <span className="flex flex-col leading-tight">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                    Account
                  </span>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-ink-900 dark:text-ink-100">
                    Login <ChevronDown className="h-3 w-3" />
                  </span>
                </span>
              </Link>
            )}
          </div>

          {/* Mobile trigger */}
          <button
            type="button"
            aria-label="Toggle menu"
            className="ml-auto inline-flex items-center justify-center rounded-md p-2 text-ink-700 md:hidden dark:text-ink-100"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* TIER 3 — categories tab + main menu                             */}
      {/* ============================================================== */}
      <nav className="hidden border-b border-ink-100 bg-white md:block dark:border-ink-700 dark:bg-ink-900">
        <div className="container flex items-stretch">
          {/* Categories tab (anchored, matches the homepage sidebar width) */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setCategoriesOpen((v) => !v)}
              className="flex h-12 w-[260px] items-center justify-between gap-3 rounded-t-md bg-brand-600 px-4 text-sm font-bold uppercase tracking-wider text-white"
            >
              <span className="inline-flex items-center gap-2">
                <LayoutGrid className="h-4 w-4" /> Browse Categories
              </span>
              <ChevronDown className={cn('h-4 w-4 transition', categoriesOpen && 'rotate-180')} />
            </button>
            {categoriesOpen && (
              <>
                <button
                  type="button"
                  aria-label="Close categories"
                  className="fixed inset-0 z-10 cursor-default"
                  onClick={() => setCategoriesOpen(false)}
                />
                <ul className="absolute left-0 top-full z-20 w-[260px] overflow-hidden rounded-b-md border border-ink-100 bg-white shadow-cardHover dark:border-ink-700 dark:bg-ink-900">
                  {CATEGORIES.map((category) => (
                    <li key={category}>
                      <Link
                        href={`/course?category=${encodeURIComponent(category)}`}
                        onClick={() => setCategoriesOpen(false)}
                        className="block border-b border-ink-100 px-4 py-2.5 text-sm text-ink-700 transition last:border-b-0 hover:bg-brand-50 hover:text-brand-700 dark:border-ink-700 dark:text-ink-100"
                      >
                        {category}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          {/* Main nav */}
          <ul className="ml-8 flex items-center gap-1 text-sm">
            {MAIN_MENU.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'relative inline-flex h-12 items-center px-4 font-semibold transition',
                      active
                        ? 'text-brand-600'
                        : 'text-ink-700 hover:text-brand-600 dark:text-ink-100',
                    )}
                  >
                    {item.label}
                    {active && (
                      <span className="absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-brand-600" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* ============================================================== */}
      {/* MOBILE PANEL                                                    */}
      {/* ============================================================== */}
      <div className={cn('md:hidden', mobileOpen ? 'block' : 'hidden')}>
        <div className="container space-y-4 py-4">
          <form
            onSubmit={onSearch}
            className="flex h-11 items-center overflow-hidden rounded-md border border-ink-100 dark:border-ink-700"
          >
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search courses..."
              className="h-full flex-1 px-3 text-sm focus:outline-none dark:bg-ink-900 dark:text-ink-100"
              aria-label="Search courses"
            />
            <button type="submit" className="h-full bg-brand-500 px-4 text-white">
              <Search className="h-4 w-4" />
            </button>
          </form>

          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/dashboard/wishlist"
              onClick={() => setMobileOpen(false)}
              className="relative inline-flex h-11 items-center justify-center gap-2 rounded-md border border-ink-100 text-sm text-ink-700 dark:border-ink-700 dark:text-ink-100"
            >
              <Heart className="h-4 w-4" /> Wishlist
              {wishlistCount > 0 && (
                <span className="rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">{wishlistCount}</span>
              )}
            </Link>
            <Link
              href="/dashboard/interested"
              onClick={() => setMobileOpen(false)}
              className="relative inline-flex h-11 items-center justify-center gap-2 rounded-md border border-ink-100 text-sm text-ink-700 dark:border-ink-700 dark:text-ink-100"
            >
              <BookmarkPlus className="h-4 w-4" /> Interested
              {cartCount > 0 && (
                <span className="rounded-full bg-brand-500 px-1.5 text-[10px] font-bold text-white">{cartCount}</span>
              )}
            </Link>
          </div>

          <ul className="space-y-1">
            {MAIN_MENU.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'block rounded-md px-3 py-2 text-sm font-semibold',
                    isActive(item.href)
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-700/30 dark:text-brand-200'
                      : 'text-ink-700 hover:bg-ink-100 dark:text-ink-100 dark:hover:bg-ink-700',
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <details className="rounded-md border border-ink-100 dark:border-ink-700">
            <summary className="cursor-pointer px-3 py-2 text-sm font-semibold text-ink-700 dark:text-ink-100">
              Browse categories
            </summary>
            <ul className="border-t border-ink-100 dark:border-ink-700">
              {CATEGORIES.map((category) => (
                <li key={category}>
                  <Link
                    href={`/course?category=${encodeURIComponent(category)}`}
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2 text-sm text-ink-700 hover:bg-brand-50 hover:text-brand-700 dark:text-ink-100"
                  >
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </details>

          <div className="border-t border-ink-100 pt-3 dark:border-ink-700">
            {isAuthenticated && user ? (
              <div className="space-y-2">
                <Link
                  href={dashboardPathForRole(user.role)}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-ink-700 hover:bg-ink-100 dark:text-ink-100 dark:hover:bg-ink-700"
                >
                  <LayoutDashboard className="h-4 w-4" /> Dashboard
                </Link>
                <Link
                  href="/dashboard/profile"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-ink-700 hover:bg-ink-100 dark:text-ink-100 dark:hover:bg-ink-700"
                >
                  <UserCircle className="h-4 w-4" /> Profile
                </Link>
                <Link
                  href="/dashboard/history"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-ink-700 hover:bg-ink-100 dark:text-ink-100 dark:hover:bg-ink-700"
                >
                  <History className="h-4 w-4" /> History
                </Link>
                <Link
                  href="/dashboard/support"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-ink-700 hover:bg-ink-100 dark:text-ink-100 dark:hover:bg-ink-700"
                >
                  <LifeBuoy className="h-4 w-4" /> Support center
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    void signOut();
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-semibold text-ink-700 hover:bg-ink-100 dark:text-ink-100 dark:hover:bg-ink-700"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex h-11 items-center justify-center gap-1 rounded-md border border-ink-100 text-sm font-semibold text-ink-700 dark:border-ink-700 dark:text-ink-100"
                >
                  <LogIn className="h-4 w-4" /> Sign in
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex h-11 items-center justify-center rounded-md bg-brand-500 text-sm font-semibold text-white"
                >
                  Get started
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-ink-100 pt-3 text-xs text-ink-500 dark:border-ink-700">
            <a href={`tel:${PHONE_TEL}`} className="inline-flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-brand-600" /> {PHONE_NUMBER}
            </a>
            <ThemeToggleButton tone="dark" />
            <a
              href={`https://wa.me/${WHATSAPP_LINK}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-brand-600"
            >
              <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};
