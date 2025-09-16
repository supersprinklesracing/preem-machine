import { expect, test } from '@playwright/test';
import {
  useE2eTestingUserBeforeEach,
  useMockedDateBeforeEach,
} from './util/e2e-test-utils';

test.describe('account', () => {
  useE2eTestingUserBeforeEach();
  useMockedDateBeforeEach();
  test('basic', async ({ page }) => {
    // Intercept all network requests
    // await setE2eTestingUser(page);
    await page.goto('/account');
    await expect(page.getByRole('heading', { name: 'E2E User' })).toBeVisible();
    await expect(page).toHaveScreenshot({ fullPage: true });
  });
});
