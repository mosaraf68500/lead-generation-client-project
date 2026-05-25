'use client';

/**
 * End-to-end Category CRUD UI. Renders a side-by-side layout:
 *   - Left rail: form for create / edit (sticky on desktop).
 *   - Right column: searchable table with toggle / delete actions.
 *
 * Every mutation is optimistic-friendly: after a successful API call we
 * call `router.refresh()` so the server-fetched data + course counts stay
 * in lockstep with reality (especially important after a cascade where
 * deactivating a category unpublishes its courses).
 */

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Pencil,
  Plus,
  Save,
  Search,
  Trash2,
  Power,
  PowerOff,
  X,
} from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { FormField } from '@/components/common/FormField';
import { useToast } from '@/context/ToastContext';
import {
  createCategory,
  updateCategory,
  setCategoryActive,
  deleteCategory,
  type CategoryPayload,
} from '@/services/categories';
import { ApiError } from '@/services/api';
import type { Category } from '@/types';

const schema = z.object({
  name: z.string().trim().min(2, 'Name is too short').max(80),
  description: z.string().trim().max(280).optional().or(z.literal('')),
  iconKey: z.string().trim().max(40).optional().or(z.literal('')),
  sortOrder: z.coerce.number().int().optional(),
});

type FormValues = z.infer<typeof schema>;

export interface CategoryManagerProps {
  categories: Category[];
}

export const CategoryManager = ({ categories }: CategoryManagerProps) => {
  const router = useRouter();
  const { push } = useToast();
  const [, startTransition] = useTransition();
  const [editing, setEditing] = useState<Category | null>(null);
  const [search, setSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '', iconKey: '', sortOrder: 0 },
  });

  const startEdit = (cat: Category) => {
    setEditing(cat);
    reset({
      name: cat.name,
      description: cat.description ?? '',
      iconKey: cat.iconKey ?? '',
      sortOrder: cat.sortOrder ?? 0,
    });
  };

  const startNew = () => {
    setEditing(null);
    reset({ name: '', description: '', iconKey: '', sortOrder: categories.length });
  };

  const onSubmit = handleSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      const payload: CategoryPayload = {
        name: values.name.trim(),
        description: values.description?.trim() || undefined,
        iconKey: values.iconKey?.trim() || undefined,
        sortOrder: values.sortOrder,
      };
      if (editing) {
        await updateCategory(editing.id, payload);
        push({
          variant: 'success',
          title: 'Category updated',
          description: payload.name,
        });
      } else {
        await createCategory(payload);
        push({
          variant: 'success',
          title: 'Category created',
          description: payload.name,
        });
      }
      setEditing(null);
      reset({ name: '', description: '', iconKey: '', sortOrder: 0 });
      startTransition(() => router.refresh());
    } catch (err) {
      push({
        variant: 'error',
        title: editing ? 'Update failed' : 'Create failed',
        description: err instanceof ApiError ? err.message : 'Unknown error',
      });
    } finally {
      setIsSubmitting(false);
    }
  });

  const onToggle = async (cat: Category) => {
    setBusyId(cat.id);
    try {
      const result = await setCategoryActive(cat.id, !cat.isActive);
      push({
        variant: cat.isActive ? 'warning' : 'success',
        title: cat.isActive ? 'Category deactivated' : 'Category activated',
        description:
          cat.isActive && result.cascadedCourses > 0
            ? `${result.cascadedCourses} course(s) auto-unpublished.`
            : cat.name,
      });
      startTransition(() => router.refresh());
    } catch (err) {
      push({
        variant: 'error',
        title: 'Status update failed',
        description: err instanceof ApiError ? err.message : 'Unknown error',
      });
    } finally {
      setBusyId(null);
    }
  };

  const onDelete = async (cat: Category) => {
    if (!window.confirm(`Delete "${cat.name}" permanently? This cannot be undone.`)) {
      return;
    }
    setBusyId(cat.id);
    try {
      await deleteCategory(cat.id);
      push({
        variant: 'success',
        title: 'Category deleted',
        description: cat.name,
      });
      startTransition(() => router.refresh());
    } catch (err) {
      push({
        variant: 'error',
        title: 'Delete failed',
        description: err instanceof ApiError ? err.message : 'Unknown error',
      });
    } finally {
      setBusyId(null);
    }
  };

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return categories;
    return categories.filter((c) =>
      [c.name, c.description, c.iconKey].some((f) =>
        (f ?? '').toLowerCase().includes(term),
      ),
    );
  }, [categories, search]);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* ── Form rail ──────────────────────────────────────────── */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-2xl border border-ink-100 bg-white p-5 dark:border-ink-700 dark:bg-ink-900">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-ink-900 dark:text-ink-100">
              {editing ? 'Edit category' : 'New category'}
            </h2>
            {editing && (
              <button
                type="button"
                onClick={startNew}
                className="inline-flex items-center gap-1 text-xs font-semibold text-ink-500 hover:text-brand-700"
              >
                <X className="h-3.5 w-3.5" /> Cancel
              </button>
            )}
          </div>
          <form onSubmit={onSubmit} className="mt-4 space-y-4">
            <FormField label="Name" htmlFor="name" required error={errors.name?.message}>
              <Input
                id="name"
                placeholder="e.g. AI & Machine Learning"
                hasError={Boolean(errors.name)}
                {...register('name')}
              />
            </FormField>
            <FormField
              label="Description"
              htmlFor="description"
              error={errors.description?.message}
              hint="Short blurb used on the catalog filter sidebar."
            >
              <Textarea
                id="description"
                rows={3}
                placeholder="What kind of courses live in this category?"
                {...register('description')}
              />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Icon key" htmlFor="iconKey" hint="Optional · e.g. cpu">
                <Input id="iconKey" placeholder="cpu" {...register('iconKey')} />
              </FormField>
              <FormField label="Sort order" htmlFor="sortOrder" hint="Lower = earlier">
                <Input
                  id="sortOrder"
                  type="number"
                  min={0}
                  {...register('sortOrder')}
                />
              </FormField>
            </div>
            <Button
              type="submit"
              isLoading={isSubmitting}
              leftIcon={editing ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              className="w-full"
            >
              {editing ? 'Save changes' : 'Create category'}
            </Button>
          </form>
        </div>

        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50/60 p-4 text-xs text-amber-900 dark:border-amber-900/30 dark:bg-amber-900/10 dark:text-amber-200">
          <p className="font-semibold">Heads up</p>
          <p className="mt-1">
            Deactivating a category automatically unpublishes every course assigned
            to it. Reactivating doesn&apos;t republish those courses — review them
            individually first.
          </p>
        </div>
      </aside>

      {/* ── Table ──────────────────────────────────────────────── */}
      <section className="lg:col-span-2">
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter categories…"
              className="pl-9"
            />
          </div>
          <p className="text-xs text-ink-500">{filtered.length} of {categories.length} shown</p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white dark:border-ink-700 dark:bg-ink-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-ink-100 bg-surface-muted/60 text-[10px] font-bold uppercase tracking-wider text-ink-500 dark:border-ink-700 dark:bg-ink-700/30">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Courses</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Sort</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100 dark:divide-ink-700">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-ink-500">
                      No categories match your search.
                    </td>
                  </tr>
                ) : (
                  filtered.map((cat) => (
                    <tr key={cat.id} className="hover:bg-surface-muted/40 dark:hover:bg-ink-700/20">
                      <td className="px-4 py-3 align-top">
                        <p className="font-semibold text-ink-900 dark:text-ink-100">{cat.name}</p>
                        {cat.description && (
                          <p className="mt-0.5 text-xs text-ink-500 line-clamp-2">{cat.description}</p>
                        )}
                        <p className="mt-1 font-mono text-[10px] text-ink-400">/{cat.slug}</p>
                      </td>
                      <td className="px-4 py-3 align-top text-xs text-ink-500">
                        <p className="font-semibold text-ink-900 dark:text-ink-100">
                          {cat.courseCount ?? 0}
                        </p>
                        <p>{cat.publishedCount ?? 0} published</p>
                      </td>
                      <td className="px-4 py-3 align-top">
                        {cat.isActive ? (
                          <Badge tone="success">Active</Badge>
                        ) : (
                          <Badge tone="danger">Inactive</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 align-top text-xs text-ink-500">
                        {cat.sortOrder ?? 0}
                      </td>
                      <td className="px-4 py-3 text-right align-top">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => startEdit(cat)}
                            className="inline-flex h-8 items-center gap-1 rounded-md border border-ink-100 px-2 text-xs font-semibold text-ink-700 transition hover:border-brand-300 hover:text-brand-700 dark:border-ink-700 dark:text-ink-100"
                          >
                            <Pencil className="h-3.5 w-3.5" /> Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => void onToggle(cat)}
                            disabled={busyId === cat.id}
                            className={
                              cat.isActive
                                ? 'inline-flex h-8 items-center gap-1 rounded-md border border-amber-200 px-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-50 disabled:opacity-50'
                                : 'inline-flex h-8 items-center gap-1 rounded-md border border-emerald-200 px-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-50'
                            }
                          >
                            {cat.isActive ? (
                              <>
                                <PowerOff className="h-3.5 w-3.5" /> Deactivate
                              </>
                            ) : (
                              <>
                                <Power className="h-3.5 w-3.5" /> Activate
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => void onDelete(cat)}
                            disabled={busyId === cat.id || (cat.courseCount ?? 0) > 0}
                            title={
                              (cat.courseCount ?? 0) > 0
                                ? 'Reassign / delete its courses first.'
                                : 'Delete category'
                            }
                            className="inline-flex h-8 items-center gap-1 rounded-md border border-red-200 px-2 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-40"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};
