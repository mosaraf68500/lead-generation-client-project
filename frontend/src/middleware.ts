/**
 * Edge middleware: lightweight route guard.
 *
 * We can't run the full Better Auth session lookup at the edge (it needs
 * MongoDB), so we use the presence of the Better Auth session cookie as a
 * gating heuristic. Server Components then do the real, authoritative check
 * + role enforcement via `auth.api.getSession`.
 */
import { NextResponse, type NextRequest } from 'next/server';

const SESSION_COOKIE_NAMES = ['better-auth.session_token', '__Secure-better-auth.session_token'];

const PROTECTED_PREFIXES = ['/student', '/staff', '/admin', '/super-admin'];

const hasSessionCookie = (req: NextRequest): boolean =>
  SESSION_COOKIE_NAMES.some((name) => Boolean(req.cookies.get(name)?.value));

export const middleware = (req: NextRequest): NextResponse => {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (isProtected && !hasSessionCookie(req)) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
};

export const config = {
  matcher: [
    '/student/:path*',
    '/staff/:path*',
    '/admin/:path*',
    '/super-admin/:path*',
  ],
};
