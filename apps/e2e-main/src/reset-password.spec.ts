import { expect, test } from './util/fixtures';

test.describe('reset-password', () => {
  test.describe('unauthed', () => {
    test('basic', async ({ page }) => {
      await page.goto('/reset-password');
      await expect(
        page.getByRole('heading', { name: 'Reset Password' }),
      ).toBeVisible();
      await expect(page).toHaveScreenshot({ fullPage: true });
    });
  });
  test.describe('authed', () => {
    test('basic', async ({ page }) => {
      import { expect } from './util/fixtures';
      await page.goto('/reset-password');
      await expect(
        page.getByRole('heading', { name: 'Reset Password' }),
      ).toBeVisible();
      await expect(page).toHaveScreenshot({ fullPage: true });
    });
  });
});
