import type { DecodedIdToken, UserRecord } from 'firebase-admin/auth';

import { AuthUser } from '../user';

const STANDARD_CLAIMS = [
  'iss',
  'sub',
  'aud',
  'exp',
  'nbf',
  'iat',
  'auth_time',
  'acr',
  'amr',
  'azp',
  'firebase',
  'user_id',
  'email',
  'email_verified',
  'name',
  'picture',
  'phone_number',
];

export const filterStandardClaims = (
  claims?: Record<string, unknown>,
): Record<string, unknown> => {
  if (!claims) {
    return {};
  }
  const customClaims: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(claims)) {
    if (!STANDARD_CLAIMS.includes(key)) {
      customClaims[key] = value;
    }
  }
  return customClaims;
};

export const toAuthContextUserFromUserRecord = (
  userRecord: UserRecord,
): AuthUser | null => {
  if (!userRecord) {
    return null;
  }
  const customClaims = filterStandardClaims(
    userRecord.customClaims as Record<string, unknown>,
  );

  return {
    uid: userRecord.uid,
    email: userRecord.email ?? null,
    displayName: userRecord.displayName ?? null,
    photoURL: userRecord.photoURL ?? null,
    phoneNumber: userRecord.phoneNumber ?? null,
    emailVerified: userRecord.emailVerified ?? false,
    providerId: userRecord.providerData[0]?.providerId || 'firebase',
    customClaims: customClaims ?? {},
  };
};

export const toAuthContextUserFromDecodedToken = (
  decodedToken: DecodedIdToken,
  token?: string,
): AuthUser | null => {
  if (!decodedToken) {
    return null;
  }
  const customClaims = filterStandardClaims(
    decodedToken as unknown as Record<string, unknown>,
  );

  return {
    uid: decodedToken.uid,
    email: decodedToken.email ?? null,
    displayName: decodedToken.name ?? null,
    photoURL: decodedToken.picture ?? null,
    phoneNumber: decodedToken.phone_number ?? null,
    emailVerified: decodedToken.email_verified ?? false,
    providerId: decodedToken.firebase?.sign_in_provider || 'firebase',
    customClaims,
    token,
  };
};
