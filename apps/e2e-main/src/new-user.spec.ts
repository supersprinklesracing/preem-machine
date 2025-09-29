import { expect, test } from '@playwright/test';

import {
  useE2eTestingUserBeforeEach,
  useMockedDateBeforeEach,
} from './util/e2e-test-utils';

test.describe('new-user', () => {
  useE2eTestingUserBeforeEach();
  useMockedDateBeforeEach();
  test('basic', async ({ page }) => {
    await page.goto('/new-user');
    await expect(page.getByRole('heading', { name: 'E2E User' })).toBeVisible();
    await expect(page).toHaveScreenshot({ fullPage: true });
  });

  test('shows overlay on hover', async ({ page }) => {
    await page.goto('/new-user');
    const avatarContainer = page.getByTestId('avatar-container');
    await avatarContainer.hover();
    await expect(page.getByText('Upload Photo')).toBeVisible();
    await expect(avatarContainer).toHaveScreenshot();
  });
});
