/**
 * Server-side session helpers. These do the AUTHORITATIVE auth + role check
 * inside Server Components (the edge middleware is only a cookie-presence
 * heuristic, which is much cheaper but not enough for sensitive pages).
 */
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/services/auth';
import type { User, UserRole } from '@/types';

const normalise = (raw: unknown): User | null => {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  return {
    id: String(r.id ?? r._id ?? ''),
    email: String(r.email ?? ''),
    name: String(r.name ?? ''),
    role: ((r.role as UserRole) ?? 'student') as UserRole,
    phone: r.phone as string | undefined,
    avatar: (r.avatar ?? r.image) as string | undefined,
    bio: r.bio as string | undefined,
    country: r.country as string | undefined,
    emailVerified: Boolean(r.emailVerified),
  };
};

export const getServerSession = async (): Promise<User | null> => {
  const session = await auth.api.getSession({ headers: headers() });
  return normalise(session?.user);
};

export const requireSessionRole = async (...allowed: UserRole[]): Promise<User> => {
  const user = await getServerSession();
  if (!user) redirect('/login');
  if (user.role !== 'super_admin' && allowed.length > 0 && !allowed.includes(user.role)) {
    redirect('/');
  }
  return user;
};
