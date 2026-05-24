'use server-only';

import admin from 'firebase-admin';

import { ENV_FIREBASE_AUTH_EMULATOR_HOST } from '@/env/env';
import { isServiceAccount } from '@/secrets/service-account-secret';

import { clientConfig } from '../client/config';
import { getServiceAccount } from './config';

const initializeApp = async () => {
  const serviceAccount = await getServiceAccount();

  // Don't use real credentials with Firebase Emulator https://firebase.google.com/docs/emulator-suite/connect_auth#admin_sdks
  if (ENV_FIREBASE_AUTH_EMULATOR_HOST) {
    if (!serviceAccount.projectId) {
      throw new Error(
        `serviceAccount projectId undefined while initializing emulator. serviceAccount: ${serviceAccount}`,
      );
    }
    return admin.initializeApp({
      projectId: serviceAccount.projectId,
      storageBucket: clientConfig.storageBucket,
    });
  }

  if (!isServiceAccount(serviceAccount)) {
    throw new Error(`Invalid service account: ${serviceAccount}`);
  }

  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: clientConfig.storageBucket,
  });
};

export const getFirebaseAdminApp = async () => {
  if (admin.apps.length > 0) {
    return admin.apps[0] as admin.app.App;
  }

  return initializeApp();
};

export const getFirestore = async () => {
  return (await getFirebaseAdminApp()).firestore();
};

export const getFirebaseStorage = async (): Promise<admin.storage.Storage> => {
  return (await getFirebaseAdminApp()).storage();
};

export const getFirebaseAuthAdmin = async () => {
  return (await getFirebaseAdminApp()).auth();
};
