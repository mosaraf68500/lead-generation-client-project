/**
 * Shared /dashboard/wishlist page.
 *
 * The wishlist data lives in client-side context (localStorage), so the
 * server page only handles the session/role gate and renders a client
 * component for the actual list.
 */
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { WishlistGrid } from '@/components/common/WishlistGrid';
import { requireSessionRole } from '@/services/session';

export const dynamic = 'force-dynamic';

const WishlistPage = async () => {
  await requireSessionRole();

  return (
    <DashboardLayout
      title="My wishlist"
      subtitle="Courses you've saved for later. Add or remove items by tapping the heart on any course card."
      contained
    >
      <WishlistGrid />
    </DashboardLayout>
  );
};

export default WishlistPage;
