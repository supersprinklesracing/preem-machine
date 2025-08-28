import { AuthContextUser } from '@/auth/AuthContext';
import { serverConfigFn } from '@/firebase-admin/config';
import { getFirebaseAuth } from '@/firebase-admin/firebase-admin';
import { getTokens, Tokens } from 'next-firebase-auth-edge';
import type { Auth } from 'next-firebase-auth-edge/auth';
import { filterStandardClaims } from 'next-firebase-auth-edge/lib/auth/claims';
import { cookies } from 'next/headers';
import { unauthorized } from 'next/navigation';
import { NextRequest } from 'next/server';

export type AuthUserBrief = Partial<AuthContextUser> & { id: string };

export const toAuthContextUser = ({
  token,
  customToken,
  decodedToken,
}: Tokens): AuthContextUser => {
  const {
    uid,
    email,
    picture: photoURL,
    email_verified: emailVerified,
    phone_number: phoneNumber,
    name: displayName,
    source_sign_in_provider: signInProvider,
  } = decodedToken;

  const customClaims = filterStandardClaims(decodedToken);

  return {
    id: uid,
    uid,
    email: email ?? null,
    displayName: displayName ?? null,
    photoURL: photoURL ?? null,
    phoneNumber: phoneNumber ?? null,
    emailVerified: emailVerified ?? false,
    providerId: signInProvider,
    customClaims,
    idToken: token,
    customToken,
  };
};

export const getAuthUserFromCookies = async () => {
  const serverConfig = await serverConfigFn();
  const tokens = await getTokens(await cookies(), {
    ...serverConfig,
  });

  if (!tokens) {
    return null;
  }

  return toAuthContextUser(tokens);
};

export const verifyAuthUser = async (): Promise<AuthContextUser> => {
  const authUser = await getAuthUserFromCookies();
  if (!authUser) {
    unauthorized();
  }
  return authUser;
};

export async function getUserFromRequest(request: NextRequest) {
  const serverConfig = await serverConfigFn();
  const tokens = await getTokens(request.cookies, serverConfig);
  if (!tokens) {
    throw new Error('Unauthenticated');
  }

  const auth: Auth = await getFirebaseAuth();
  const { getUser } = auth;
  const userRecord = await getUser(tokens.decodedToken.uid);
  return toUserFromUserRecord(userRecord);
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toUserFromUserRecord(userRecord: any): AuthContextUser {
  const {
    uid,
    email,
    photoURL,
    emailVerified,
    phoneNumber,
    displayName,
    providerId,
  } = userRecord;

  const customClaims = userRecord.customClaims;

  return {
    id: uid,
    uid,
    email: email ?? null,
    displayName: displayName ?? null,
    photoURL: photoURL ?? null,
    phoneNumber: phoneNumber ?? null,
    emailVerified: emailVerified ?? false,
    providerId: providerId,
    customClaims,
    idToken: '', // This will not be available from a UserRecord
    customToken: undefined, // This will not be available from a UserRecord
  };
}
