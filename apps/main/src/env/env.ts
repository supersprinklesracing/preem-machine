export const orThrow = (value: string | undefined): string => {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value;
  }
  //throw new Error(`Missing required environment variable!`);
  return value!;
};

export const isTrue = (value: string | undefined): boolean => {
  return value?.toLowerCase() === 'true';
};

export const ENV_USE_HTTPS = isTrue(process.env.NEXT_PUBLIC_USE_HTTPS);

export const ENV_URL_PREFIX = ENV_USE_HTTPS
  ? `https//${process.env.NEXT_PUBLIC_ORIGIN}`
  : `http://localhost:${process.env.NEXT_PUBLIC_PORT ?? process.env.PORT ?? 3000}`;

export const ENV_AUTH_DEBUG = isTrue(process.env.NEXT_PUBLIC_AUTH_DEBUG);

export const ENV_FIREBASE_AUTH_EMULATOR_HOST = (() => {
  // On the nodeJS side, if our emulator configs do not agree, that is a problem.
  if (process.env.NEXT_RUNTIME === 'nodejs') {
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
  }
  // Client Side
  return process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST;
})();

export const ENV_FIRESTORE_EMULATOR_HOST = (() => {
  // On the nodeJS side, if our emulator configs do not agree, that is a problem.
  if (process.env.NEXT_RUNTIME === 'nodejs') {
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
  }
  return process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST;
})();
