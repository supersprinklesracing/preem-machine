/**
 * Environment variable getters that are safe for use in the browser.
 * These should ONLY access NEXT_PUBLIC_ variables or other variables
 * that are explicitly allowed to be exposed to the client.
 *
 * NOTE: We use literal process.env access here (e.g. process.env.NEXT_PUBLIC_VAR)
 * to ensure that Next.js can correctly inline these values during the build process.
 * Dynamic access like process.env[key] will NOT be inlined and will return undefined
 * on the client.
 */

const sanitize = (value: string | undefined): string | undefined => {
  if (typeof value !== 'string') return undefined;
  const lower = value.toLowerCase();
  if (lower === 'undefined' || lower === 'null') return undefined;
  return value;
};

const isTrueValue = (value: string | undefined): boolean => {
  return typeof value === 'string' && value.toLowerCase() === 'true';
};

export const getNextPublicProjectId = () =>
  sanitize(process.env.NEXT_PUBLIC_PROJECT_ID) || '';

export const getNextPublicFirebaseApiKey = () =>
  sanitize(process.env.NEXT_PUBLIC_FIREBASE_API_KEY) || '';

export const getNextPublicFirebaseAuthDomain = () =>
  sanitize(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN) || '';

export const getNextPublicFirebaseStorageBucket = () =>
  sanitize(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) || '';

export const getNextPublicFirebaseMessagingSenderId = () =>
  sanitize(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID) || '';

export const getNextPublicFirebaseAppId = () =>
  sanitize(process.env.NEXT_PUBLIC_FIREBASE_APP_ID);

export const getNextPublicStripeEnabled = () =>
  isTrueValue(process.env.NEXT_PUBLIC_STRIPE_ENABLED);

export const getNextPublicUseHttps = () =>
  isTrueValue(process.env.NEXT_PUBLIC_USE_HTTPS);

export const getNextPublicOrigin = () =>
  sanitize(process.env.NEXT_PUBLIC_ORIGIN);

export const getNextPublicPort = () => sanitize(process.env.NEXT_PUBLIC_PORT);

export const getNextPublicDebugAuth = () =>
  isTrueValue(process.env.NEXT_PUBLIC_DEBUG_AUTH);

export const getNextPublicDebugCredentialsDanger = () =>
  isTrueValue(process.env.NEXT_PUBLIC_DEBUG_CREDENTIALS_DANGER);

export const getNextPublicDebugLinks = () =>
  isTrueValue(process.env.NEXT_PUBLIC_DEBUG_LINKS);

export const getNextPublicDebugDatastore = () =>
  isTrueValue(process.env.NEXT_PUBLIC_DEBUG_DATASTORE);

export const getNextPublicE2eTesting = () =>
  isTrueValue(process.env.NEXT_PUBLIC_E2E_TESTING);

export const getNextPublicFirebaseAuthEmulatorHost = () =>
  sanitize(process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST);

export const getNextPublicFirestoreEmulatorHost = () =>
  sanitize(process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST);

export const getNextPublicStripeApiKey = () =>
  sanitize(process.env.NEXT_PUBLIC_STRIPE_API_KEY);

export const getNextPublicStripeApiVersion = () =>
  sanitize(process.env.NEXT_PUBLIC_STRIPE_API_VERSION);

// Client-Safe Derived Constants
export const ENV_MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export const ENV_STRIPE_ENABLED = getNextPublicStripeEnabled();

export const ENV_USE_HTTPS = getNextPublicUseHttps();

export const ENV_URL_PREFIX = ENV_USE_HTTPS
  ? `https://${getNextPublicOrigin() || 'localhost'}`
  : `http://localhost:${getNextPublicPort() || process.env.PORT || 3000}`;

export const ENV_DEBUG_AUTH = getNextPublicDebugAuth();

export const ENV_DEBUG_CREDENTIALS_DANGER =
  getNextPublicDebugCredentialsDanger();

export const ENV_DEBUG_LINKS = getNextPublicDebugLinks();

export const ENV_DEBUG_DATASTORE = getNextPublicDebugDatastore();

export const ENV_E2E_TESTING = getNextPublicE2eTesting();

export const ENV_IS_BUILD = process.env.NEXT_PHASE === 'phase-production-build';

export const ENV_IS_TEST_ENV = process.env.NODE_ENV === 'test';

export const ENV_IS_DEVELOPMENT_ENV = process.env.NODE_ENV === 'development';

export const ENV_FIREBASE_AUTH_EMULATOR_HOST =
  getNextPublicFirebaseAuthEmulatorHost();

export const ENV_FIRESTORE_EMULATOR_HOST = getNextPublicFirestoreEmulatorHost();

export const ENV_NEXT_PUBLIC_PROJECT_ID = getNextPublicProjectId();

export const ENV_NEXT_PUBLIC_FIREBASE_API_KEY = getNextPublicFirebaseApiKey();

export const ENV_NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN =
  getNextPublicFirebaseAuthDomain();

export const ENV_NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET =
  getNextPublicFirebaseStorageBucket();

export const ENV_NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID =
  getNextPublicFirebaseMessagingSenderId();

export const ENV_NEXT_PUBLIC_FIREBASE_APP_ID = getNextPublicFirebaseAppId();

export const ENV_IS_NEXT_RUNTIME_NODEJS = process.env.NEXT_RUNTIME === 'nodejs';

export const ENV_DOTENV_SECRETS = isTrueValue(process.env.DOTENV_SECRETS);

export const ENV_E2E_TESTING_USER =
  process.env.E2E_TESTING_USER ?? 'test-user-id-not-specified';
