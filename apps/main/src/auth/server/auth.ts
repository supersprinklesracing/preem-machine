/* Base level authentication. Should only be called from the @/user module. */
'use server';

import type { DecodedIdToken } from 'firebase-admin/auth';
import { cookies, headers } from 'next/headers';
import { getTokens } from 'next-firebase-auth-edge';

import { serverConfigFn } from '@/firebase/server/config';
import { getFirebaseAdminApp } from '@/firebase/server/firebase-admin';

import { ENV_E2E_TESTING } from '../../env/env';
import { AuthUser } from '../user';
import {
  toAuthContextUserFromTokens,
  toAuthContextUserFromUserRecord,
} from './auth-context-user';

export const getAuthUser = async () => {
  if (ENV_E2E_TESTING) {
    const e2eAuthUser = (await headers()).get('X-e2e-auth-user');
    if (e2eAuthUser) {
      const authUser = JSON.parse(e2eAuthUser) as AuthUser;
      if (!authUser.uid) {
        throw new Error(
          `Misconfigured E2E Testing User in header: ${authUser}`,
        );
      }
      return authUser;
    }
  }
  const serverConfig = await serverConfigFn();
  const tokens = await getTokens(await cookies(), {
    ...serverConfig,
  });

  if (!tokens) {
    return null;
  }

  return toAuthContextUserFromTokens(tokens);
};

const getE2eUser = async (): Promise<AuthUser | null> => {
  if (!ENV_E2E_TESTING) {
    return null;
  }

  const e2eAuthUser = (await headers()).get('X-e2e-auth-user');
  if (!e2eAuthUser) {
    return null;
  }

  try {
    return JSON.parse(e2eAuthUser);
  } catch (error) {
    console.error('Error parsing X-e2e-auth-user header:', error);
    return null;
  }
};

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
  const e2eUser = await getE2eUser();
  if (e2eUser) {
    return e2eUser;
  }

  const decodedToken = await getBearerToken();
  if (!decodedToken) {
    return null;
  }

  try {
    const adminApp = await getFirebaseAdminApp();
    const userRecord = await adminApp.auth().getUser(decodedToken.uid);
    return toAuthContextUserFromUserRecord(userRecord);
  } catch (error) {
    console.error('Error getting user record:', error);
    return null;
  }
};
