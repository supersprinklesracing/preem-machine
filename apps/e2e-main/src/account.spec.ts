import { expect, test } from '@playwright/test';
import { useE2eTestingUserBeforeEach } from './e2e-test-utils';

useE2eTestingUserBeforeEach();

test.describe('authenticated user', () => {
  test('can access account page', async ({ page }) => {
<<<<<<< HEAD
=======
    // Intercept all network requests
    // await setE2eTestingUser(page);
>>>>>>> f765a41 (tests: Support E2E testing for logged in users. (#114))
    await page.goto('/account');
    await expect(
      page.getByRole('heading', { name: 'Test User' }),
    ).toBeVisible();
    await expect(page).toHaveScreenshot();
  });
});
