import { expect, test } from '@playwright/test';

import { ENV_E2E_TESTING_USER } from '../util/e2e-env';
import {
  useE2eTestingUserBeforeEach,
  useMockedDateBeforeEach,
} from '../util/e2e-test-utils';

test.describe('view', () => {
  test.describe('user', () => {
    useMockedDateBeforeEach();
    test('basic', async ({ page }) => {
      await page.goto('/view/user/user-alex-doe');
      await expect(
        page.getByRole('heading', { name: 'Alex Doe' }),
      ).toBeVisible();
      await expect(page).toHaveScreenshot({ fullPage: true });
    });
  });

  test.describe('self', () => {
    useMockedDateBeforeEach();
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
