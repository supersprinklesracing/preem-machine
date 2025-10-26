'use server';

import type { DecodedIdToken, UserRecord } from 'firebase-admin/auth';
import { headers } from 'next/headers';
import { filterStandardClaims } from 'next-firebase-auth-edge/auth/claims';

import { getFirebaseAdminApp } from '@/firebase/server/firebase-admin';

import { AuthUser } from '../user';

const getBearerToken = async (): Promise<DecodedIdToken | null> => {
  const authorization = (await headers()).get('Authorization');
  if (!authorization?.startsWith('Bearer ')) {
    return null;
  }

  const [, token] = authorization.split('Bearer ');
  if (!token) {
    return null;
  }

  try {
    const adminApp = await getFirebaseAdminApp();
    return await adminApp.auth().verifyIdToken(token);
  } catch (error) {
    console.error('Error verifying bearer token:', error);
    return null;
  }
};

export const getBearerUser = async (): Promise<AuthUser | null> => {
  const decodedToken = await getBearerToken();
  if (!decodedToken) {
    return null;
  }

  const adminApp = await getFirebaseAdminApp();
  const userRecord = await adminApp.auth().getUser(decodedToken.uid);
  return toAuthContextUserFromUserRecord(userRecord);
};

const toAuthContextUserFromUserRecord = (
  userRecord: UserRecord,
): AuthUser | null => {
  if (!userRecord) {
    return null;
  }
  const customClaims = filterStandardClaims(userRecord.customClaims);

  return {
    uid: userRecord.uid,
    email: userRecord.email ?? null,
    displayName: userRecord.displayName ?? null,
    photoURL: userRecord.photoURL ?? null,
    phoneNumber: userRecord.phoneNumber ?? null,
    emailVerified: userRecord.emailVerified ?? false,
    providerId: userRecord.providerData[0].providerId,
    customClaims: customClaims ?? {},
  };
};
