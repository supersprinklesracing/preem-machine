import { ENV_E2E_TESTING } from '@/env/env';
import { serverConfigFn } from '@/firebase/server/config';
import {
  authMiddleware,
  redirectToHome,
  redirectToLogin,
} from 'next-firebase-auth-edge';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const LOGGED_OUT_ONLY = ['/register', '/login', '/reset-password'];
const PROTECTED_PATHS = [
  '^/account(/.*)?$',
  '^/admin(/.*)?$',
  '^/manage(/.*)?$',
  '^/new-user(/.*)?$',
].map((path) => new RegExp(path));

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_PATHS.some((path) => path.test(pathname));
}

export async function middleware(request: NextRequest) {
  // TODO: This should probably live inside handle* methods...
  const e2eTestingUser = useE2eTestingUser(request);
  if (e2eTestingUser) {
    return e2eTestingUser;
  }
  const serverConfig = await serverConfigFn();
  return authMiddleware(request, {
    ...serverConfig,

    handleValidToken: async (_tokens, headers) => {
      // Authenticated user should not be able to access /login, /register and /reset-password routes
      if (LOGGED_OUT_ONLY.includes(request.nextUrl.pathname)) {
        return redirectToHome(request);
      }

      return NextResponse.next({
        request: {
          headers,
        },
      });
    },
    handleInvalidToken: async (_reason) => {
      if (isProtectedRoute(request.nextUrl.pathname)) {
        return redirectToLogin(request, {
          path: '/login',
          publicPaths: LOGGED_OUT_ONLY,
        });
      }

      return NextResponse.next();
    },
    handleError: async (error) => {
      console.error('Unhandled authentication error', { error });

      if (isProtectedRoute(request.nextUrl.pathname)) {
        return redirectToLogin(request, {
          path: '/login',
          publicPaths: LOGGED_OUT_ONLY,
        });
      }

      return NextResponse.next();
    },
  });
}

// eslint-disable-next-line @eslint-react/hooks-extra/no-unnecessary-use-prefix
function useE2eTestingUser(request: NextRequest) {
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

export const config = {
  runtime: 'nodejs',
  matcher: [
    '/',
    // See also: ../next.config.js
    '/((?!_next|\\.well-known|favicon\\.ico|__/auth|__/firebase|api).*)',
    '/api/login',
    '/api/logout',
    '/api/refresh-token',
    // App-specific; Hitting these URLs unauthenticated will trigger the redirect.
    // '/api/stripe',
    // '/(api/debug/.*)',
    // '/api/debug/test/load-firestore-test-data',
  ],
};
