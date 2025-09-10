import { expect, test } from '@playwright/test';

test.describe('login/ unauthenticated user', () => {
  test('basic', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
    await expect(page).toHaveScreenshot();
  });
});
