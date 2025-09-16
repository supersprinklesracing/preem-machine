import { AuthUser } from '../user';
import { serverConfigFn } from '@/firebase/server/config';
import { getTokens, Tokens } from 'next-firebase-auth-edge';
import { filterStandardClaims } from 'next-firebase-auth-edge/lib/auth/claims';
import { cookies, headers } from 'next/headers';
import { unauthorized } from 'next/navigation';
import { NextRequest } from 'next/server';
import { ENV_E2E_TESTING } from '../../env/env';
import { AuthError } from '../errors';

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

export const verifyAuthUser = async (): Promise<AuthUser> => {
  const authUser = await getAuthUser();
  if (!authUser) {
    unauthorized();
  }
  return authUser;
};

export async function getAuthUserFromRequest(request: NextRequest) {
  const serverConfig = await serverConfigFn();
  const tokens = await getTokens(request.cookies, serverConfig);
  if (!tokens) {
    return null;
  }

  // TODO: Need to figure this out.
  // Not sure the difference between getting thie user from getUser
  // vs getting it out of the request.
  // const { getUser } = await getFirebaseAuth();
  // const userRecord = await getUser(tokens.decodedToken.uid);
  // const fromUserRecord = toAuthContextUserFromUserRecord(userRecord);
  return toAuthContextUserFromTokens(tokens);
}

export const verifyAuthUserFromRequest = async (
  request: NextRequest,
): Promise<AuthUser> => {
  const authUser = await getAuthUserFromRequest(request);
  if (!authUser) {
    unauthorized();
  }
  return authUser;
};

export async function verifyUserRole(
  request: NextRequest,
  requiredRole: string,
): Promise<AuthUser> {
  const user = await getAuthUserFromRequest(request);
  if (!user) {
    unauthorized();
  }

  const roles = user.customClaims?.role;
  if (!Array.isArray(roles) || !roles.includes(requiredRole)) {
    throw new AuthError(
      `Forbidden: User does not have the '${requiredRole}' role.`,
      403,
    );
  }

  return user;
}

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

// TODO: Need to figure this out.
// Not sure the difference between getting thie user from getUser
// vs getting it out of the request.
// const { getUser } = await getFirebaseAuth();
// const userRecord = await getUser(tokens.decodedToken.uid);
// const fromUserRecord = toAuthContextUserFromUserRecord(userRecord);
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
function toAuthContextUserFromUserRecord(userRecord: any): AuthUser {
  return {
    uid: userRecord.uid,
    email: userRecord.email,
    displayName: userRecord.displayName,
    photoURL: userRecord.photoURL,
    phoneNumber: userRecord.phoneNumber,
    emailVerified: !!userRecord.emailVerified,
    providerId: userRecord.providerData[0]?.providerId,
    customClaims: userRecord.customClaims,
    token: userRecord.token,
    customToken: userRecord.customToken,
  };
}
