import { expect, test } from './fixtures';

import {
  useE2eTestingUserBeforeEach,
  useMockedDateBeforeEach,
} from './util/e2e-test-utils';

test.describe('account', () => {
  useE2eTestingUserBeforeEach();
  useMockedDateBeforeEach();
  test('basic', async ({ page }) => {
    await page.goto('/account');
    await expect(page.getByRole('heading', { name: 'E2E User' })).toBeVisible();
    await expect(page).toHaveScreenshot({ fullPage: true });
  });

  test('shows overlay on hover', async ({ page }) => {
    await page.goto('/account');
    const avatarContainer = page.getByTestId('avatar-container');
    await avatarContainer.hover();
    await expect(page.getByText('Upload Photo')).toBeVisible();
    await expect(avatarContainer).toHaveScreenshot();
  });
});
