/** Domain-wide enum of user roles, used by Better Auth + route guards. */
export const USER_ROLES = ['student', 'staff', 'admin', 'super_admin'] as const;
export type UserRole = (typeof USER_ROLES)[number];

/**
 * Minimal session-bound user shape used by middleware. The full user document
 * lives in MongoDB; this is the slice we attach to `req.user` for guards and
 * controllers.
 */
export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}
