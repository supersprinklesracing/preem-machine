import { expect, test } from './fixtures';

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
    await page
      .locator('[data-testid="assign-org-button"]')
      .locator('visible=true')
      .first()
      .click();
    await expect(
      page.getByRole('heading', { name: 'Assign Organization' }),
    ).toBeVisible();
    await expect(page).toHaveScreenshot({ fullPage: true });
  });
});
