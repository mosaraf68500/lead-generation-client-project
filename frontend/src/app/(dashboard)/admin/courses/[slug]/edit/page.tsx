import { notFound } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CourseForm } from '@/components/common/CourseForm';
import { requireSessionRole } from '@/services/session';
import { fetchCourseBySlug } from '@/services/courses';
import { fetchAssignableUsers } from '@/services/leads';
import { fetchCategories } from '@/services/categories';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { slug: string };
}

/**
 * Admin / super-admin only — edit an existing course.
 * The course is loaded by slug because that's the only public-by-key
 * endpoint on the backend; the id (used for PATCH) is read from the
 * loaded course document.
 */
const EditCoursePage = async ({ params }: PageProps) => {
  const user = await requireSessionRole('admin');
  const [course, instructors, { categories }] = await Promise.all([
    fetchCourseBySlug(params.slug),
    fetchAssignableUsers(),
    fetchCategories({ limit: 200 }),
  ]);

  if (!course) notFound();

  return (
    <DashboardLayout
      title={`Edit · ${course.title}`}
      subtitle="Update content, pricing, or publish state. Changes go live as soon as you save."
    >
      <CourseForm
        course={course}
        instructors={instructors}
        defaultInstructorId={user.id}
        categories={categories}
      />
    </DashboardLayout>
  );
};

export default EditCoursePage;
