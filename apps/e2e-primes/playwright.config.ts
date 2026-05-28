import { workspaceRoot } from '@nx/devkit';
import { nxE2EPreset } from '@nx/playwright/preset';
import { defineConfig, devices } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
// For CI, you may want to set BASE_URL to the deployed application.
const baseURL = process.env['BASE_URL'] || 'http://localhost:4200';

export default defineConfig({
  ...nxE2EPreset(__filename, { testDir: './src' }),
  timeout: 300000,
  workers: 1,
  outputDir: './test-output/test-results',
  reporter: [
    [
      'html',
      { outputFolder: './test-output/playwright-report', open: 'never' },
    ],
    process.env.CI ? ['github'] : ['list'],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    /** Use a consistent TZ. */
    locale: 'en-US',
    timezoneId: 'America/Los_Angeles',
  },
  expect: {
    toHaveScreenshot: { maxDiffPixelRatio: 0.02 },
  },
  updateSnapshots: process.env.UPDATE_SNAPSHOTS === '1' ? 'all' : 'missing',
  /* Run your local dev server before starting the tests */
  webServer: {
    command:
      'PORT=4200 pnpm exec nx --tuiAutoExit --outputStyle=stream-without-prefixes run @preem-machine/main:start | tee e2e-server.log 2>&1 ',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env.CI,
    timeout: 300000,
    cwd: workspaceRoot,
    env: {
      E2E_TESTING: 'true',
      E2E_TESTING_USER: process.env.E2E_TESTING_USER || 'some-user',
    },
  },
  globalSetup: require.resolve('./src/util/global.setup.ts'),
  projects: [
    {
      name: 'chrome-desktop',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'chrome-pixel-5',
      use: { ...devices['Pixel 5'] },
    },
  ],
});
