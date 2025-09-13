import { expect, test } from '@playwright/test';
import { useE2eTestingUserBeforeEach } from './util/e2e-test-utils';

useE2eTestingUserBeforeEach();

test.describe('account', () => {
  test('basic', async ({ page }) => {
    // Intercept all network requests
    // await setE2eTestingUser(page);
    await page.goto('/account');
    await expect(
      page.getByRole('heading', { name: 'Test User' }),
    ).toBeVisible();
    await expect(page).toHaveScreenshot();
  });
});
