import { expect, test } from '@playwright/test';

import { useMockedDateBeforeEach } from '../util/e2e-test-utils';

test.describe('view: event', () => {
  useMockedDateBeforeEach();
  test('basic', async ({ page }) => {
    await page.goto('/super-sprinkles/sprinkles-2025/giro-sf-2025');
    await expect(
      page.getByRole('heading', { name: 'Il Giro di San Francisco' }),
    ).toBeVisible();
    await expect(page).toHaveScreenshot({ fullPage: true });
  });
});
