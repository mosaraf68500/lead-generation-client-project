/**
 * Shared "Interested" page — the lead-bucket replacement for the old cart.
 *
 * Both authenticated and anonymous-but-browsing users land here from the
 * Navbar bookmark icon. The list itself is hydrated from CartContext
 * (localStorage), and "Proceed" pops the global LeadCaptureModal.
 */
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { InterestedList } from '@/components/common/InterestedList';

export const dynamic = 'force-dynamic';

const InterestedPage = () => {
  return (
    <DashboardLayout
      title="Interested courses"
      subtitle="A stash of courses you're curious about. When you're ready, hit Proceed and our advisors will help you enrol — no upfront payment required."
      contained
    >
      <InterestedList />
    </DashboardLayout>
  );
};

export default InterestedPage;
