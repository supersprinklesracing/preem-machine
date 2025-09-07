import { serverConfigFn } from '@/firebase-admin/config';
import {
  authMiddleware,
  redirectToHome,
  redirectToLogin,
} from 'next-firebase-auth-edge';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const LOGGED_OUT_ONLY = ['/register', '/login', '/reset-password'];

export async function middleware(request: NextRequest) {
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
      return redirectToLogin(request, {
        path: '/login',
        publicPaths: LOGGED_OUT_ONLY,
      });
    },
    handleError: async (error) => {
      console.error('Unhandled authentication error', { error });

      return redirectToLogin(request, {
        path: '/login',
        publicPaths: LOGGED_OUT_ONLY,
      });
    },
  });
}

export const config = {
  runtime: 'nodejs',
  matcher: [
    '/',
    '/((?!_next|favicon.ico|__/auth|__/firebase|api|.*\\.).*)',
    '/api/login',
    '/api/logout',
    '/api/refresh-token',
    // App-specific
    '/api/stripe',
  ],
};
