import { expect, test } from '../fixtures';

import {
  useE2eTestingUserBeforeEach,
  useMockedDateBeforeEach,
} from '../util/e2e-test-utils';

test.describe('manage: hub', () => {
  useE2eTestingUserBeforeEach();
  useMockedDateBeforeEach();

  test('basic', async ({ page }) => {
    await page.goto('/manage');
    await expect(
      page.getByRole('heading', { name: 'Organizer Hub' }),
    ).toBeVisible();
    await expect(page).toHaveScreenshot({ fullPage: true });
  });
});
