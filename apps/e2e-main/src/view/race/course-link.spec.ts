import { test, expect } from '@playwright/test';

test('should display the course link and take a screenshot', async ({
  page,
}) => {
  await page.goto(
    '/race?path=organizations/org-super-sprinkles/series/series-sprinkles-2025/events/event-giro-sf-2025/races/race-giro-sf-2025-masters-women',
  );

  // Wait for the Strava embed to load
  await page.waitForSelector('.strava-embed-placeholder');

  // Take a screenshot
  await expect(page).toHaveScreenshot();
});
