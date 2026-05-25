import { GraduationCap } from 'lucide-react';
import { CourseCard } from '@/components/common/CourseCard';
import { EmptyState } from '@/components/common/EmptyState';
import type { Course } from '@/types';

interface CourseGridProps {
  courses: Course[];
  emptyTitle?: string;
}

export const CourseGrid = ({ courses, emptyTitle = 'No courses match your filters' }: CourseGridProps) => {
  if (courses.length === 0) {
    return (
      <EmptyState
        icon={GraduationCap}
        title={emptyTitle}
        description="Try widening your filters or clearing your search."
      />
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
};
