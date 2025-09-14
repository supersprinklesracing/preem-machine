import { expect, test } from '@playwright/test';

test.describe('view: home', () => {
  test('basic', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: 'Upcoming Events' }),
    ).toBeVisible();
    await expect(page).toHaveScreenshot({ fullPage: true });
  });
});
