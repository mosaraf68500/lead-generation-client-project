import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { requireSessionRole } from '@/services/session';
import { ThemeStudio } from './ThemeStudio';

export const dynamic = 'force-dynamic';

const ThemePage = async () => {
  await requireSessionRole('super_admin');

  return (
    <DashboardLayout
      title="Theme studio"
      subtitle="Preview the design tokens used across the platform — and flip light/dark instantly."
    >
      <ThemeStudio />
    </DashboardLayout>
  );
};

export default ThemePage;
