'use server';

import type { ServiceAccountSecret } from './service-account-secret';

export async function getServiceAccountSecret(): Promise<ServiceAccountSecret> {
  return {
    project_id: process.env.NEXT_PUBLIC_PROJECT_ID,
    private_key: process.env.SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.SERVICE_ACCOUNT_CLIENT_EMAIL,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any as Promise<ServiceAccountSecret>;
}

export async function getCookieSecrets() {
  return {
    cookieSignatureKeys: [
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      process.env.AUTH_COOKIE_SIGNATURE_KEY_CURRENT!,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      process.env.AUTH_COOKIE_SIGNATURE_KEY_PREVIOUS!,
    ],
  };
}

export async function getStripeSecrets() {
  return {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    apiKey: process.env.STRIPE_API_KEY!,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
  };
}
