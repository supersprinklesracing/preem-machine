import { useE2eTestingUserBeforeEach } from '../util/e2e-test-utils';
import { expect, test } from '../util/fixtures';

test.describe('manage: hub', () => {
  useE2eTestingUserBeforeEach();

  test('basic', async ({ page }) => {
    await page.goto('/manage');
    await expect(
      page.getByRole('heading', { name: 'Organizer Hub' }),
    ).toBeVisible();
    await expect(page).toHaveScreenshot({ fullPage: true });
  });
});
