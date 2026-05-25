import { api, ApiError } from '@/services/api';
import type { PaginatedMeta, User } from '@/types';

export interface UsersQuery {
  search?: string;
  role?: string;
  page?: number;
  limit?: number;
}

interface ListResult {
  users: User[];
  meta?: PaginatedMeta;
}

const toQueryString = (q: UsersQuery): string => {
  const params = new URLSearchParams();
  Object.entries(q).forEach(([k, v]) => {
    if (v !== undefined && v !== '' && v !== null) params.set(k, String(v));
  });
  const qs = params.toString();
  return qs ? `?${qs}` : '';
};

export const fetchUsers = async (query: UsersQuery = {}): Promise<ListResult> => {
  try {
    const { data, meta } = await api.get<User[]>(`/users${toQueryString(query)}`, {
      tags: ['users'],
    });
    return { users: data, meta: meta as unknown as PaginatedMeta | undefined };
  } catch (err) {
    if (err instanceof ApiError) return { users: [] };
    throw err;
  }
};

export const fetchMe = async (): Promise<User | null> => {
  try {
    const { data } = await api.get<User>('/users/me');
    return data;
  } catch (err) {
    if (err instanceof ApiError) return null;
    throw err;
  }
};
