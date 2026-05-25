/**
 * Auth routes.
 *
 * NOTE: the Better Auth handler itself is mounted at `/api/auth/*` in
 * `app.ts` (it serves sign-in, sign-up, sign-out, etc. directly). This file
 * exposes a single read-only endpoint used by the frontend to fetch an
 * enriched profile for the currently signed-in user.
 */
import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import { AuthController } from './auth.controller';

const router = Router();

router.get('/me', requireAuth, AuthController.getMe);

export const authRouter = router;
