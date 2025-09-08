import { expect, test } from '@playwright/test';
import { useE2eTestingUserBeforeEach } from '../e2e-test-utils';

test.describe('manage/event logged in user', () => {
  useE2eTestingUserBeforeEach();

  test('basic', async ({ page }) => {
    await page.goto(
      '/manage/org-super-sprinkles/series-sprinkles-2025/event-giro-sf-2025',
    );
    await expect(
      page.getByRole('heading', { name: 'Il Giro di San Francisco' }),
    ).toBeVisible();
    await expect(page).toHaveScreenshot();
  });
});
