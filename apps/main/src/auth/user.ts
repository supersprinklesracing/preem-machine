import { AuthContextUser } from '@/auth/AuthContext';
import { authConfigFn } from '@/firebase-admin/config';
import { getTokens, Tokens } from 'next-firebase-auth-edge';
import { filterStandardClaims } from 'next-firebase-auth-edge/lib/auth/claims';
import { cookies } from 'next/headers';
import { unauthorized } from 'next/navigation';

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
  const authConfig = await authConfigFn();
  const tokens = await getTokens(await cookies(), {
    ...authConfig,
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
