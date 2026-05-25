'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, ApiError, type ApiResult } from '@/services/api';

type Method = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

export interface UseFetchOptions<TBody = unknown> {
  /** HTTP method. Defaults to GET. */
  method?: Method;
  /** Request body (ignored for GET). */
  body?: TBody;
  /** Whether to call the endpoint automatically on mount + when the URL changes. */
  immediate?: boolean;
  /** Optional dependency list that forces a refetch when any value changes. */
  deps?: unknown[];
}

export interface UseFetchResult<T> {
  data: T | null;
  meta: ApiResult<T>['meta'];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<T | null>;
  /** Imperatively trigger the request (useful for non-GET methods). */
  execute: (overrides?: { body?: unknown }) => Promise<T | null>;
}

/**
 * Generic typed fetch hook built on top of `services/api`. Use for one-off
 * client-side requests that need loading/error state, optimistic refetch and
 * a stable `execute` for mutations.
 *
 * Most read-heavy code should still use Server Components + the service
 * fetchers in `services/courses.ts`, etc. Reach for this hook from inside
 * client components only.
 */
export const useFetch = <T,>(path: string | null, options: UseFetchOptions = {}): UseFetchResult<T> => {
  const { method = 'GET', body, immediate = true, deps = [] } = options;

  const [data, setData] = useState<T | null>(null);
  const [meta, setMeta] = useState<ApiResult<T>['meta']>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (overrides?: { body?: unknown }): Promise<T | null> => {
      if (!path) return null;
      setIsLoading(true);
      setError(null);
      try {
        const requestBody = overrides?.body ?? body;
        let result: ApiResult<T>;
        switch (method) {
          case 'POST':
            result = await api.post<T>(path, requestBody);
            break;
          case 'PATCH':
            result = await api.patch<T>(path, requestBody);
            break;
          case 'PUT':
            result = await api.put<T>(path, requestBody);
            break;
          case 'DELETE':
            result = await api.delete<T>(path);
            break;
          default:
            result = await api.get<T>(path);
        }
        setData(result.data);
        setMeta(result.meta);
        return result.data;
      } catch (err) {
        const message = err instanceof ApiError ? err.message : 'Request failed';
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [path, method, JSON.stringify(body), ...deps],
  );

  useEffect(() => {
    if (immediate && method === 'GET') void execute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, immediate, method, ...deps]);

  return { data, meta, isLoading, error, refetch: () => execute(), execute };
};
