import { authConfigFn } from '@/firebase-admin/config';
import { getFirebaseAuth } from 'next-firebase-auth-edge/lib/auth';
import { getTokens } from 'next-firebase-auth-edge/lib/next/tokens';
import { cookies } from 'next/headers';
import { AuthContextUser } from './AuthContext';
import { toAuthContextUser } from './user';

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'AuthError';
    this.status = status;
  }
}

export async function verifyUserRole(
  requiredRole: string
): Promise<AuthContextUser> {
  const authConfig = await authConfigFn();
  const tokens = await getTokens(await cookies(), authConfig);

  if (!tokens) {
    throw new AuthError('Unauthorized', 401);
  }

  const { getUser } = getFirebaseAuth({
    serviceAccount: authConfig.serviceAccount,
    apiKey: authConfig.apiKey,
  });

  const userRecord = await getUser(tokens.decodedToken.uid);

  if (!userRecord) {
    throw new AuthError('User not found.', 404);
  }

  const roles = userRecord.customClaims?.role;

  if (!Array.isArray(roles) || !roles.includes(requiredRole)) {
    throw new AuthError(
      `Forbidden: User does not have the '${requiredRole}' role.`,
      403
    );
  }

  return toAuthContextUser(tokens);
}
