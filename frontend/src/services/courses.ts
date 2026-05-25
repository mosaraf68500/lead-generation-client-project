/**
 * Course fetchers. Designed to be called from Server Components. Each one
 * gracefully degrades to an empty result on backend errors so a cold-start
 * never crashes a page render.
 */
import { api, ApiError } from '@/services/api';
import type { Course, PaginatedMeta } from '@/types';

export interface CoursesQuery {
  search?: string;
  category?: string;
  level?: string;
  page?: number;
  limit?: number;
  isPublished?: boolean;
}

interface ListResult {
  courses: Course[];
  meta?: PaginatedMeta;
}

const toQueryString = (q: CoursesQuery): string => {
  const params = new URLSearchParams();
  Object.entries(q).forEach(([k, v]) => {
    if (v !== undefined && v !== '' && v !== null) params.set(k, String(v));
  });
  const qs = params.toString();
  return qs ? `?${qs}` : '';
};

export const fetchCourses = async (query: CoursesQuery = {}): Promise<ListResult> => {
  try {
    const { data, meta } = await api.get<Course[]>(`/courses${toQueryString(query)}`, {
      tags: ['courses'],
    });
    return { courses: data, meta: meta as unknown as PaginatedMeta | undefined };
  } catch (err) {
    if (err instanceof ApiError) return { courses: [] };
    throw err;
  }
};

export const fetchCourseBySlug = async (slug: string): Promise<Course | null> => {
  try {
    const { data } = await api.get<Course>(`/courses/${slug}`, { tags: [`course:${slug}`] });
    return data;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
};

// --- Mutations -----------------------------------------------------------

/**
 * Create a new course. `formData` MUST include a `thumbnail` File entry
 * because the backend rejects creation without one. Returns the created
 * course on success.
 */
export const createCourse = async (formData: FormData): Promise<Course> => {
  const { data } = await api.post<Course>('/courses', formData);
  return data;
};

/**
 * Update an existing course. `formData` may include a fresh `thumbnail`
 * File entry (Cloudinary will replace the old image) — omit it to keep the
 * existing thumbnail unchanged.
 */
export const updateCourse = async (
  id: string,
  formData: FormData,
): Promise<Course> => {
  const { data } = await api.patch<Course>(`/courses/${id}`, formData);
  return data;
};

export interface CourseAnalytics {
  total: number;
  published: number;
  drafts: number;
  onSale: number;
  totalEnrollments: number;
  avgRating: number;
  byCategory: Array<{ category: string; count: number }>;
  topCourses: Array<{
    id: string;
    title: string;
    slug: string;
    enrollmentsCount: number;
    ratingAvg: number;
  }>;
}

export const fetchCourseAnalytics = async (): Promise<CourseAnalytics | null> => {
  try {
    const { data } = await api.get<CourseAnalytics>('/courses/analytics/summary');
    return data;
  } catch (err) {
    if (err instanceof ApiError) return null;
    throw err;
  }
};
