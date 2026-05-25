import { z } from 'zod';
import { LEAD_STATUSES } from './lead.interface';

export const leadValidation = {
  create: z.object({
    name: z.string().trim().min(2).max(120),
    email: z.string().trim().toLowerCase().email(),
    phone: z.string().trim().min(6).max(20),
    whatsapp: z.string().trim().min(6).max(20).optional(),
    country: z.string().trim().max(80).optional(),
    preferredBatch: z.string().trim().max(120).optional(),
    occupation: z.string().trim().max(120).optional(),
    interestedCourse: z.string().min(8).optional(),
    interestedCourses: z.array(z.string().min(8)).optional(),
    source: z.string().trim().min(2).max(80).default('landing-form'),
    message: z.string().max(2048).optional(),
    utm: z
      .object({
        source: z.string().optional(),
        medium: z.string().optional(),
        campaign: z.string().optional(),
        term: z.string().optional(),
        content: z.string().optional(),
      })
      .optional(),
  }),

  updateStatus: z.object({
    status: z.enum(LEAD_STATUSES),
  }),

  addNote: z.object({
    message: z.string().trim().min(1).max(2048),
  }),

  listQuery: z.object({
    search: z.string().optional(),
    status: z.enum(LEAD_STATUSES).optional(),
    source: z.string().optional(),
    interestedCourse: z.string().optional(),
    sort: z.string().optional(),
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
  }),

  exportQuery: z.object({
    status: z.enum(LEAD_STATUSES).optional(),
    source: z.string().optional(),
    search: z.string().optional(),
  }),

  idParam: z.object({ id: z.string().min(8) }),
};
