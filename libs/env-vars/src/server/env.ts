import { z } from 'zod';

import { isTrue, optional, required } from './env-util';

// Server-only environment variables validation schema
const serverEnvSchema = z.object({
  SERVICE_ACCOUNT_PRIVATE_KEY: z
    .string()
    .min(1, 'SERVICE_ACCOUNT_PRIVATE_KEY is required'),
  SERVICE_ACCOUNT_CLIENT_EMAIL: z
    .string()
    .email('SERVICE_ACCOUNT_CLIENT_EMAIL must be a valid email'),
  AUTH_COOKIE_SIGNATURE_KEY_CURRENT: z.string().optional(),
  AUTH_COOKIE_SIGNATURE_KEY_PREVIOUS: z.string().optional(),
  STRIPE_API_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_API_VERSION: z.string().optional(),
  DOTENV_SECRETS: z.string().optional(),
  DEBUG_CREDENTIALS_DANGER: z.string().optional(),
  DEBUG_LINKS: z.string().optional(),
  DEBUG_DATASTORE: z.string().optional(),
  E2E_TESTING: z.string().optional(),
  E2E_TESTING_USER: z.string().optional(),
  STRAVA_CLIENT_ID: z.string().optional(),
  STRAVA_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  AUTH_SECRET: z.string().optional(),
});

export const validateServerEnv = () => {
  if (
    process.env.NEXT_PHASE === 'phase-production-build' ||
    process.env.NODE_ENV === 'test' ||
    process.env.NEXT_RUNTIME === 'edge' ||
    process.env.E2E_TESTING === 'true'
  ) {
    return;
  }
  try {
    const stripeEnabled =
      optional('NEXT_PUBLIC_STRIPE_ENABLED')?.toLowerCase() === 'true';

    const parsed = serverEnvSchema.parse({
      SERVICE_ACCOUNT_PRIVATE_KEY: optional('SERVICE_ACCOUNT_PRIVATE_KEY'),
      SERVICE_ACCOUNT_CLIENT_EMAIL: optional('SERVICE_ACCOUNT_CLIENT_EMAIL'),
      AUTH_COOKIE_SIGNATURE_KEY_CURRENT: optional(
        'AUTH_COOKIE_SIGNATURE_KEY_CURRENT',
      ),
      AUTH_COOKIE_SIGNATURE_KEY_PREVIOUS: optional(
        'AUTH_COOKIE_SIGNATURE_KEY_PREVIOUS',
      ),
      STRIPE_API_KEY: optional('STRIPE_API_KEY'),
      STRIPE_WEBHOOK_SECRET: optional('STRIPE_WEBHOOK_SECRET'),
      STRIPE_API_VERSION: optional('STRIPE_API_VERSION'),
      DOTENV_SECRETS: optional('DOTENV_SECRETS'),
      DEBUG_CREDENTIALS_DANGER: optional('DEBUG_CREDENTIALS_DANGER'),
      DEBUG_LINKS: optional('DEBUG_LINKS'),
      DEBUG_DATASTORE: optional('DEBUG_DATASTORE'),
      E2E_TESTING: optional('E2E_TESTING'),
      E2E_TESTING_USER: optional('E2E_TESTING_USER'),
      STRAVA_CLIENT_ID: optional('STRAVA_CLIENT_ID'),
      STRAVA_CLIENT_SECRET: optional('STRAVA_CLIENT_SECRET'),
      GOOGLE_CLIENT_ID: optional('GOOGLE_CLIENT_ID'),
      GOOGLE_CLIENT_SECRET: optional('GOOGLE_CLIENT_SECRET'),
      AUTH_SECRET: optional('AUTH_SECRET'),
    });

    if (stripeEnabled) {
      if (!parsed.STRIPE_API_KEY) {
        throw new Error('STRIPE_API_KEY is required when Stripe is enabled');
      }
      if (!parsed.STRIPE_WEBHOOK_SECRET) {
        throw new Error(
          'STRIPE_WEBHOOK_SECRET is required when Stripe is enabled',
        );
      }
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.issues
        .map((err) => `  - ${err.path.join('.')}: ${err.message}`)
        .join('\n');
      throw new Error(
        `🚨 Server environment variable validation failed:\n${formattedErrors}\n` +
          `Please check your local .env or system environment configurations.`,
      );
    }
    throw error;
  }
};

// Run validation immediately on import for server environments (non-build, non-test)
validateServerEnv();

// Server Getters
export const getServiceAccountPrivateKey = () =>
  required('SERVICE_ACCOUNT_PRIVATE_KEY');

export const getServiceAccountClientEmail = () =>
  required('SERVICE_ACCOUNT_CLIENT_EMAIL');

export const getAuthCookieSignatureKeyCurrent = () =>
  optional('AUTH_COOKIE_SIGNATURE_KEY_CURRENT') ||
  'fallback-signature-key-current';

export const getAuthCookieSignatureKeyPrevious = () =>
  optional('AUTH_COOKIE_SIGNATURE_KEY_PREVIOUS') ||
  'fallback-signature-key-previous';

export const getStripeApiKey = () => required('STRIPE_API_KEY');

export const getStripeWebhookSecret = () => required('STRIPE_WEBHOOK_SECRET');

export const getStripeApiVersion = () => optional('STRIPE_API_VERSION');

export const isDotEnvSecrets = () => isTrue('DOTENV_SECRETS');

export const getE2eTestingUser = () =>
  optional('E2E_TESTING_USER') || 'test-user-id-not-specified';

export const isE2eTesting = () => isTrue('E2E_TESTING');

export const getEnvNodeEnv = () => optional('NODE_ENV');

export const getProjectId = () =>
  optional('NEXT_PUBLIC_PROJECT_ID') ||
  optional('GCLOUD_PROJECT') ||
  optional('FIREBASE_PROJECT_ID') ||
  'preem-machine';

// Backward compatible Server Constants
export const ENV_DOTENV_SECRETS = isDotEnvSecrets();

export const ENV_E2E_TESTING_USER = getE2eTestingUser();

export const getStravaClientId = () => optional('STRAVA_CLIENT_ID');
export const getStravaClientSecret = () => optional('STRAVA_CLIENT_SECRET');

export const getGoogleClientId = () => optional('GOOGLE_CLIENT_ID');
export const getGoogleClientSecret = () => optional('GOOGLE_CLIENT_SECRET');

export const getAuthSecret = () => optional('AUTH_SECRET');
