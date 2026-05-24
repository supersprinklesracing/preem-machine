'use server';

import { ENV_STRIPE_ENABLED, getNextPublicProjectId } from '@preem-machine/env';
import {
  getAuthCookieSignatureKeyCurrent,
  getAuthCookieSignatureKeyPrevious,
  getServiceAccountClientEmail,
  getServiceAccountPrivateKey,
  getStripeApiKey,
  getStripeWebhookSecret,
} from '@preem-machine/env/server';

import type { ServiceAccountSecret } from './service-account-secret';

export async function getServiceAccountSecret(): Promise<ServiceAccountSecret> {
  return {
    project_id: getNextPublicProjectId(),
    private_key: getServiceAccountPrivateKey().replace(/\\n/g, '\n'),
    client_email: getServiceAccountClientEmail(),
  } as unknown as ServiceAccountSecret;
}

export async function getCookieSecrets() {
  return {
    cookieSignatureKeys: [
      getAuthCookieSignatureKeyCurrent(),
      getAuthCookieSignatureKeyPrevious(),
    ],
  };
}

export async function getStripeSecrets(): Promise<
  { apiKey: string; webhookSecret: string } | undefined
> {
  if (!ENV_STRIPE_ENABLED) {
    return undefined;
  }
  return {
    apiKey: getStripeApiKey(),
    webhookSecret: getStripeWebhookSecret(),
  };
}
