import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CourseForm } from '@/components/common/CourseForm';
import { requireSessionRole } from '@/services/session';
import { fetchAssignableUsers } from '@/services/leads';
import { fetchCategories } from '@/services/categories';

export const dynamic = 'force-dynamic';

/**
 * Admin / super-admin only — "Create new course" page.
 * Staff is blocked at the session level (per the RBAC matrix).
 */
const NewCoursePage = async () => {
  const user = await requireSessionRole('admin');
  const [instructors, { categories }] = await Promise.all([
    fetchAssignableUsers(),
    fetchCategories({ limit: 200 }),
  ]);

  return (
    <DashboardLayout
      title="Create a new course"
      subtitle="Fill in the basics — you can come back any time and edit the rest."
    >
      <CourseForm
        instructors={instructors}
        defaultInstructorId={user.id}
        categories={categories}
      />
    </DashboardLayout>
  );
};

export default NewCoursePage;
