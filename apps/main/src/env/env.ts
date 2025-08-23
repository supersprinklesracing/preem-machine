export const orThrow = (value: string | undefined): string => {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value;
  }
  // For now, we don't actually throw.
  // throw new Error(`Missing required environment variable!`);
  console.error(`Missing required environment variable!`, new Error().stack);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return value!;
};

export const isTrue = (value: string | undefined): boolean => {
  return value?.toLowerCase() === 'true';
};

export const ENV_USE_HTTPS = ![process.env.NEXT_PUBLIC_DISABLE_HTTPS].includes(
  'true',
);

export const ENV_URL_PREFIX = ENV_USE_HTTPS
  ? `https//${process.env.NEXT_PUBLIC_ORIGIN}`
  : `http://localhost:${process.env.NEXT_PUBLIC_PORT ?? process.env.PORT ?? 3000}`;

export const ENV_AUTH_DEBUG = isTrue(process.env.NEXT_PUBLIC_AUTH_DEBUG);
