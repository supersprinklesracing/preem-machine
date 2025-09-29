import { expect, test } from '@playwright/test';

import { useMockedDateBeforeEach } from '../util/e2e-test-utils';

test.describe('view: series', () => {
  useMockedDateBeforeEach();
  test('basic', async ({ page }) => {
    await page.goto('/super-sprinkles/sprinkles-2025');
    await expect(
      page.getByRole('heading', { name: 'Sprinkles 2025' }),
    ).toBeVisible();
    await expect(page).toHaveScreenshot({ fullPage: true });
  });
});
