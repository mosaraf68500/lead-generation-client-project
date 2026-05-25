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
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHero } from '@/components/common/PageHero';
import { QuickLinks, type QuickLinkItem } from '@/components/common/QuickLinks';
import { ProfileForm } from '@/components/common/ProfileForm';
import { requireSessionRole } from '@/services/session';

export const dynamic = 'force-dynamic';

const ProfilePage = async () => {
  const user = await requireSessionRole();

  // NOTE: we pass icons as STRING keys (not the component itself) because
  // `QuickLinks` is a Client Component — Next.js cannot serialise Lucide
  // icon function components across the server/client boundary.
  const baseLinks: QuickLinkItem[] = [
    { label: 'Application history', href: '/dashboard/history', iconName: 'history' },
    { label: 'Interested courses', href: '/dashboard/interested', iconName: 'interested' },
    { label: 'Wishlist', href: '/dashboard/wishlist', iconName: 'wishlist' },
    { label: 'Support center', href: '/dashboard/support', iconName: 'support' },
  ];

  // Privileged roles also see a shortcut to the inbox.
  const links: QuickLinkItem[] =
    user.role === 'staff' || user.role === 'admin' || user.role === 'super_admin'
      ? [{ label: 'Lead inbox', href: '/admin/leads', iconName: 'inbox' }, ...baseLinks]
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
