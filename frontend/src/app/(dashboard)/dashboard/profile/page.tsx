/**
 * Shared /dashboard/profile page — available to every authenticated role.
 *
 * ShopBangla-inspired layout:
 *   1. Hero strip with breadcrumb (HOME > ACCOUNT) and "My Profile" headline
 *      where the accent word is brand-green.
 *   2. Two-column body inside the dashboard chrome:
 *        Left  — `ProfileForm` (avatar header + form fields + Save).
 *        Right — `QuickLinks` panel + outlined-red Log out button.
 */
import { History, BookmarkPlus, Heart, LifeBuoy, Inbox } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHero } from '@/components/common/PageHero';
import { QuickLinks } from '@/components/common/QuickLinks';
import { ProfileForm } from '@/components/common/ProfileForm';
import { requireSessionRole } from '@/services/session';
import type { QuickLinkItem } from '@/components/common/QuickLinks';

export const dynamic = 'force-dynamic';

const ProfilePage = async () => {
  const user = await requireSessionRole();

  // Personal area Quick-Links list. We swap "Order history" → "Application
  // history" because this is a lead-generation platform with no orders.
  const baseLinks: QuickLinkItem[] = [
    { label: 'Application history', href: '/dashboard/history', icon: History },
    { label: 'Interested courses', href: '/dashboard/interested', icon: BookmarkPlus },
    { label: 'Wishlist', href: '/dashboard/wishlist', icon: Heart },
    { label: 'Support center', href: '/dashboard/support', icon: LifeBuoy },
  ];

  // Privileged roles also see a shortcut to the inbox.
  const links: QuickLinkItem[] =
    user.role === 'staff' || user.role === 'admin' || user.role === 'super_admin'
      ? [{ label: 'Lead inbox', href: '/admin/leads', icon: Inbox }, ...baseLinks]
      : baseLinks;

  return (
    <DashboardLayout title="My profile" hideHeader>
      <PageHero
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Account' },
        ]}
        lead="My"
        accent="Profile"
        description="Manage your personal information and account settings."
      />

      <section className="px-4 py-10 sm:px-8">
        <div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[1.4fr_1fr]">
          <ProfileForm user={user} />
          <QuickLinks items={links} showLogout />
        </div>
      </section>
    </DashboardLayout>
  );
};

export default ProfilePage;
