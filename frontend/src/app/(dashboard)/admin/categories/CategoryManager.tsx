'use client';

/**
 * End-to-end Category CRUD UI.
 *
 * Layout: a full-width table with a search box on the left and an
 * "Add new category" button on the right. The create/edit form lives
 * INSIDE a modal — opened by the toolbar button (for fresh records) or
 * by a row's Edit button (which pre-fills the same modal).
 *
 * Every mutation calls `router.refresh()` so the server-fetched data
 * (including course counts and the cascading-unpublish effect when a
 * category is deactivated) stays in lock-step with the UI.
 */

import { useEffect, useMemo, useState, useTransition } from 'react';
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

  // The form / modal share one piece of state: the category being edited.
  // `null` + open=true → create mode. A category + open=true → edit mode.
  const [editing, setEditing] = useState<Category | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [search, setSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  // ── Modal openers ─────────────────────────────────────────────────
  const openCreateModal = () => {
    setEditing(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditing(cat);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    // Clearing `editing` after the close animation prevents the modal from
    // briefly flashing with the previous category's values on the next open.
    setEditing(null);
  };

  // ── Search filter ─────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return categories;
    return categories.filter((c) =>
      [c.name, c.description, c.iconKey].some((f) =>
        (f ?? '').toLowerCase().includes(term),
      ),
    );
  }, [categories, search]);

  // ── Row actions ───────────────────────────────────────────────────
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

  // ── Modal submit handler — passed down so the modal owns its form ──
  const handleSaved = async (payload: CategoryPayload, isEdit: boolean) => {
    setIsSubmitting(true);
    try {
      if (isEdit && editing) {
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
      closeModal();
      startTransition(() => router.refresh());
    } catch (err) {
      push({
        variant: 'error',
        title: isEdit ? 'Update failed' : 'Create failed',
        description: err instanceof ApiError ? err.message : 'Unknown error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* ── Toolbar: search (left) + Add new category (right) ──────── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter categories…"
            className="pl-9"
          />
        </div>
        <p className="text-xs text-ink-500">
          {filtered.length} of {categories.length} shown
        </p>
        <Button
          type="button"
          onClick={openCreateModal}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Add new category
        </Button>
      </div>

      {/* ── Heads-up callout about the cascading deactivation ─────── */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 text-xs text-amber-900 dark:border-amber-900/30 dark:bg-amber-900/10 dark:text-amber-200">
        <p className="font-semibold">Heads up</p>
        <p className="mt-1">
          Deactivating a category automatically unpublishes every course assigned
          to it. Reactivating doesn&apos;t republish those courses — review them
          individually first.
        </p>
      </div>

      {/* ── Table ──────────────────────────────────────────────────── */}
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
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-ink-500">
                    {categories.length === 0 ? (
                      <>
                        No categories yet.{' '}
                        <button
                          type="button"
                          onClick={openCreateModal}
                          className="font-semibold text-brand-700 hover:underline"
                        >
                          Add your first category &rarr;
                        </button>
                      </>
                    ) : (
                      'No categories match your search.'
                    )}
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
                          onClick={() => openEditModal(cat)}
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

      {/* ── Create / edit modal ──────────────────────────────────── */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={closeModal}
        editing={editing}
        isSubmitting={isSubmitting}
        onSubmit={handleSaved}
        nextSortOrder={categories.length}
      />
    </div>
  );
};

// ---------------------------------------------------------------------
// Modal — kept in this file because it shares the schema + props above
// and isn't reused elsewhere.
// ---------------------------------------------------------------------

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  editing: Category | null;
  isSubmitting: boolean;
  onSubmit: (payload: CategoryPayload, isEdit: boolean) => Promise<void> | void;
  /** Suggested sortOrder for a brand-new entry (length of current list). */
  nextSortOrder: number;
}

const CategoryModal = ({
  isOpen,
  onClose,
  editing,
  isSubmitting,
  onSubmit,
  nextSortOrder,
}: CategoryModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '', iconKey: '', sortOrder: 0 },
  });

  // Whenever the modal is (re-)opened, sync the form with either the
  // category being edited or the "new entry" defaults. Resetting via
  // `useEffect` makes the modal feel instant from the user's POV.
  useEffect(() => {
    if (!isOpen) return;
    if (editing) {
      reset({
        name: editing.name,
        description: editing.description ?? '',
        iconKey: editing.iconKey ?? '',
        sortOrder: editing.sortOrder ?? 0,
      });
    } else {
      reset({ name: '', description: '', iconKey: '', sortOrder: nextSortOrder });
    }
  }, [isOpen, editing, nextSortOrder, reset]);

  // Esc to close — common a11y expectation for modals.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isEdit = Boolean(editing);

  const submit = handleSubmit(async (values) => {
    const payload: CategoryPayload = {
      name: values.name.trim(),
      description: values.description?.trim() || undefined,
      iconKey: values.iconKey?.trim() || undefined,
      sortOrder: values.sortOrder,
    };
    await onSubmit(payload, isEdit);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      {/* Click-outside backdrop */}
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-ink-900/40"
      />

      {/* Modal panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="category-modal-title"
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-ink-100 bg-white dark:border-ink-700 dark:bg-ink-900"
      >
        {/* Header */}
        <header className="flex items-start justify-between border-b border-ink-100 px-5 py-4 dark:border-ink-700">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">
              {isEdit ? 'Edit existing record' : 'Course taxonomy'}
            </p>
            <h2
              id="category-modal-title"
              className="mt-0.5 text-lg font-bold text-ink-900 dark:text-ink-100"
            >
              {isEdit ? 'Edit category' : 'Add new category'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-ink-100 text-ink-500 transition hover:text-ink-700 dark:border-ink-700"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        {/* Body / form */}
        <form onSubmit={submit} className="space-y-4 px-5 py-5">
          <FormField label="Name" htmlFor="modal-name" required error={errors.name?.message}>
            <Input
              id="modal-name"
              placeholder="e.g. AI & Machine Learning"
              hasError={Boolean(errors.name)}
              autoFocus
              {...register('name')}
            />
          </FormField>
          <FormField
            label="Description"
            htmlFor="modal-description"
            error={errors.description?.message}
            hint="Short blurb used on the catalog filter sidebar."
          >
            <Textarea
              id="modal-description"
              rows={3}
              placeholder="What kind of courses live in this category?"
              {...register('description')}
            />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Icon key" htmlFor="modal-iconKey" hint="Optional · e.g. cpu">
              <Input id="modal-iconKey" placeholder="cpu" {...register('iconKey')} />
            </FormField>
            <FormField label="Sort order" htmlFor="modal-sortOrder" hint="Lower = earlier">
              <Input
                id="modal-sortOrder"
                type="number"
                min={0}
                {...register('sortOrder')}
              />
            </FormField>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-2 border-t border-ink-100 pt-4 dark:border-ink-700">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              leftIcon={isEdit ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            >
              {isEdit ? 'Save changes' : 'Create category'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
