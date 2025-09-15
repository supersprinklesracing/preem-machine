export const orThrow = (value: string | undefined): string => {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value;
  }
  //throw new Error(`Missing required environment variable!`);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return value!;
};

const isTrue = (value: string | undefined): boolean => {
  return value?.toLowerCase() === 'true';
};

export const ENV_STRIPE_ENABLED = isTrue(
  process.env.NEXT_PUBLIC_STRIPE_ENABLED,
);

export const ENV_DOTENV_SECRETS = isTrue(process.env.DOTENV_SECRETS);
export const ENV_USE_HTTPS = isTrue(process.env.NEXT_PUBLIC_USE_HTTPS);

export const ENV_URL_PREFIX = ENV_USE_HTTPS
  ? `https//${process.env.NEXT_PUBLIC_ORIGIN}`
  : `http://localhost:${process.env.NEXT_PUBLIC_PORT ?? process.env.PORT ?? 3000}`;

export const ENV_DEBUG_AUTH = isTrue(process.env.NEXT_PUBLIC_DEBUG_AUTH);
export const ENV_DEBUG_CREDENTIALS_DANGER =
  isTrue(process.env.DEBUG_CREDENTIALS_DANGER) ||
  isTrue(process.env.NEXT_PUBLIC_DEBUG_CREDENTIALS_DANGER);
export const ENV_DEBUG_LINKS =
  isTrue(process.env.NEXT_PUBLIC_DEBUG_LINKS) ||
  isTrue(process.env.DEBUG_LINKS);

export const ENV_E2E_TESTING =
  isTrue(process.env.E2E_TESTING) ||
  isTrue(process.env.NEXT_PUBLIC_E2E_TESTING);
export const ENV_E2E_TESTING_USER =
  process.env.E2E_TESTING_USER ?? 'test-user-id-not-specified';

export const ENV_IS_BUILD = process.env.NEXT_PHASE === 'phase-production-build';
export const ENV_IS_TEST_ENV = process.env.NODE_ENV === 'test';
export const ENV_IS_DEVELOPMENT_ENV = process.env.NODE_ENV === 'development';

export const ENV_IS_NEXT_RUNTIME_NODEJS = process.env.NEXT_RUNTIME === 'nodejs';

export const ENV_FIREBASE_AUTH_EMULATOR_HOST = (() => {
  if (ENV_IS_NEXT_RUNTIME_NODEJS) {
    if (
      (!!process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST ||
        !!process.env.FIREBASE_AUTH_EMULATOR_HOST) &&
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST !=
        process.env.FIREBASE_AUTH_EMULATOR_HOST
    ) {
      throw new Error(
        `Initialized with inconsistent emulator values: ` +
          `NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST=${process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST}` +
          `FIREBASE_AUTH_EMULATOR_HOST=${process.env.FIREBASE_AUTH_EMULATOR_HOST}`,
      );
    }
    return process.env.FIREBASE_AUTH_EMULATOR_HOST;
  } else {
    return process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST;
  }
})();

export const ENV_FIRESTORE_EMULATOR_HOST = (() => {
  if (ENV_IS_NEXT_RUNTIME_NODEJS) {
    if (
      (!!process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST ||
        !!process.env.FIRESTORE_EMULATOR_HOST) &&
      process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST !=
        process.env.FIRESTORE_EMULATOR_HOST
    ) {
      throw new Error(
        `Initialized with inconsistent emulator values: ` +
          `NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST=${process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST}` +
          `FIRESTORE_EMULATOR_HOST=${process.env.FIRESTORE_EMULATOR_HOST}`,
      );
    }
    return process.env.FIRESTORE_EMULATOR_HOST;
  } else {
    return process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST;
  }
})();
