import { Router } from 'express';
import multer from 'multer';
import { requireAuth, optionalAuth } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import { courseValidation } from './course.validation';
import { CourseController } from './course.controller';

const router = Router();

/**
 * Multer is configured with in-memory storage (5 MB max). The course service
 * streams the buffer straight to Cloudinary, so nothing hits disk.
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.get(
  '/',
  optionalAuth,
  validate({ query: courseValidation.listQuery }),
  CourseController.list,
);

router.get(
  '/analytics/summary',
  requireAuth,
  requireRole('staff', 'admin'),
  CourseController.analytics,
);

router.get(
  '/:slug',
  validate({ params: courseValidation.slugParam }),
  CourseController.getBySlug,
);

router.post(
  '/',
  requireAuth,
  requireRole('staff', 'admin'),
  upload.single('thumbnail'),
  validate({ body: courseValidation.create }),
  CourseController.create,
);

router.patch(
  '/:id',
  requireAuth,
  requireRole('staff', 'admin'),
  upload.single('thumbnail'),
  validate({ params: courseValidation.idParam, body: courseValidation.update }),
  CourseController.update,
);

router.post(
  '/:id/publish',
  requireAuth,
  requireRole('staff', 'admin'),
  validate({ params: courseValidation.idParam }),
  CourseController.publish,
);

router.delete(
  '/:id',
  requireAuth,
  requireRole('admin'),
  validate({ params: courseValidation.idParam }),
  CourseController.remove,
);

export const courseRouter = router;
