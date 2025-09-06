import { workspaceRoot } from '@nx/devkit';
import { nxE2EPreset } from '@nx/playwright/preset';
import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

// For CI, you may want to set BASE_URL to the deployed application.
const baseURL = process.env['BASE_URL'] || 'http://localhost:3000';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// Note: for some reason, path.resolve will crash when playwright in vscode loads.
// For now, also try to load up env vars the way the NX command does.
const dotenvPaths = [
  '.env.development.local',
  '.env.development',
  '.env.ci.local',
  '.env.ci',
  '.env.local',
  '.env',
  '/home/jlapenna/code/preem-machine/apps/main/.env.local',
].map((dotEnvFile) => `${workspaceRoot}/apps/main/${dotEnvFile}`);
dotenv.config({
  path: dotenvPaths,
});

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  ...nxE2EPreset(__filename, { testDir: './src' }),
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },
  /* Run your local dev server before starting the tests */
  webServer: {
    command: !process.env.CI
      ? 'npx nx --tuiAutoExit --outputStyle=stream-without-prefixes run @preem-machine/main:dev' // Hot loading, etc.
      : 'npx nx --tuiAutoExit --outputStyle=stream-without-prefixes run @preem-machine/main:start', // Production Level Build

    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 300000,
    cwd: workspaceRoot,
    // .env files in shell are not respected in VS Code; we read them, above.
    // env: {},
  },
  expect: {
    toHaveScreenshot: { maxDiffPixelRatio: 0.02 },
  },
  projects: [
    {
      name: 'chrome-desktop',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'chrome-pixel-5',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'firefox-desktop',
      use: { ...devices['Desktop Firefox'] },
    },

    // Disable webkit while it is not possible to run on a local machine.
    /*
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    */

    // Uncomment for mobile browsers support
    /* {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    }, */

    // Uncomment for branded browsers
    /* {
      name: 'Microsoft Edge',
      use: { ...devices['Desktop Edge'], channel: 'msedge' },
    },
    {
      name: 'Google Chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    } */
  ],
});
