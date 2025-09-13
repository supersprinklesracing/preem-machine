import { expect, test } from '@playwright/test';
import { useE2eTestingUserBeforeEach } from '../util/e2e-test-utils';

test.describe('manage: hub', () => {
  useE2eTestingUserBeforeEach();

  test('basic', async ({ page }) => {
    await page.goto('/manage');
    await expect(
      page.getByRole('heading', { name: 'Organizer Hub' }),
    ).toBeVisible();
    await expect(page).toHaveScreenshot();
  });
});
