'use client';

/**
 * Global auth context. Wraps Better Auth's `useSession` hook and exposes a
 * normalised user shape (including our role + profile additionalFields) plus
 * a `hasRole` helper for client-side UI gating.
 *
 * Server-side enforcement still happens in Server Components and middleware;
 * this context is purely for UI convenience (showing/hiding buttons, etc.).
 */
import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import { useSession, signOut } from '@/services/authClient';
import type { User, UserRole } from '@/types';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasRole: (...roles: UserRole[]) => boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const normaliseUser = (raw: unknown): User | null => {
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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { data: session, isPending } = useSession();

  const value = useMemo<AuthContextValue>(() => {
    const user = normaliseUser(session?.user);
    return {
      user,
      isLoading: isPending,
      isAuthenticated: Boolean(user),
      hasRole: (...roles: UserRole[]) => {
        if (!user) return false;
        if (user.role === 'super_admin') return true;
        return roles.includes(user.role);
      },
      signOut: async () => {
        await signOut();
        // Hard reload so any cached server state (cookies, tags) is dropped.
        if (typeof window !== 'undefined') window.location.href = '/';
      },
    };
  }, [session, isPending]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
};
