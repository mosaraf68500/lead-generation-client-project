import { z } from 'zod';
import { USER_ROLES } from '../../types/common.types';

export const userValidation = {
  updateProfile: z.object({
    name: z.string().trim().min(2).max(80).optional(),
    phone: z.string().trim().min(6).max(20).optional(),
    avatar: z.string().url().optional(),
    bio: z.string().max(1024).optional(),
    country: z.string().trim().max(80).optional(),
  }),

  updateRole: z.object({
    role: z.enum(USER_ROLES),
  }),

  listQuery: z.object({
    search: z.string().optional(),
    role: z.enum(USER_ROLES).optional(),
    sort: z.string().optional(),
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
  }),

  idParam: z.object({
    id: z.string().min(8, 'Invalid user id'),
  }),
};
