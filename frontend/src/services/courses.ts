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
