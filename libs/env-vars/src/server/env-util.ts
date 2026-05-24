import type { EnvVars } from '../env-vars';

const isTrueValue = (value: string | undefined): boolean => {
  return typeof value === 'string' && value.toLowerCase() === 'true';
};

export const isTrue = (key: keyof EnvVars): boolean => {
  return isTrueValue(optional(key));
};

const sanitize = (value: string | undefined): string | undefined => {
  if (typeof value !== 'string') return undefined;
  const lower = value.toLowerCase();
  if (lower === 'undefined' || lower === 'null') return undefined;
  return value;
};

export const optional = (key: keyof EnvVars): string | undefined => {
  const value = (process.env as unknown as Record<string, string | undefined>)[
    key as string
  ];
  return sanitize(value);
};

export const required = (key: keyof EnvVars): string => {
  const value = optional(key);
  if (value === undefined) {
    if (
      process.env.NEXT_PHASE === 'phase-production-build' ||
      process.env.NODE_ENV === 'test'
    ) {
      console.warn(
        `⚠️ [fallback] process.env.${key as string} not defined. Returning placeholder.`,
      );
      return `placeholder-for-${key as string}`;
    }
    throw new Error(`process.env.${key as string} not defined`);
  }
  return value;
};

export const getEnvValue = (key: keyof EnvVars): string | undefined =>
  optional(key);

export function isBrowser(): boolean {
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'test') {
    return false;
  }
  return 'window' in globalThis;
}

export function assertNotBrowser(): void {
  if (isBrowser()) {
    throw new Error(
      'This module cannot be imported from a Client Component. It should only be used from a Server Component or Node.js environment.',
    );
  }
}
