import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import { userValidation } from './user.validation';
import { UserController } from './user.controller';

const router = Router();

// Self-service profile endpoints.
router.get('/me', requireAuth, UserController.getMe);
router.patch(
  '/me',
  requireAuth,
  validate({ body: userValidation.updateProfile }),
  UserController.updateMe,
);

// Admin / super-admin management endpoints.
router.get(
  '/',
  requireAuth,
  requireRole('admin'),
  validate({ query: userValidation.listQuery }),
  UserController.list,
);

router.get(
  '/:id',
  requireAuth,
  requireRole('admin', 'staff'),
  validate({ params: userValidation.idParam }),
  UserController.getOne,
);

// Only super admins can promote/demote roles.
router.patch(
  '/:id/role',
  requireAuth,
  requireRole('super_admin'),
  validate({ params: userValidation.idParam, body: userValidation.updateRole }),
  UserController.updateRole,
);

// Only super-admins can terminate accounts. Admins manage business operations
// but cannot delete other admins or super-admin accounts per the RBAC matrix.
router.delete(
  '/:id',
  requireAuth,
  requireRole('super_admin'),
  validate({ params: userValidation.idParam }),
  UserController.remove,
);

export const userRouter = router;
