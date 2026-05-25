import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { requireSessionRole } from '@/services/session';
import { AnalyticsClient } from './AnalyticsClient';

export const dynamic = 'force-dynamic';

const AnalyticsPage = async () => {
  await requireSessionRole('admin');

  return (
    <DashboardLayout
      title="Analytics"
      overview="Live performance"
      subtitle="Lead pipeline, source attribution, and catalog performance — auto-refreshing every minute."
    >
      <AnalyticsClient />
    </DashboardLayout>
  );
};

export default AnalyticsPage;
