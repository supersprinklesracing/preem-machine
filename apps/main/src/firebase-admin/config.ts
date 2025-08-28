'use server';

import { ENV_DEBUG_AUTH, ENV_USE_HTTPS } from '@/env/env';
import { getSecrets } from '@/secrets';
import type { ServiceAccount } from 'firebase-admin';
import type { AuthMiddlewareOptions } from 'next-firebase-auth-edge/next/middleware';
import { clientConfig } from '../firebase-client/config';

let serviceAccount: ServiceAccount | null = null;
async function serviceAccountFn() {
  if (serviceAccount) {
    return serviceAccount;
  }
  const serviceAccountKey = (await getSecrets()).serviceAccountSecret;

  serviceAccount = {
    projectId: serviceAccountKey.project_id,
    privateKey: serviceAccountKey.private_key,
    clientEmail: serviceAccountKey.client_email,
    toString: () =>
      JSON.stringify({
        projectId: serviceAccountKey.project_id?.length > 0,
        privateKey: serviceAccountKey.private_key?.length > 0,
        clientEmail: serviceAccountKey.client_email?.length > 0,
      }),
  } as ServiceAccount;
  return serviceAccount;
}

let cookieSecrets: { cookieSignatureKeys: string[] } | null = null;
async function cookieSecretsFn() {
  if (cookieSecrets) {
    return cookieSecrets;
  }
  cookieSecrets = await (await getSecrets()).cookieSecrets;
  return cookieSecrets;
}

export async function serverConfigFn(): Promise<AuthMiddlewareOptions<object>> {
  if (!serviceAccount) {
    serviceAccount = await serviceAccountFn();
  }
  const cookieConfig = await cookieSecretsFn();
  const config: AuthMiddlewareOptions<object> = {
    apiKey: clientConfig.apiKey,
    cookieName: '__session',
    cookieSignatureKeys: cookieConfig.cookieSignatureKeys,
    cookieSerializeOptions: {
      path: '/',
      httpOnly: true,
      secure: ENV_USE_HTTPS,
      sameSite: 'lax' as const,
      maxAge: 12 * 60 * 60 * 24, // twelve days
    },
    debug: ENV_DEBUG_AUTH,
    dynamicCustomClaimsKeys: ['roles'],
    loginPath: '/api/login',
    logoutPath: '/api/logout',
    // Set to false if you're not planning to use `signInWithCustomToken` Firebase Client SDK method
    enableCustomToken: false,
    // Set to false in Firebase Hosting environment due to https://stackoverflow.com/questions/44929653/firebase-cloud-function-wont-store-cookie-named-other-than-session
    enableMultipleCookies: false,
    enableTokenRefreshOnExpiredKidHeader: true,
    refreshTokenPath: '/api/refresh-token',
    serviceAccount: serviceAccount as Required<ServiceAccount>,
  };
  return config;
}
