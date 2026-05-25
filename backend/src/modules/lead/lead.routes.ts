import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import { leadValidation } from './lead.validation';
import { LeadController } from './lead.controller';

const router = Router();

// PUBLIC: lead-capture form submissions. No auth — the backend also tries to
// auto-provision a student account for the submitter (see LeadService.create).
router.post('/', validate({ body: leadValidation.create }), LeadController.create);

// STUDENT self-service: the leads they themselves submitted (keyed by email).
router.get('/mine', requireAuth, LeadController.mine);

// STAFF / ADMIN analytics summary + CSV export.
router.get(
  '/analytics',
  requireAuth,
  requireRole('staff', 'admin'),
  LeadController.analytics,
);

router.get(
  '/export',
  requireAuth,
  requireRole('staff', 'admin'),
  validate({ query: leadValidation.exportQuery }),
  LeadController.exportCsv,
);

// STAFF / ADMIN list + lookup.
router.get(
  '/',
  requireAuth,
  requireRole('staff', 'admin'),
  validate({ query: leadValidation.listQuery }),
  LeadController.list,
);

router.get(
  '/:id',
  requireAuth,
  requireRole('staff', 'admin'),
  validate({ params: leadValidation.idParam }),
  LeadController.getOne,
);

router.patch(
  '/:id/status',
  requireAuth,
  requireRole('staff', 'admin'),
  validate({ params: leadValidation.idParam, body: leadValidation.updateStatus }),
  LeadController.updateStatus,
);

router.post(
  '/:id/notes',
  requireAuth,
  requireRole('staff', 'admin'),
  validate({ params: leadValidation.idParam, body: leadValidation.addNote }),
  LeadController.addNote,
);

router.delete(
  '/:id',
  requireAuth,
  requireRole('admin'),
  validate({ params: leadValidation.idParam }),
  LeadController.remove,
);

export const leadRouter = router;
