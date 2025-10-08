import { useE2eTestingAdminBeforeEach } from './util/e2e-test-utils';
import { expect, test } from './util/fixtures';

test.describe('admin', () => {
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
