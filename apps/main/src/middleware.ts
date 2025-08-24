import { authConfigFn } from '@/firebase-admin/config';
import {
  authMiddleware,
  redirectToHome,
  redirectToLogin,
} from 'next-firebase-auth-edge';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const LOGGED_OUT_ONLY = ['/register', '/login', '/reset-password'];

export async function middleware(request: NextRequest) {
  const authConfig = await authConfigFn();
  return authMiddleware(request, {
    loginPath: '/api/login',
    logoutPath: '/api/logout',
    refreshTokenPath: '/api/refresh-token',
    debug: authConfig.debug,
    enableMultipleCookies: authConfig.enableMultipleCookies,
    enableCustomToken: authConfig.enableCustomToken,
    apiKey: authConfig.apiKey,
    cookieName: authConfig.cookieName,
    cookieSerializeOptions: authConfig.cookieSerializeOptions,
    cookieSignatureKeys: authConfig.cookieSignatureKeys,
    serviceAccount: authConfig.serviceAccount,
    enableTokenRefreshOnExpiredKidHeader:
      authConfig.enableTokenRefreshOnExpiredKidHeader,
    tenantId: authConfig.tenantId,
    handleValidToken: async ({ token, decodedToken, customToken }, headers) => {
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
  matcher: [
    '/',
    '/((?!_next|favicon.ico|__/auth|__/firebase|api|.*\\.).*)',
    '/api/login',
    '/api/logout',
    '/api/refresh-token',
    // App-specific
    '/(manage|account|admin|event|organizatoin|preem|race|series|user)',
    '/api/stripe',
  ],
};
