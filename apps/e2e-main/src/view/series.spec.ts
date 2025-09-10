import { expect, test } from '@playwright/test';
import { useE2eTestingUserBeforeEach } from '../e2e-test-utils';

test.describe('view/series logged in user', () => {
  useE2eTestingUserBeforeEach();

  test('basic', async ({ page }) => {
    await page.goto('/org-super-sprinkles/series-sprinkles-2025');
    await expect(
      page.getByRole('heading', { name: 'Sprinkles 2025' }),
    ).toBeVisible();
    await expect(page).toHaveScreenshot();
  });
});
