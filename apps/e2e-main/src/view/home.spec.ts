import { expect, test } from '@playwright/test';

import { useMockedDateBeforeEach } from '../util/e2e-test-utils';

test.describe('view: home', () => {
  useMockedDateBeforeEach();
  test('basic', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: 'Upcoming Events' }),
    ).toBeVisible();
    await expect(page).toHaveScreenshot({ fullPage: true });
  });
});
