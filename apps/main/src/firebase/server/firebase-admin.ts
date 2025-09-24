'use server-only';

import { isServiceAccount } from '@/secrets/service-account-secret';
import admin from 'firebase-admin';
import { getFirebaseAuth as getFirebaseAuthNext } from 'next-firebase-auth-edge';
// import { getFirestore as getFirestoreBase } from 'firebase-admin/firestore';
// import { getApp as getAppBase } from 'firebase-admin/app';

import type { Auth } from 'next-firebase-auth-edge/auth';
import { serverConfigFn } from './config';
import { ENV_FIREBASE_AUTH_EMULATOR_HOST } from '@/env/env';

const initializeApp = async () => {
  const serverConfig = await serverConfigFn();

  // Don't use real credentials with Firebase Emulator https://firebase.google.com/docs/emulator-suite/connect_auth#admin_sdks
  if (ENV_FIREBASE_AUTH_EMULATOR_HOST) {
    if (!serverConfig.serviceAccount?.projectId) {
      throw new Error(
        `serviceAccount projectId undefined while initializing emulator. serviceAccount: ${serverConfig.serviceAccount}`,
      );
    }
    return admin.initializeApp({
      projectId: serverConfig.serviceAccount.projectId,
    });
  }

  if (!isServiceAccount(serverConfig.serviceAccount)) {
    throw new Error(`Invalid service account: ${serverConfig.serviceAccount}`);
  }

  return admin.initializeApp({
    credential: admin.credential.cert(serverConfig.serviceAccount),
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

export const getFirebaseStorage = async () => {
  return (await getFirebaseAdminApp()).storage();
};

export const getFirebaseAuth = async (): Promise<Auth> => {
  const serverConfig = await serverConfigFn();
  if (!isServiceAccount(serverConfig.serviceAccount)) {
    throw new Error(`Invalid service account: ${serverConfig.serviceAccount}`);
  }
  return getFirebaseAuthNext({
    serviceAccount: serverConfig.serviceAccount,
    apiKey: serverConfig.apiKey,
    // serviceAccountId: ??
    enableCustomToken: serverConfig.enableCustomToken,
  });
};
