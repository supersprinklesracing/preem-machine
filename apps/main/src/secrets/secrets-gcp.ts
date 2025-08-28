'use server';

import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import {
  isServiceAccountSecret,
  ServiceAccountSecret,
} from './service-account-secret';

let cachedClient: unknown | null = null;
async function getSecret(name: string): Promise<string> {
  if (!cachedClient) {
    cachedClient = new SecretManagerServiceClient();
  }
  const [version] = await (
    cachedClient as SecretManagerServiceClient
  ).accessSecretVersion({
    name: name,
  });
  const secretValue = version.payload?.data?.toString();
  if (!secretValue) {
    throw new Error(`Secret not found or empty for: ${name}`);
  }
  return secretValue;
}

let cachedServiceAccountKey: ServiceAccountSecret | null = null;
export async function getServiceAccountSecret() {
  if (!cachedServiceAccountKey) {
    const secretValue = await getSecret(
      `projects/${process.env.NEXT_PUBLIC_PROJECT_ID}/secrets/firebase_admin_private_key_json/versions/latest`,
    );
    const parsedSecretValue = JSON.parse(secretValue);
    if (isServiceAccountSecret(parsedSecretValue)) {
      cachedServiceAccountKey = parsedSecretValue;
    } else {
      throw new Error('Invalid service account key format');
    }
  }
  return cachedServiceAccountKey;
}

export async function getCookieSecrets() {
  return {
    cookieSignatureKeys: [
      await getSecret('AUTH_COOKIE_SIGNATURE_KEY_CURRENT'),
      await getSecret('AUTH_COOKIE_SIGNATURE_KEY_PREVIOUS'),
    ],
  };
}

export async function getStripeSecrets() {
  return {
    apiKey: await getSecret('STRIPE_API_KEY'),
    webhookSecret: await getSecret('STRIPE_WEBHOOK_SECRET'),
  };
}
