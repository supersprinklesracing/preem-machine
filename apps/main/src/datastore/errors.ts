export class NotFoundError extends Error {}

export function unauthorized(): never {
  throw new Error('Unauthorized');
}

export function notFound(message?: string, cause?: Error): never {
  throw new NotFoundError(message, { cause });
}
