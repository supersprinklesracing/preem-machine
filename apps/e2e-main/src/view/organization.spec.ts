import { expect, test } from '@playwright/test';

test.describe('view: organization', () => {
  test('basic', async ({ page }) => {
    await page.goto('/org-super-sprinkles');
    await expect(
      page.getByRole('heading', { name: 'Super Sprinkles Racing' }),
    ).toBeVisible();
    await expect(page).toHaveScreenshot({ fullPage: true });
  });
});
