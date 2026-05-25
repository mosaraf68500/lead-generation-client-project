'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, ApiError } from '@/services/api';
import type { Course, PaginatedMeta } from '@/types';

export interface UseCoursesOptions {
  search?: string;
  category?: string;
  level?: string;
  page?: number;
  limit?: number;
  isPublished?: boolean;
}

interface UseCoursesResult {
  courses: Course[];
  meta?: PaginatedMeta;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const buildQs = (options: UseCoursesOptions): string => {
  const params = new URLSearchParams();
  Object.entries(options).forEach(([k, v]) => {
    if (v !== undefined && v !== '' && v !== null) params.set(k, String(v));
  });
  const qs = params.toString();
  return qs ? `?${qs}` : '';
};

/**
 * Lightweight client-side course fetcher. Most pages use Server Components
 * to fetch courses; this hook is reserved for purely interactive flows
 * (admin search bars, role assignment, etc.).
 */
export const useCourses = (options: UseCoursesOptions = {}): UseCoursesResult => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [meta, setMeta] = useState<PaginatedMeta | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, meta: nextMeta } = await api.get<Course[]>(`/courses${buildQs(options)}`);
      setCourses(data);
      setMeta(nextMeta as unknown as PaginatedMeta | undefined);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load courses');
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { courses, meta, isLoading, error, refetch };
};
