import { expect, test } from '@playwright/test';

import { useMockedDateBeforeEach } from './util/e2e-test-utils';

test.describe('home', () => {
  useMockedDateBeforeEach();
  test('basic', async ({ page }) => {
    await page.goto('/home');
    await expect(
      page.getByRole('heading', { name: 'Upcoming Events' }),
    ).toBeVisible();
    await expect(page).toHaveScreenshot({ fullPage: true });
  });
});
