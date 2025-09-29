/* Base level authentication. Should only be called from the @/user module. */

import { cookies, headers } from 'next/headers';
import { getTokens, Tokens } from 'next-firebase-auth-edge';
import { filterStandardClaims } from 'next-firebase-auth-edge/lib/auth/claims';

import { serverConfigFn } from '@/firebase/server/config';

import { ENV_E2E_TESTING } from '../../env/env';
import { AuthUser } from '../user';

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

const toAuthContextUserFromTokens = ({
  token,
  customToken,
  decodedToken,
}: Tokens): AuthUser | null => {
  if (!decodedToken) {
    return null;
  }
  const customClaims = filterStandardClaims(decodedToken);

  return {
    uid: decodedToken.uid,
    email: decodedToken.email ?? null,
    displayName: decodedToken.name ?? null,
    photoURL: decodedToken.picture ?? null,
    phoneNumber: decodedToken.phone_number ?? null,
    emailVerified: decodedToken.email_verified ?? false,
    providerId: decodedToken.source_sign_in_provider,
    customClaims,
    token,
    customToken,
  };
};
