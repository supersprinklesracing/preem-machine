import { expect, test } from '@playwright/test';

import {
  useE2eTestingUserBeforeEach,
  useMockedDateBeforeEach,
} from './util/e2e-test-utils';

test.describe('register', () => {
  useMockedDateBeforeEach();
  test.describe('unauthed', () => {
    test('basic', async ({ page }) => {
      await page.goto('/register');
      await expect(
        page.getByRole('heading', { name: 'Register' }),
      ).toBeVisible();
      await expect(page).toHaveScreenshot({ fullPage: true });
    });
  });
  test.describe('authed', () => {
    useE2eTestingUserBeforeEach();
    test('basic', async ({ page }) => {
      await page.goto('/register');
      await expect(
        page.getByRole('heading', { name: 'Register' }),
      ).toBeVisible();
      await expect(page).toHaveScreenshot({ fullPage: true });
    });
  });
});
