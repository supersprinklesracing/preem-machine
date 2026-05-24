export class AuthorizationError extends Error {}
export class InvalidPathError extends Error {}
export class NotFoundError extends Error {}

export function unauthorized(message = 'Unauthorized'): never {
  throw new AuthorizationError(message);
}

export function notFound(message?: string, cause?: Error): never {
  throw new NotFoundError(message, { cause });
}
