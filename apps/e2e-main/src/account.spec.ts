import {
  useE2eTestingUserBeforeEach,
} from './util/e2e-test-utils';
import { expect, test } from './util/fixtures';

test.describe('account', () => {
  useE2eTestingUserBeforeEach();
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
