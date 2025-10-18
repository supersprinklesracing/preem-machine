import { ENV_E2E_TESTING_USER } from '../util/e2e-env';
import {
  useE2eTestingUserBeforeEach,
} from '../util/e2e-test-utils';
import { expect, test } from '../util/fixtures';

test.describe('view', () => {
  test.describe('user', () => {
    test('basic', async ({ page }) => {
      await page.goto('/view/user/user-alex-doe');
      await expect(
        page.getByRole('heading', { name: 'Alex Doe' }),
      ).toBeVisible();
      await expect(page).toHaveScreenshot({ fullPage: true });
    });
  });

  test.describe('self', () => {
    useE2eTestingUserBeforeEach();
    test('basic', async ({ page }) => {
      await page.goto(`/view/user/${ENV_E2E_TESTING_USER}`);
      await expect(
        page.getByRole('heading', { name: 'E2E User' }),
      ).toBeVisible();
      await expect(page).toHaveScreenshot({ fullPage: true });
    });
  });
});
