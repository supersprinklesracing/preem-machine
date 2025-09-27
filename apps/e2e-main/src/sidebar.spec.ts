import { test, expect } from '@playwright/test';

test.describe('Sidebar Toggle', () => {
  // This test is only relevant for mobile viewports.
  // eslint-disable-next-line playwright/no-skipped-test
  test.skip(() => test.info().project.name !== 'chrome-pixel-5', 'Only run on mobile');

  test('should open the sidebar on mobile when the burger menu is clicked', async ({
    page,
  }) => {
    // 1. Arrange: Navigate to the home page.
    await page.goto('/');

    // 2. Assert: Take a screenshot for visual confirmation.
    await expect(page).toHaveScreenshot('sidebar-hidden-mobile.png');

    // 2. Act: Click the burger menu icon.
    const burgerButton = page.getByTestId('sidebar-burger');
    await expect(burgerButton).toBeVisible();
    await burgerButton.click();

    // 3. Assert: Verify the sidebar is now visible.
    // We can check for the existence of the "Home" link within the sidebar.
    const sidebarHomeLink = page.getByTestId('sidebar-home-link');
    await expect(sidebarHomeLink).toBeVisible();

    // 4. Screenshot: Take a screenshot for visual confirmation.
    await expect(page).toHaveScreenshot('sidebar-toggled-mobile.png');
  });
});