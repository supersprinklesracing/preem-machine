import { test, expect } from '@playwright/test';

test.describe('authenticated user', () => {
  test.use({
    extraHTTPHeaders: {
      'x-e2e-auth-user': JSON.stringify({
        uid: 'test-user-id',
        email: 'test-user@example.com',
        displayName: 'Test User',
        customClaims: {
          admin: true,
        },
      }),
    },
  });

  test('can access account page', async ({ page }) => {
    await page.goto('/account');
    await expect(
      page.getByRole('heading', { name: 'Account' }),
    ).toBeVisible();
  });
});
