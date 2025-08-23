'use server';

/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { ENV_AUTH_DEBUG, ENV_USE_HTTPS, orThrow } from '@/env/env';
import { clientConfig } from '../firebase-client/config';

export async function serverConfigFn() {
  return {
    useSecureCookies: ENV_USE_HTTPS,
    firebaseApiKey: orThrow(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
    serviceAccount: process.env.SERVICE_ACCOUNT_PRIVATE_KEY
      ? {
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
          clientEmail: process.env.SERVICE_ACCOUNT_CLIENT_EMAIL!,
          privateKey: process.env.SERVICE_ACCOUNT_PRIVATE_KEY.replace(
            /\\n/g,
            '\n',
          ),
        }
      : undefined,
  };
}

export async function authConfigFn() {
  const serverConfig = await serverConfigFn();
  return {
    apiKey: serverConfig.firebaseApiKey,
    cookieName: orThrow(process.env.AUTH_COOKIE_NAME),
    cookieSignatureKeys: [
      orThrow(process.env.AUTH_COOKIE_SIGNATURE_KEY_CURRENT),
      orThrow(process.env.AUTH_COOKIE_SIGNATURE_KEY_PREVIOUS),
    ],
    cookieSerializeOptions: {
      path: '/',
      httpOnly: true,
      secure: serverConfig.useSecureCookies, // Set this to true on HTTPS environments
      sameSite: 'lax' as const,
      maxAge: 12 * 60 * 60 * 24, // twelve days
    },
    serviceAccount: serverConfig.serviceAccount!,
    // Set to false in Firebase Hosting environment due to https://stackoverflow.com/questions/44929653/firebase-cloud-function-wont-store-cookie-named-other-than-session
    enableMultipleCookies: false,
    // Set to false if you're not planning to use `signInWithCustomToken` Firebase Client SDK method
    enableCustomToken: false,
    enableTokenRefreshOnExpiredKidHeader: true,
    debug: ENV_AUTH_DEBUG,
    tenantId: clientConfig.tenantId,
  };
}
