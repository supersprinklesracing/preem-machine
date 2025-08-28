import { AuthContextUser } from './AuthContext';
import { verifyAuthUser } from './user';

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'AuthError';
    this.status = status;
  }
}

export async function verifyUserRole(
  requiredRole: string,
): Promise<AuthContextUser> {
  const user = await verifyAuthUser();
  const roles = user.customClaims?.role;
  if (!Array.isArray(roles) || !roles.includes(requiredRole)) {
    throw new AuthError(
      `Forbidden: User does not have the '${requiredRole}' role.`,
      403,
    );
  }

  return user;
}
