import { z } from 'zod';

const baseCategory = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(280).optional().or(z.literal('')),
  iconKey: z.string().trim().max(40).optional().or(z.literal('')),
  sortOrder: z.coerce.number().int().optional(),
  isActive: z
    .preprocess(
      (v) => (v === 'true' ? true : v === 'false' ? false : v),
      z.boolean(),
    )
    .optional(),
});

export const categoryValidation = {
  create: baseCategory,
  update: baseCategory.partial(),

  setActive: z.object({
    isActive: z.boolean(),
  }),

  listQuery: z.object({
    search: z.string().optional(),
    isActive: z.preprocess(
      (v) => (v === 'true' ? true : v === 'false' ? false : v),
      z.boolean().optional(),
    ),
    sort: z.string().optional(),
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(200).optional(),
  }),

  idParam: z.object({ id: z.string().min(8) }),
};
