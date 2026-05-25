/**
 * Role-guard factory. Place after `requireAuth` to restrict a route to a
 * specific set of roles. Super admins are granted every role implicitly so
 * the platform owner can do everything an admin can without re-assigning.
 */
import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { AppError } from '../utils/AppError';
import type { UserRole } from '../types/common.types';

export const requireRole =
  (...allowed: UserRole[]): RequestHandler =>
  (req: Request, _res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) return next(new AppError('Not authenticated', 401));

    const isSuperAdmin = user.role === 'super_admin';
    if (!isSuperAdmin && !allowed.includes(user.role)) {
      return next(
        new AppError(
          `Forbidden: role '${user.role}' cannot access this resource`,
          403,
        ),
      );
    }
    next();
  };
