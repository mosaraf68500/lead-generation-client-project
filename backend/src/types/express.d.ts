/**
 * Ambient type augmentation: lets controllers safely read `req.user`
 * after the auth middleware has resolved a session.
 */
import type { AuthenticatedUser } from './common.types';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export {};
