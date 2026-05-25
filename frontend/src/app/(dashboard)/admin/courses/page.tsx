import Link from 'next/link';
import Image from 'next/image';
import { Plus } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable, type DataTableColumn } from '@/components/common/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { requireSessionRole } from '@/services/session';
import { fetchCourses } from '@/services/courses';
import type { Course } from '@/types';
import { formatCurrency, formatDate } from '@/utils';
import { CourseRowActions } from './CourseRowActions';

export const dynamic = 'force-dynamic';

const CoursesPage = async () => {
  await requireSessionRole('staff', 'admin');
  const { courses, meta } = await fetchCourses({ limit: 100 });

  const columns: DataTableColumn<Course>[] = [
    {
      key: 'course',
      header: 'Course',
      render: (course) => (
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-16 overflow-hidden rounded-lg bg-ink-100">
            {course.thumbnail?.url && (
              <Image
                src={course.thumbnail.url}
                alt={course.title}
                fill
                sizes="64px"
                className="object-cover"
              />
            )}
          </div>
          <div>
            <p className="font-semibold text-ink-900">{course.title}</p>
            <p className="text-xs text-ink-500">{course.category}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'level',
      header: 'Level',
      render: (course) => <span className="capitalize text-ink-700">{course.level}</span>,
    },
    {
      key: 'price',
      header: 'Price',
      align: 'right',
      render: (course) => (
        <div className="text-right">
          {course.discountPrice && course.discountPrice < course.price ? (
            <>
              <span className="font-semibold text-ink-900">
                {formatCurrency(course.discountPrice)}
              </span>
              <span className="ml-2 text-xs text-ink-500 line-through">
                {formatCurrency(course.price)}
              </span>
            </>
          ) : (
            <span className="font-semibold text-ink-900">{formatCurrency(course.price)}</span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (course) => (
        <Badge tone={course.isPublished ? 'success' : 'warning'}>
          {course.isPublished ? 'Published' : 'Draft'}
        </Badge>
      ),
    },
    {
      key: 'updatedAt',
      header: 'Updated',
      align: 'right',
      render: (course) => (
        <span className="text-xs text-ink-500">{formatDate(course.updatedAt)}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (course) => (
        <CourseRowActions
          courseId={course.id}
          slug={course.slug}
          title={course.title}
          isPublished={course.isPublished}
        />
      ),
    },
  ];

  return (
    <DashboardLayout
      title="Course catalog"
      subtitle={`${meta?.total ?? courses.length} courses in your catalog.`}
      actions={
        <Link href="/course">
          <Button leftIcon={<Plus className="h-4 w-4" />}>New course</Button>
        </Link>
      }
    >
      <DataTable
        rows={courses}
        columns={columns}
        rowKey={(c) => c.id}
        emptyMessage="No courses yet. Run `npm run seed:courses` in the backend to load the starter catalog."
      />
    </DashboardLayout>
  );
};

export default CoursesPage;
