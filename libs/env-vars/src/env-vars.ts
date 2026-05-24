export interface EnvVars {
  // Client-exposed environment variables (prefixed with NEXT_PUBLIC_)
  NEXT_PUBLIC_PROJECT_ID: string;
  NEXT_PUBLIC_FIREBASE_API_KEY: string;
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: string;
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: string;
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: string;
  NEXT_PUBLIC_FIREBASE_APP_ID?: string;
  NEXT_PUBLIC_STRIPE_ENABLED?: string;
  NEXT_PUBLIC_USE_HTTPS?: string;
  NEXT_PUBLIC_ORIGIN?: string;
  NEXT_PUBLIC_PORT?: string;
  NEXT_PUBLIC_DEBUG_AUTH?: string;
  NEXT_PUBLIC_DEBUG_CREDENTIALS_DANGER?: string;
  NEXT_PUBLIC_DEBUG_LINKS?: string;
  NEXT_PUBLIC_DEBUG_DATASTORE?: string;
  NEXT_PUBLIC_E2E_TESTING?: string;
  NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST?: string;
  NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST?: string;
  NEXT_PUBLIC_STRIPE_API_KEY?: string;
  NEXT_PUBLIC_STRIPE_API_VERSION?: string;

  // Server-only environment variables
  SERVICE_ACCOUNT_PRIVATE_KEY?: string;
  SERVICE_ACCOUNT_CLIENT_EMAIL?: string;
  AUTH_COOKIE_SIGNATURE_KEY_CURRENT?: string;
  AUTH_COOKIE_SIGNATURE_KEY_PREVIOUS?: string;
  STRIPE_API_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  STRIPE_API_VERSION?: string;
  DOTENV_SECRETS?: string;
  DEBUG_CREDENTIALS_DANGER?: string;
  DEBUG_LINKS?: string;
  DEBUG_DATASTORE?: string;
  E2E_TESTING?: string;
  E2E_TESTING_USER?: string;
  STRAVA_CLIENT_ID?: string;
  STRAVA_CLIENT_SECRET?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;

  // Standard/System variables
  NODE_ENV?: 'development' | 'production' | 'test';
  CI?: string;
  IS_CI?: string;
  PORT?: string;
  NEXT_PHASE?: string;
  NEXT_RUNTIME?: string;
  GCLOUD_PROJECT?: string;
  FIREBASE_PROJECT_ID?: string;
}
