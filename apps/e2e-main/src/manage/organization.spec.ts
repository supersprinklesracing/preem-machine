import { expect, test } from '@playwright/test';
import { useE2eTestingUserBeforeEach } from '../e2e-test-utils';

test.describe('manage/organization logged in user', () => {
  useE2eTestingUserBeforeEach();

  test('basic', async ({ page }) => {
    await page.goto('/manage/org-super-sprinkles');
    await expect(
      page.getByRole('heading', { name: 'Super Sprinkles Racing' }),
    ).toBeVisible();
    await expect(page).toHaveScreenshot();
  });
});
