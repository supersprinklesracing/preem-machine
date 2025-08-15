import { User } from '@/auth/AuthContext';
import { authConfigFn } from '@/firebase-admin/config';
import { getTokens, Tokens } from 'next-firebase-auth-edge';
import { filterStandardClaims } from 'next-firebase-auth-edge/lib/auth/claims';
import { cookies, headers } from 'next/headers';

export const toUser = ({ token, customToken, decodedToken }: Tokens): User => {
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

export const getUserFromCookies = async () => {
  const authConfig = await authConfigFn();
  const tokens = await getTokens(await cookies(), {
    ...authConfig,
    headers: await headers(),
  });

  if (!tokens) {
    return null;
  }

  return toUser(tokens);
};
