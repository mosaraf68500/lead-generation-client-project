'use client';

/**
 * Shared course CRUD form used by both:
 *   - /admin/courses/new            (create)
 *   - /admin/courses/[slug]/edit    (edit)
 *
 * Submits multipart/form-data because the backend stores the thumbnail on
 * Cloudinary via `upload.single('thumbnail')`. All other fields tag along
 * as regular form values; arrays (tags) are appended multiple times so
 * multer/Express materialises them as `string[]` on the server.
 */

import { useState, type FormEvent } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ImagePlus, Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/common/FormField';
import { useToast } from '@/context/ToastContext';
import { createCourse, updateCourse } from '@/services/courses';
import { ApiError } from '@/services/api';
import {
  COURSE_LEVELS,
  type Category,
  type Course,
  type CourseLevel,
  type LeadAssignee,
} from '@/types';

const schema = z.object({
  title: z.string().trim().min(3, 'Title is too short').max(160),
  shortDescription: z
    .string()
    .trim()
    .min(10, 'At least 10 characters')
    .max(280, 'Keep it under 280 characters'),
  description: z.string().trim().min(20, 'Add at least 20 characters'),
  category: z.string().trim().min(2, 'Choose a category'),
  level: z.enum(COURSE_LEVELS),
  price: z.coerce.number().min(0, 'Cannot be negative'),
  discountPrice: z
    .union([z.literal(''), z.coerce.number().min(0)])
    .optional(),
  durationHours: z.coerce.number().min(0, 'Cannot be negative'),
  instructor: z.string().min(8, 'Pick an instructor'),
  tags: z.string().optional(),
  isPublished: z.boolean().default(false),
});

type CourseFormValues = z.infer<typeof schema>;

export interface CourseFormProps {
  /** When supplied, the form runs in edit mode and PATCHes to /courses/:id. */
  course?: Pick<
    Course,
    | 'id'
    | 'title'
    | 'shortDescription'
    | 'description'
    | 'category'
    | 'level'
    | 'price'
    | 'discountPrice'
    | 'durationHours'
    | 'tags'
    | 'isPublished'
    | 'thumbnail'
  > & {
    instructor: Course['instructor'];
  };
  /**
   * Pre-loaded list of staff/admin/super-admin users — used to populate the
   * instructor picker. We rely on the lead-assignee fetcher (admin-only) so
   * it'll be present on every admin page that mounts this form.
   */
  instructors: LeadAssignee[];
  /** Logged-in user — used as the default instructor in create mode. */
  defaultInstructorId?: string;
  /**
   * Categories surfaced as a `<select>` populated from the Category
   * collection. Falls back to a free-text input when the list is empty.
   */
  categories: Category[];
}

const resolveInstructorId = (
  raw: Course['instructor'] | undefined,
): string | undefined => {
  if (!raw) return undefined;
  if (typeof raw === 'string') return raw;
  return raw.id;
};

export const CourseForm = ({
  course,
  instructors,
  defaultInstructorId,
  categories,
}: CourseFormProps) => {
  const router = useRouter();
  const { push } = useToast();
  const isEdit = Boolean(course);

  // Local UI state for the thumbnail picker — `File` can't live in RHF's
  // values cleanly so we keep it separate.
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
    course?.thumbnail?.url ?? null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CourseFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: course?.title ?? '',
      shortDescription: course?.shortDescription ?? '',
      description: course?.description ?? '',
      category: course?.category ?? '',
      level: (course?.level as CourseLevel) ?? 'beginner',
      price: course?.price ?? 0,
      discountPrice: course?.discountPrice ?? undefined,
      durationHours: course?.durationHours ?? 0,
      instructor:
        resolveInstructorId(course?.instructor) ?? defaultInstructorId ?? '',
      tags: (course?.tags ?? []).join(', '),
      isPublished: course?.isPublished ?? false,
    },
  });

  const onPickThumbnail = (e: FormEvent<HTMLInputElement>) => {
    const file = (e.currentTarget.files ?? [])[0];
    if (!file) return;
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const buildFormData = (values: CourseFormValues): FormData => {
    const fd = new FormData();
    fd.append('title', values.title.trim());
    fd.append('shortDescription', values.shortDescription.trim());
    fd.append('description', values.description.trim());
    fd.append('category', values.category.trim());
    fd.append('level', values.level);
    fd.append('price', String(values.price));
    if (values.discountPrice !== '' && values.discountPrice !== undefined) {
      fd.append('discountPrice', String(values.discountPrice));
    }
    fd.append('durationHours', String(values.durationHours));
    fd.append('instructor', values.instructor);
    fd.append('isPublished', values.isPublished ? 'true' : 'false');

    // tags = comma-separated input → append each tag as its own form-data
    // entry so the backend sees `req.body.tags` as `string[]`.
    (values.tags ?? '')
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
      .forEach((tag) => fd.append('tags', tag));

    if (thumbnailFile) {
      fd.append('thumbnail', thumbnailFile);
    }
    return fd;
  };

  const onSubmit = handleSubmit(async (values) => {
    if (!isEdit && !thumbnailFile) {
      push({
        variant: 'error',
        title: 'Thumbnail required',
        description: 'Please pick a course thumbnail before saving.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const fd = buildFormData(values);
      if (isEdit && course) {
        await updateCourse(course.id, fd);
        push({
          variant: 'success',
          title: 'Course updated',
          description: values.title,
        });
      } else {
        await createCourse(fd);
        push({
          variant: 'success',
          title: 'Course created',
          description: values.title,
        });
      }
      router.push('/admin/courses');
      router.refresh();
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Something went wrong';
      push({
        variant: 'error',
        title: isEdit ? 'Update failed' : 'Create failed',
        description: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/admin/courses"
          className="inline-flex items-center gap-1 text-xs font-semibold text-ink-500 hover:text-brand-700"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to courses
        </Link>
        <p className="text-xs text-ink-500">
          {isEdit ? 'Editing course' : 'Creating new course'}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ── Main column ───────────────────────────────────────── */}
        <div className="space-y-5 lg:col-span-2">
          <section className="rounded-2xl border border-ink-100 bg-white p-5 dark:border-ink-700 dark:bg-ink-900">
            <h2 className="text-base font-semibold text-ink-900 dark:text-ink-100">
              Basics
            </h2>

            <div className="mt-4 grid gap-4">
              <FormField
                label="Title"
                htmlFor="title"
                required
                error={errors.title?.message}
              >
                <Input
                  id="title"
                  placeholder="e.g. Modern Full-Stack with Next.js"
                  hasError={Boolean(errors.title)}
                  {...register('title')}
                />
              </FormField>

              <FormField
                label="Short description"
                htmlFor="shortDescription"
                required
                error={errors.shortDescription?.message}
                hint="One short sentence shown on cards. 80–200 characters works best."
              >
                <Textarea
                  id="shortDescription"
                  rows={2}
                  placeholder="Quick pitch — what will learners walk away knowing?"
                  hasError={Boolean(errors.shortDescription)}
                  {...register('shortDescription')}
                />
              </FormField>

              <FormField
                label="Full description"
                htmlFor="description"
                required
                error={errors.description?.message}
                hint="Markdown is OK. Use bullet points for outcomes."
              >
                <Textarea
                  id="description"
                  rows={8}
                  placeholder="Long-form pitch: outcomes, who it's for, prerequisites, what's inside..."
                  hasError={Boolean(errors.description)}
                  {...register('description')}
                />
              </FormField>
            </div>
          </section>

          <section className="rounded-2xl border border-ink-100 bg-white p-5 dark:border-ink-700 dark:bg-ink-900">
            <h2 className="text-base font-semibold text-ink-900 dark:text-ink-100">
              Pricing & duration
            </h2>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <FormField
                label="Price (BDT)"
                htmlFor="price"
                required
                error={errors.price?.message}
              >
                <Input
                  id="price"
                  type="number"
                  min={0}
                  step="1"
                  hasError={Boolean(errors.price)}
                  {...register('price')}
                />
              </FormField>
              <FormField
                label="Discount price"
                htmlFor="discountPrice"
                error={errors.discountPrice?.message}
                hint="Optional. Leave blank for no sale."
              >
                <Input
                  id="discountPrice"
                  type="number"
                  min={0}
                  step="1"
                  hasError={Boolean(errors.discountPrice)}
                  {...register('discountPrice')}
                />
              </FormField>
              <FormField
                label="Duration (hours)"
                htmlFor="durationHours"
                required
                error={errors.durationHours?.message}
              >
                <Input
                  id="durationHours"
                  type="number"
                  min={0}
                  step="0.5"
                  hasError={Boolean(errors.durationHours)}
                  {...register('durationHours')}
                />
              </FormField>
            </div>
          </section>

          <section className="rounded-2xl border border-ink-100 bg-white p-5 dark:border-ink-700 dark:bg-ink-900">
            <h2 className="text-base font-semibold text-ink-900 dark:text-ink-100">
              Classification
            </h2>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <FormField
                label="Category"
                htmlFor="category"
                required
                error={errors.category?.message}
                hint={
                  categories.length > 0
                    ? 'Pick from active categories. Manage the list in Categories.'
                    : 'No categories yet — open Categories to create one.'
                }
              >
                {categories.length > 0 ? (
                  <Select
                    id="category"
                    hasError={Boolean(errors.category)}
                    {...register('category')}
                  >
                    <option value="">Select a category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.name} disabled={!c.isActive}>
                        {c.name}
                        {!c.isActive ? ' (inactive)' : ''}
                      </option>
                    ))}
                  </Select>
                ) : (
                  <Input
                    id="category"
                    placeholder="e.g. Engineering"
                    hasError={Boolean(errors.category)}
                    {...register('category')}
                  />
                )}
              </FormField>

              <FormField
                label="Level"
                htmlFor="level"
                required
                error={errors.level?.message}
              >
                <Select
                  id="level"
                  hasError={Boolean(errors.level)}
                  {...register('level')}
                >
                  {COURSE_LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl} className="capitalize">
                      {lvl}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField
                label="Instructor"
                htmlFor="instructor"
                required
                error={errors.instructor?.message}
                hint="Pick the staff/admin who'll appear on the course detail page."
                className="sm:col-span-2"
              >
                <Select
                  id="instructor"
                  hasError={Boolean(errors.instructor)}
                  {...register('instructor')}
                >
                  <option value="">Select an instructor</option>
                  {instructors.map((u) => (
                    <option key={u.id} value={u.id}>
                      {(u.name || u.email) + ' · ' + u.role.replace('_', ' ')}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField
                label="Tags"
                htmlFor="tags"
                hint="Comma separated — e.g. javascript, web, fullstack"
                className="sm:col-span-2"
              >
                <Input
                  id="tags"
                  placeholder="e.g. nextjs, react, fullstack"
                  {...register('tags')}
                />
              </FormField>
            </div>
          </section>
        </div>

        {/* ── Side rail ───────────────────────────────────────── */}
        <aside className="space-y-5">
          <section className="rounded-2xl border border-ink-100 bg-white p-5 dark:border-ink-700 dark:bg-ink-900">
            <h2 className="text-base font-semibold text-ink-900 dark:text-ink-100">
              Visibility
            </h2>
            <label className="mt-3 flex items-start gap-3 rounded-xl border border-ink-100 px-3 py-2 dark:border-ink-700">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
                {...register('isPublished')}
              />
              <span>
                <p className="text-sm font-semibold text-ink-900 dark:text-ink-100">
                  Publish course
                </p>
                <p className="text-xs text-ink-500">
                  Published courses appear in the public catalog and on
                  landing-page CTAs.
                </p>
              </span>
            </label>
          </section>

          <section className="rounded-2xl border border-ink-100 bg-white p-5 dark:border-ink-700 dark:bg-ink-900">
            <h2 className="text-base font-semibold text-ink-900 dark:text-ink-100">
              Thumbnail
              {!isEdit && <span className="ml-1 text-red-500">*</span>}
            </h2>

            <div className="mt-3 overflow-hidden rounded-xl border border-dashed border-ink-200 bg-surface-muted/40 dark:border-ink-700">
              <div className="relative aspect-video w-full bg-ink-100 dark:bg-ink-700/30">
                {thumbnailPreview ? (
                  <Image
                    src={thumbnailPreview}
                    alt="Thumbnail preview"
                    fill
                    sizes="(min-width: 1024px) 320px, 100vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-ink-300">
                    <ImagePlus className="h-8 w-8" />
                  </div>
                )}
              </div>
              <div className="p-3">
                <label className="block">
                  <span className="sr-only">Upload thumbnail</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onPickThumbnail}
                    className="block w-full text-xs text-ink-500 file:mr-3 file:rounded-md file:border-0 file:bg-brand-600 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-brand-700"
                  />
                </label>
                <p className="mt-2 text-[11px] text-ink-500">
                  Max 5 MB · JPG/PNG · 16:9 recommended.
                  {isEdit && ' Leave empty to keep the current image.'}
                </p>
              </div>
            </div>
          </section>

          <div className="rounded-2xl border border-ink-100 bg-white p-5 dark:border-ink-700 dark:bg-ink-900">
            <Button
              type="submit"
              size="lg"
              isLoading={isSubmitting}
              leftIcon={<Save className="h-4 w-4" />}
              className="w-full"
            >
              {isEdit ? 'Save changes' : 'Create course'}
            </Button>
            <Link
              href="/admin/courses"
              className="mt-2 block text-center text-xs font-semibold text-ink-500 hover:text-brand-700"
            >
              Cancel
            </Link>
          </div>
        </aside>
      </div>
    </form>
  );
};
