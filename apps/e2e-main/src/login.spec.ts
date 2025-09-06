import { test, expect } from '@playwright/test';

test.describe('login-page', () => {
  test('has title', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
  });
  test('screenshot', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveScreenshot();
  });
});
