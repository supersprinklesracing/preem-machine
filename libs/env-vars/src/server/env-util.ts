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
      process.env.NODE_ENV === 'test' ||
      process.env.E2E_TESTING === 'true'
    ) {
      console.warn(
        `⚠️ [fallback] process.env.${key as string} not defined. Returning placeholder.`,
      );
      if (key === 'SERVICE_ACCOUNT_PRIVATE_KEY') {
        return '-----BEGIN RSA PRIVATE KEY-----\nMIIBOgIBAAJBAKj34GkxFhD90vcNLYLInFEX6Ppy1tPf9Cnzj4p4WGeKLs1Pt8Qu\nKUpRKfFLfRYC9AIKjbJTWit+CqvjWYzvQwECAwEAAQJAIJLixBy2qpFoS4DSmoEm\no3qGy0t6z09AIJtH+5OeRV1be+N4cDYJKffGzDa88vQENZiRm0GRq6a+HPGQMd2k\nTQIhAKMSvzIBnni7ot/OSie2TmJLY4SwTQAevXysE2RbFDYdAiEBCUEaRQnMnbp7\n9mxDXDf6AU0cN/RPBjb9qSHDcWZHGzUCIG2Es59z8ugGrDY+pxLQnwfotadxd+Uy\nv/Ow5T0q5gIJAiEAyS4RaI9YG8EWx/2w0T67ZUVAw8eOMB6BIUg0Xcu+3okCIBOs\n/5OiPgoTdSy7bcF9IGpSE8ZgGKzgYQVZeN97YE00\n-----END RSA PRIVATE KEY-----\n';
      }
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
