import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import { leadValidation } from './lead.validation';
import { LeadController } from './lead.controller';

const router = Router();

/**
 * RBAC matrix enforced by this router:
 *
 *   POST   /                         → public (lead-capture)
 *   GET    /mine                     → student self-service
 *   GET    /analytics                → staff (own scope), admin, super-admin
 *   GET    /my-performance           → staff/admin/super-admin (own perf KPIs)
 *   GET    /export                   → staff (own scope), admin, super-admin
 *   GET    /                         → staff (own scope), admin, super-admin
 *   GET    /:id                      → staff (must be assigned), admin, super-admin
 *   PATCH  /:id/status               → staff (must be assigned), admin, super-admin
 *   POST   /:id/notes                → staff (must be assigned), admin, super-admin
 *   PATCH  /:id/assign               → admin, super-admin                 (NOT staff)
 *   DELETE /:id                      → admin, super-admin                 (NOT staff)
 *
 * Staff-scoping (`assignedTo == caller.id`) is enforced inside the service
 * layer — the route guard alone is not enough.
 */

// PUBLIC: lead-capture form submissions. No auth — the backend also tries to
// auto-provision a student account for the submitter (see LeadService.create).
router.post('/', validate({ body: leadValidation.create }), LeadController.create);

// STUDENT self-service: the leads they themselves submitted (keyed by email).
router.get('/mine', requireAuth, LeadController.mine);

// STAFF / ADMIN dashboards.
router.get(
  '/analytics',
  requireAuth,
  requireRole('staff', 'admin'),
  LeadController.analytics,
);

router.get(
  '/my-performance',
  requireAuth,
  requireRole('staff', 'admin'),
  LeadController.myPerformance,
);

router.get(
  '/export',
  requireAuth,
  requireRole('staff', 'admin'),
  validate({ query: leadValidation.exportQuery }),
  LeadController.exportCsv,
);

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

// Assignment is an admin+ action — staff can never reassign their own leads.
router.patch(
  '/:id/assign',
  requireAuth,
  requireRole('admin'),
  validate({ params: leadValidation.idParam, body: leadValidation.assign }),
  LeadController.assign,
);

router.delete(
  '/:id',
  requireAuth,
  requireRole('admin'),
  validate({ params: leadValidation.idParam }),
  LeadController.remove,
);

export const leadRouter = router;
