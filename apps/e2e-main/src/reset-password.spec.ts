import { expect, test } from './fixtures';

import {
  useE2eTestingUserBeforeEach,
  useMockedDateBeforeEach,
} from './util/e2e-test-utils';

test.describe('reset-password', () => {
  useMockedDateBeforeEach();
  test.describe('unauthed', () => {
    test('basic', async ({ page }) => {
      await page.goto('/reset-password');
      await expect(
        page.getByRole('heading', { name: 'Reset Password' }),
      ).toBeVisible();
      await expect(page).toHaveScreenshot({ fullPage: true });
    });
  });
  test.describe('authed', () => {
    useE2eTestingUserBeforeEach();
    test('basic', async ({ page }) => {
      await page.goto('/reset-password');
      await expect(
        page.getByRole('heading', { name: 'Reset Password' }),
      ).toBeVisible();
      await expect(page).toHaveScreenshot({ fullPage: true });
    });
  });
});
