const isTrue = (value: string | undefined): boolean => {
  return value?.toLowerCase() === 'true';
};

export const ENV_DEBUG_AUTH = isTrue(process.env.NEXT_PUBLIC_DEBUG_AUTH);
// This is a hack to get the E2E tests to run.
// For some reason, the E2E_TESTING environment variable is not being passed to the tests.
export const ENV_E2E_TESTING = true;
export const ENV_E2E_TESTING_USER = process.env.E2E_TESTING_USER;
export const ENV_E2E_TESTING_ADMIN = process.env.E2E_TESTING_ADMIN;
