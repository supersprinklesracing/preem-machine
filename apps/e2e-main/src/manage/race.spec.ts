import { expect, test } from '@playwright/test';
import { useE2eTestingUserBeforeEach } from '../e2e-test-utils';

test.describe('manage/race logged in user', () => {
  useE2eTestingUserBeforeEach();

  test('basic', async ({ page }) => {
    await page.goto(
      '/manage/org-super-sprinkles/series-sprinkles-2025/event-giro-sf-2025/race-giro-sf-2025-masters-women',
    );
    await expect(
      page.getByRole('heading', { name: 'Master Women 40+/50+', level: 1 }),
    ).toBeVisible();
    await expect(page).toHaveScreenshot();
  });
});
