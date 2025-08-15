import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  connectAuthEmulator,
  getAuth,
  inMemoryPersistence,
  setPersistence,
} from 'firebase/auth';
import {
  connectFirestoreEmulator,
  getFirestore as getFirestoreClient,
} from 'firebase/firestore';
import { getOrInitializeAppCheck } from '../auth/app-check';
import { clientConfig } from './config';

export const getFirebaseApp = () => {
  if (getApps().length) {
    return getApp();
  }

  const app = initializeApp(clientConfig);

  if (process.env.NEXT_PUBLIC_FIREBASE_APP_CHECK_KEY) {
    getOrInitializeAppCheck(app);
  }

  return app;
};

export function getFirebaseAuth() {
  const auth = getAuth(getFirebaseApp());

  // App relies only on server token. We make sure Firebase does not store credentials in the browser.
  // See: https://github.com/awinogrodzki/next-firebase-auth-edge/issues/143
  setPersistence(auth, inMemoryPersistence);

  if (process.env.NEXT_PUBLIC_AUTH_EMULATOR_HOST) {
    // https://stackoverflow.com/questions/73605307/firebase-auth-emulator-fails-intermittently-with-auth-emulator-config-failed
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (auth as unknown as any)._canInitEmulator = true;
    connectAuthEmulator(
      auth,
      `http://${process.env.NEXT_PUBLIC_AUTH_EMULATOR_HOST}`,
      {
        disableWarnings: true,
      }
    );
  }

  if (clientConfig.tenantId) {
    auth.tenantId = clientConfig.tenantId;
  }

  return auth;
}

let emulatorConnected = false;
export function getFirestore() {
  // Use together with Firestore Emulator https://cloud.google.com/firestore/docs/emulator#android_apple_platforms_and_web_sdks
  const db = getFirestoreClient(getFirebaseApp());
  if (!emulatorConnected && process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST) {
    emulatorConnected = true;
    const [host, port] =
      process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST.split(':');
    connectFirestoreEmulator(db, host, Number(port));
  }
  return db;
}
