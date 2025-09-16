import { test, Page } from '@playwright/test';
import { ENV_E2E_TESTING, ENV_E2E_TESTING_USER } from './e2e-env';

const uid = ENV_E2E_TESTING_USER;
if (!ENV_E2E_TESTING) {
  throw new Error('E2E_TESTING is not set.');
}
if (!uid) {
  throw new Error(
    'Misconfigured E2E Testing User ' + JSON.stringify(process.env),
  );
}

// Note: This works in firefox, but not chrome. See:
// https://g.co/gemini/share/2fce9e37a324
// eslint-disable-next-line unused-imports/no-unused-vars
function setTestExtraHttpHeaders() {
  test.use({
    extraHTTPHeaders: {
      'X-e2e-auth-user': JSON.stringify({
        uid: ENV_E2E_TESTING_USER,
        email: 'test-user@example.com',
        displayName: 'Test User',
        emailVerifed: true,
        customClaims: {},
      }),
    },
  });
}

async function setE2eTestingUser(page: Page) {
  await page.route('**/*', async (route) => {
    const customHeaders = {
      'X-e2e-auth-user': JSON.stringify({
        uid: ENV_E2E_TESTING_USER,
        email: 'test-user@example.com',
        displayName: 'Test User',
        emailVerifed: true,
        customClaims: {},
      }),
    };

    // Get the original headers
    const headers = route.request().headers();

    // Merge original headers with your custom headers
    // The spread operator ensures you don't lose existing headers
    const newHeaders = {
      ...headers,
      ...customHeaders,
    };

    // Continue the request with the new, merged headers
    await route.continue({ headers: newHeaders });
  });
}

export function useE2eTestingUserBeforeEach() {
  test.beforeEach(async ({ page }) => {
    await setE2eTestingUser(page);
  });
}

export function useMockedDateBeforeEach() {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(new Date('2025-07-13T00:00:00-07:00'));
  });
}
