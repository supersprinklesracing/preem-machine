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
    // The user's name is now part of the ContentCard title
    await expect(page.getByText('E2E User')).toBeVisible();
    await expect(page).toHaveScreenshot({ fullPage: true });
  });
});