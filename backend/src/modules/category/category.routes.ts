import { Router } from 'express';
import { requireAuth, optionalAuth } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import { categoryValidation } from './category.validation';
import { CategoryController } from './category.controller';

const router = Router();

// Public list — gated by `optionalAuth` so admins get full visibility but
// the storefront still loads when nobody is signed in.
router.get(
  '/',
  optionalAuth,
  validate({ query: categoryValidation.listQuery }),
  CategoryController.list,
);

// Admin / super-admin CRUD.
router.post(
  '/',
  requireAuth,
  requireRole('admin'),
  validate({ body: categoryValidation.create }),
  CategoryController.create,
);

router.patch(
  '/:id',
  requireAuth,
  requireRole('admin'),
  validate({ params: categoryValidation.idParam, body: categoryValidation.update }),
  CategoryController.update,
);

router.patch(
  '/:id/active',
  requireAuth,
  requireRole('admin'),
  validate({ params: categoryValidation.idParam, body: categoryValidation.setActive }),
  CategoryController.setActive,
);

router.delete(
  '/:id',
  requireAuth,
  requireRole('admin'),
  validate({ params: categoryValidation.idParam }),
  CategoryController.remove,
);

export const categoryRouter = router;
