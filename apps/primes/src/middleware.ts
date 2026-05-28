import { ENV_E2E_TESTING } from '@preem-machine/env';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// prettier-ignore
const LOGGED_OUT_ONLY = [
  '/login',
  '/register',
];
const PROTECTED_PATHS = [
  '^/account(/.*)?$',
  '^/admin(/.*)?$',
  '^/manage(/.*)?$',
  '^/new-user(/.*)?$',
].map((path) => new RegExp(path));

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_PATHS.some((path) => path.test(pathname));
}

function hasSessionCookie(request: NextRequest): boolean {
  return (
    request.cookies.has('authjs.session-token') ||
    request.cookies.has('__Secure-authjs.session-token') ||
    request.cookies.has('next-auth.session-token') ||
    request.cookies.has('__Secure-next-auth.session-token')
  );
}

function getE2eTestingUser(request: NextRequest) {
  if (ENV_E2E_TESTING) {
    const e2eAuthUser = request.headers.get('X-e2e-auth-user');
    if (e2eAuthUser) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('X-e2e-auth-user', e2eAuthUser);
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }
  }
  return undefined;
}

export default function middleware(request: NextRequest) {
  const e2eTestingUser = getE2eTestingUser(request);
  if (e2eTestingUser) {
    return e2eTestingUser;
  }

  const { pathname } = request.nextUrl;
  const isLoggedIn = hasSessionCookie(request);

  if (isLoggedIn && LOGGED_OUT_ONLY.includes(pathname)) {
    return NextResponse.redirect(new URL('/', request.nextUrl.origin));
  }

  if (!isLoggedIn && isProtectedRoute(pathname)) {
    const redirectUrl = new URL('/login', request.nextUrl.origin);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/((?!_next|\\.well-known|robots.txt|favicon\\.ico|__/auth|__/firebase|api).*)',
    '/account',
  ],
};
