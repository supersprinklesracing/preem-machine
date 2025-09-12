const isTrue = (value: string | undefined): boolean => {
  return value?.toLowerCase() === 'true';
};

export const ENV_DEBUG_AUTH = isTrue(process.env.NEXT_PUBLIC_DEBUG_AUTH);
export const ENV_E2E_TESTING = isTrue(process.env.E2E_TESTING);
export const ENV_E2E_TESTING_USER =
  process.env.E2E_TESTING_USER ?? 'test-user-id';
export const ENV_E2E_TESTING_ADMIN = process.env.E2E_TESTING_ADMIN;
