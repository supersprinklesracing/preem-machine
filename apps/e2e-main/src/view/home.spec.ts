import { expect, test } from '@playwright/test';
import { useE2eTestingUserBeforeEach } from '../e2e-test-utils';

test.describe('view/home logged in user', () => {
  useE2eTestingUserBeforeEach();

  test('basic', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: 'Upcoming Events' }),
    ).toBeVisible();
    await expect(page).toHaveScreenshot();
  });
});
