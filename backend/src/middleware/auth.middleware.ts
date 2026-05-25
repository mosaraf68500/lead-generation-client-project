/**
 * Auth middleware. Validates the Better Auth session bound to the inbound
 * request (cookie OR Bearer token, courtesy of the `bearer` plugin) and
 * attaches a minimal `AuthenticatedUser` to `req.user`.
 *
 * Two variants are exported:
 *   - `requireAuth`     -> rejects with 401 if no session is present.
 *   - `optionalAuth`    -> never rejects, just attaches the user when available
 *                          (useful for endpoints that customise responses for
 *                          logged-in callers but still serve anonymous ones).
 */
import type { NextFunction, Request, Response } from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../config/auth';
import { AppError } from '../utils/AppError';
import type { AuthenticatedUser, UserRole } from '../types/common.types';
import { USER_ROLES } from '../types/common.types';

const resolveSession = async (req: Request): Promise<AuthenticatedUser | null> => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  if (!session?.user) return null;

  // Better Auth returns the raw user document including our additionalFields.
  // We narrow + default the role to keep TypeScript honest downstream.
  const rawRole = (session.user as { role?: string }).role;
  const role: UserRole = USER_ROLES.includes(rawRole as UserRole) ? (rawRole as UserRole) : 'student';

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name ?? '',
    role,
  };
};

export const requireAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = await resolveSession(req);
    if (!user) {
      throw new AppError('You must be signed in to access this resource', 401);
    }
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = await resolveSession(req);
    if (user) req.user = user;
    next();
  } catch {
    // Optional auth must never block the request; swallow & continue.
    next();
  }
};
