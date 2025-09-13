import { expect, test } from '@playwright/test';

test.describe('view: series', () => {
  test('basic', async ({ page }) => {
    await page.goto('/org-super-sprinkles/series-sprinkles-2025');
    await expect(
      page.getByRole('heading', { name: 'Sprinkles 2025' }),
    ).toBeVisible();
    await expect(page).toHaveScreenshot();
  });
});
