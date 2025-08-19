export const ENV_USES_HTTPS = [
  process.env.DISABLE_HTTPS,
  process.env.NEXT_PUBLIC_DISABLE_HTTPS,
].includes('true');

export const URL_PREFIX = ENV_USES_HTTPS
  ? `https//${process.env.NEXT_PUBLIC_ORIGIN}`
  : 'http://localhost:3000';
