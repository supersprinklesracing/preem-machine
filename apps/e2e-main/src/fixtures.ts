import { test as base } from '@playwright/test';

export const test = base.extend({
  page: async ({ page }, use) => {
    const failedMessages = [
      'Warning: Did not expect server HTML to contain a',
      'Warning: Expected server HTML to contain a matching',
      'Error: Hydration failed because the initial UI does not match what was rendered on the server.',
      'Error: There was an error while hydrating. Because the error happened outside of a Suspense boundary, the entire root will switch to client rendering.',
      'Warning: An error up paying',
    ];

    page.on('console', (msg) => {
      const text = msg.text();
      for (const failedMessage of failedMessages) {
        if (text.includes(failedMessage)) {
          throw new Error(`Console error detected: ${text}`);
        }
      }
    });

    await use(page);
  },
});

export { expect } from '@playwright/test';