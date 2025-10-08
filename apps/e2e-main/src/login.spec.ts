import { expect, test } from './fixtures';

import {
  useE2eTestingUserBeforeEach,
  useMockedDateBeforeEach,
} from './util/e2e-test-utils';

test.describe('login', () => {
  useMockedDateBeforeEach();
  test.describe('unauthed', () => {
    test('basic', async ({ page }) => {
      await page.goto('/login');
      await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
      await expect(page).toHaveScreenshot({ fullPage: true });
    });
  });
  test.describe('authed', () => {
    useE2eTestingUserBeforeEach();
    test('basic', async ({ page }) => {
      await page.goto('/login');
      await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
      await expect(page).toHaveScreenshot({ fullPage: true });
    });
  });
});
