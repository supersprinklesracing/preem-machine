import type { UserRecord } from 'firebase-admin/auth';
import { Tokens } from 'next-firebase-auth-edge';
import { filterStandardClaims } from 'next-firebase-auth-edge/auth/claims';

import { AuthUser } from '../user';

export const toAuthContextUserFromUserRecord = (
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
export const toAuthContextUserFromTokens = ({
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
