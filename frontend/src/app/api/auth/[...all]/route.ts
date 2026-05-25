/**
 * Mounts the Better Auth handler at `/api/auth/*`. Every sign-in / sign-up /
 * sign-out / session call resolves here.
 */
import { toNextJsHandler } from 'better-auth/next-js';
import { auth } from '@/services/auth';

export const { GET, POST } = toNextJsHandler(auth);
