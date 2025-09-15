import { AuthContextUser } from '../user';
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
      const authUser = JSON.parse(e2eAuthUser) as AuthContextUser;
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

export const verifyAuthUser = async (): Promise<AuthContextUser> => {
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
    throw new Error('Unauthenticated');
  }

  return toAuthContextUserFromTokens(tokens);
}

export const verifyAuthUserFromRequest = async (
  request: NextRequest,
): Promise<AuthContextUser> => {
  const authUser = await getAuthUserFromRequest(request);
  if (!authUser) {
    unauthorized();
  }
  return authUser;
};

export async function verifyUserRole(
  request: NextRequest,
  requiredRole: string,
): Promise<AuthContextUser> {
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
}: Tokens): AuthContextUser => {
  if (!decodedToken) {
    throw unauthorized();
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

