'use client';

/**
 * Row-level actions for the admin course table.
 *
 * Lets admins / staff manage a course straight from the dashboard without
 * leaving the list:
 *   - View   → public detail page
 *   - Toggle publish/unpublish → POST /courses/:id/publish
 *   - Delete → DELETE /courses/:id   (admin role only on backend)
 *
 * After every successful action we call `router.refresh()` so the server
 * component above re-fetches the list and the UI stays in sync.
 */

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Trash2, ExternalLink, Loader2, Pencil } from 'lucide-react';
import { api, ApiError } from '@/services/api';
import { useToast } from '@/context/ToastContext';
import { cn } from '@/utils';

interface CourseRowActionsProps {
  courseId: string;
  slug: string;
  title: string;
  isPublished: boolean;
}

export const CourseRowActions = ({
  courseId,
  slug,
  title,
  isPublished,
}: CourseRowActionsProps) => {
  const router = useRouter();
  const { push } = useToast();
  const [isPending, startTransition] = useTransition();
  const [busyAction, setBusyAction] = useState<'publish' | 'delete' | null>(null);

  const refresh = () => startTransition(() => router.refresh());

  const handlePublishToggle = async () => {
    setBusyAction('publish');
    try {
      await api.post(`/courses/${courseId}/publish`, { isPublished: !isPublished });
      push({
        variant: 'success',
        title: isPublished ? 'Course unpublished' : 'Course published',
        description: title,
      });
      refresh();
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Could not update publish state.';
      push({ variant: 'error', title: 'Update failed', description: message });
    } finally {
      setBusyAction(null);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setBusyAction('delete');
    try {
      await api.delete(`/courses/${courseId}`);
      push({ variant: 'success', title: 'Course deleted', description: title });
      refresh();
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Could not delete the course.';
      push({ variant: 'error', title: 'Delete failed', description: message });
    } finally {
      setBusyAction(null);
    }
  };

  const isBusy = isPending || busyAction !== null;

  // Tiny shared icon-button style.
  const iconBtn = cn(
    'inline-flex h-8 w-8 items-center justify-center rounded-lg border border-ink-100 bg-white text-ink-500',
    'transition hover:border-brand-300 hover:text-brand-600',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'dark:border-ink-700 dark:bg-ink-900 dark:text-ink-100',
  );

  return (
    <div className="flex items-center justify-end gap-1.5">
      <Link
        href={`/course/${slug}`}
        target="_blank"
        rel="noopener noreferrer"
        className={iconBtn}
        title="View on site"
        aria-label="View on site"
      >
        <ExternalLink className="h-4 w-4" />
      </Link>

      <Link
        href={`/admin/courses/${slug}/edit`}
        className={iconBtn}
        title="Edit course"
        aria-label="Edit course"
      >
        <Pencil className="h-4 w-4" />
      </Link>

      <button
        type="button"
        className={cn(
          iconBtn,
          isPublished ? 'text-amber-600 hover:text-amber-700' : 'text-emerald-600 hover:text-emerald-700',
        )}
        onClick={handlePublishToggle}
        disabled={isBusy}
        title={isPublished ? 'Unpublish course' : 'Publish course'}
        aria-label={isPublished ? 'Unpublish course' : 'Publish course'}
      >
        {busyAction === 'publish' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isPublished ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </button>

      <button
        type="button"
        className={cn(iconBtn, 'text-red-600 hover:border-red-300 hover:text-red-700')}
        onClick={handleDelete}
        disabled={isBusy}
        title="Delete course"
        aria-label="Delete course"
      >
        {busyAction === 'delete' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
      </button>
    </div>
  );
};
