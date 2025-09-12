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
import { clientConfig } from './config';
import {
  ENV_FIREBASE_AUTH_EMULATOR_HOST,
  ENV_FIRESTORE_EMULATOR_HOST,
} from '@/env/env';

export const getFirebaseApp = () => {
  if (getApps().length) {
    return getApp();
  }

  const app = initializeApp(clientConfig);

  return app;
};

export function getFirebaseAuth() {
  const auth = getAuth(getFirebaseApp());

  // App relies only on server token. We make sure Firebase does not store credentials in the browser.
  // See: https://github.com/awinogrodzki/next-firebase-auth-edge/issues/143
  setPersistence(auth, inMemoryPersistence);

  if (ENV_FIREBASE_AUTH_EMULATOR_HOST) {
    // https://stackoverflow.com/questions/73605307/firebase-auth-emulator-fails-intermittently-with-auth-emulator-config-failed
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (auth as unknown as any)._canInitEmulator = true;
    connectAuthEmulator(auth, `http://${ENV_FIREBASE_AUTH_EMULATOR_HOST}`, {
      disableWarnings: true,
    });
  }

  return auth;
}

let emulatorConnected = false;
export function getFirestore() {
  // Use together with Firestore Emulator https://cloud.google.com/firestore/docs/emulator#android_apple_platforms_and_web_sdks
  const db = getFirestoreClient(getFirebaseApp());
  if (!emulatorConnected && ENV_FIRESTORE_EMULATOR_HOST) {
    emulatorConnected = true;
    const [host, port] = ENV_FIRESTORE_EMULATOR_HOST.split(':');
    connectFirestoreEmulator(db, host, Number(port));
  }
  return db;
}
