import { expect, test } from '@playwright/test';

import { useMockedDateBeforeEach } from '../util/e2e-test-utils';

test.describe('view: race', () => {
  useMockedDateBeforeEach();
  test('basic', async ({ page }) => {
    await page.goto(
      '/view/super-sprinkles/sprinkles-2025/giro-sf-2025/masters-women',
    );
    await expect(
      page.getByRole('heading', { name: 'Master Women 40+/50+' }),
    ).toBeVisible();
    await expect(page).toHaveScreenshot({ fullPage: true });
  });
});
