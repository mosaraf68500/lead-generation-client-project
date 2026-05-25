/**
 * Browser-side Better Auth client. Exposes typed helpers (signIn, signUp,
 * signOut, useSession) that talk to `/api/auth/*` in this Next.js app.
 */
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL:
    typeof window === 'undefined'
      ? process.env.BETTER_AUTH_URL ?? 'http://localhost:3000'
      : window.location.origin,
});

export const { signIn, signUp, signOut, useSession } = authClient;
