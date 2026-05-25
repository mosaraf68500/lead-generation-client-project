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

const baseCourse = z.object({
  title: z.string().trim().min(3).max(160),
  shortDescription: z.string().trim().min(10).max(280),
  description: z.string().trim().min(20),
  price: z.coerce.number().min(0),
  discountPrice: z.coerce.number().min(0).optional(),
  category: z.string().trim().min(2).max(80),
  level: z.enum(COURSE_LEVELS),
  durationHours: z.coerce.number().min(0),
  instructor: z.string().min(8),
  modules: z.array(moduleSchema).default([]),
  tags: z.array(z.string().trim()).default([]),
  isPublished: z.coerce.boolean().optional(),
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
