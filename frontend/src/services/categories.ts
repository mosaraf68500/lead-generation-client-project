/**
 * Category fetchers + admin mutations.
 *
 * The public storefront uses `fetchCategories()` to power filter sidebars;
 * the admin dashboard uses `createCategory`, `updateCategory`,
 * `setCategoryActive`, and `deleteCategory` for CRUD.
 */
import { api, ApiError } from '@/services/api';
import type { Category, PaginatedMeta } from '@/types';

export interface CategoriesQuery {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

interface ListResult {
  categories: Category[];
  meta?: PaginatedMeta;
}

const toQueryString = (q: CategoriesQuery): string => {
  const params = new URLSearchParams();
  Object.entries(q).forEach(([k, v]) => {
    if (v !== undefined && v !== '' && v !== null) params.set(k, String(v));
  });
  const qs = params.toString();
  return qs ? `?${qs}` : '';
};

export const fetchCategories = async (
  query: CategoriesQuery = {},
): Promise<ListResult> => {
  try {
    const { data, meta } = await api.get<Category[]>(
      `/categories${toQueryString({ limit: 200, ...query })}`,
      { tags: ['categories'] },
    );
    return { categories: data, meta: meta as unknown as PaginatedMeta | undefined };
  } catch (err) {
    if (err instanceof ApiError) return { categories: [] };
    throw err;
  }
};

export interface CategoryPayload {
  name: string;
  description?: string;
  iconKey?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export const createCategory = async (payload: CategoryPayload): Promise<Category> => {
  const { data } = await api.post<Category>('/categories', payload);
  return data;
};

export const updateCategory = async (
  id: string,
  payload: Partial<CategoryPayload>,
): Promise<Category> => {
  const { data } = await api.patch<Category>(`/categories/${id}`, payload);
  return data;
};

interface SetActiveResult {
  category: Category;
  cascadedCourses: number;
}

export const setCategoryActive = async (
  id: string,
  isActive: boolean,
): Promise<SetActiveResult> => {
  const { data } = await api.patch<SetActiveResult>(`/categories/${id}/active`, {
    isActive,
  });
  return data;
};

export const deleteCategory = async (id: string): Promise<void> => {
  await api.delete(`/categories/${id}`);
};
