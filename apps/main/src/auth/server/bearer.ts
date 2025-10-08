'use server';

import { headers } from 'next/headers';
import { DecodedIdToken } from 'firebase-admin/auth';
import { getFirebaseAdminApp } from '@/firebase/server/firebase-admin';

export const verifyBearerToken = async (): Promise<DecodedIdToken | null> => {
  const authorization = headers().get('Authorization');
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