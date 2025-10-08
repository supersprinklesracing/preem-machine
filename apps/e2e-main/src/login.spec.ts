import { useE2eTestingUserBeforeEach } from './util/e2e-test-utils';
import { expect, test } from './util/fixtures';

test.describe('login', () => {
  test.describe('unauthed', () => {
    test('basic', async ({ page }) => {
      await page.goto('/login');
      await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
      await expect(page).toHaveScreenshot({ fullPage: true });
    });
  });
  test.describe('authed', () => {
    useE2eTestingUserBeforeEach();
    test('basic', async ({ page }) => {
      await page.goto('/login');
      await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
      await expect(page).toHaveScreenshot({ fullPage: true });
    });
  });
});
