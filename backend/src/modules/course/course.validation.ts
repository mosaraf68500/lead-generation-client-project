import { z } from 'zod';
import { COURSE_LEVELS } from './course.interface';

const lessonSchema = z.object({
  title: z.string().trim().min(2).max(160),
  videoUrl: z.string().url().optional(),
  durationMin: z.coerce.number().min(0).default(0),
});

const moduleSchema = z.object({
  title: z.string().trim().min(2).max(160),
  lessons: z.array(lessonSchema).default([]),
});

/**
 * The course CRUD routes accept multipart/form-data because of the thumbnail
 * upload. Multer puts non-file fields onto `req.body` as raw strings (or
 * arrays of strings when a key is repeated), so a few preprocessors below
 * adapt those into the shapes Zod expects.
 */

/** "single string" → [string]; nullish/empty → []; array passes through. */
const toStringArray = (val: unknown): string[] => {
  if (Array.isArray(val)) return val.map((v) => String(v));
  if (val === undefined || val === null || val === '') return [];
  return [String(val)];
};

/** "true"/"1"/true → true; "false"/"0"/false/empty/undefined → false. */
const toBoolean = (val: unknown): boolean => {
  if (typeof val === 'boolean') return val;
  if (val === 'true' || val === '1' || val === 1) return true;
  return false;
};

/** Treat empty strings as undefined so `.optional()` works for form fields. */
const stripEmpty = (val: unknown): unknown =>
  typeof val === 'string' && val.trim() === '' ? undefined : val;

const baseCourse = z.object({
  title: z.string().trim().min(3).max(160),
  shortDescription: z.string().trim().min(10).max(280),
  description: z.string().trim().min(20),
  price: z.coerce.number().min(0),
  discountPrice: z.preprocess(stripEmpty, z.coerce.number().min(0).optional()),
  category: z.string().trim().min(2).max(80),
  level: z.enum(COURSE_LEVELS),
  durationHours: z.coerce.number().min(0),
  instructor: z.string().min(8),
  modules: z.preprocess(
    (v) => (v === undefined || v === '' ? [] : v),
    z.array(moduleSchema).default([]),
  ),
  tags: z.preprocess(toStringArray, z.array(z.string().trim()).default([])),
  isPublished: z.preprocess(toBoolean, z.boolean()).optional(),
});

export const courseValidation = {
  create: baseCourse,
  update: baseCourse.partial(),

  listQuery: z.object({
    search: z.string().optional(),
    category: z.string().optional(),
    level: z.enum(COURSE_LEVELS).optional(),
    isPublished: z.preprocess(
      (v) => (v === 'true' ? true : v === 'false' ? false : v),
      z.boolean().optional(),
    ),
    sort: z.string().optional(),
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
  }),

  idParam: z.object({ id: z.string().min(8) }),
  slugParam: z.object({ slug: z.string().min(1) }),
};
