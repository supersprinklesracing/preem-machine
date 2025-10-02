import { expect, test } from '@playwright/test';

import {
  useE2eTestingAdminBeforeEach,
  useMockedDateBeforeEach,
} from './util/e2e-test-utils';

test.describe('admin', () => {
  useMockedDateBeforeEach();
  useE2eTestingAdminBeforeEach();

  test('basic', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveScreenshot({ fullPage: true });
  });

  test('org modal', async ({ page }) => {
    await page.goto('/admin');

    // Use a locator that finds the first visible button with this test id
    await page.locator('[data-testid="assign-org-button"]:visible').first().click();

    await expect(
      page.getByRole('heading', { name: 'Assign Organization' }),
    ).toBeVisible();
    await expect(page).toHaveScreenshot({ fullPage: true });
  });
});