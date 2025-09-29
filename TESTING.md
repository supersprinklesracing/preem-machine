# Testing Guide

## 1. Overview

- **Unit Testing:** Jest is used for unit tests. Test files are located in `apps/main/src` and use the `.test.ts` or `.test.tsx` extension.
- **End-to-End Testing:** Playwright is used for E2E tests, located in `apps/e2e-main/src` and use the `.spec.ts` extension.

## 2. Unit Testing

### Component Unit Testing Patterns

Before writing a test, always inspect the component's props (its TypeScript interface) to understand its public API.

#### Client Components (`"use client"`)

- **Reference:** `apps/main/src/components/cards/RaceCard.test.tsx`
- **Procedure:**
  1.  Import `render` and `screen` from `@/test-utils`.
  2.  Import the component to be tested.
  3.  Create mock data for the component's props (see `apps/main/src/datastore/schema.ts`).
  4.  Write a simple "smoke test" to ensure the component renders without errors.
  5.  Assert that a key piece of text or an element is present in the document. Example: `expect(screen.getByText('Some Text')).toBeInTheDocument();`.

#### Server Components (No `"use client"` directive)

- **Reference:** `apps/main/src/datastore/mock-db.test.ts`
- **Procedure:**
  1.  Follow the detailed procedure in the **Mocking `firestore`** section below to set up a mock database.
  2.  Your test function **must** be `async`.
  3.  Render the component. React Testing Library's `render` function will correctly handle and wait for the async component to resolve.
  4.  Use `await screen.findByText(...)` to assert that the content derived from your mock data is present in the document.

For server components that interact with Firestore, refer to the **Mocking `firestore`** section below.

### Jest Best Practices

#### Mocking `firestore`

- **Reference:** `apps/main/src/datastore/mock-db.test.ts`
- **Concept:** The testing strategy is to mock the entire Firestore database before tests run. This allows components to interact with a realistic, in-memory version of the database.
- **Procedure:**
  1.  Import `setupMockDb` from `@/test-utils`.
  2.  Call `setupMockDb()` at the top level of your test file's `describe` block. This function automatically sets up the mock database in a `beforeAll` hook.

      ```typescript
      import { setupMockDb } from '@/test-utils';

      describe('MyTestSuite', () => {
        setupMockDb();

        it('should interact with the mock database', async () => {
          // Your test logic here
        });
      });
      ```

> **Important:**
>
> - You should not need to modify `mock-db.ts`; the existing data is sufficient for testing.
> - **Never** access the mock database directly in your tests. Your components should interact with Firestore as they normally would.
> - Do not mock individual Firestore functions (e.g., `(firestore.getRenderableRaceDataForPage as jest.Mock).mockResolvedValue(...)`). This approach is incorrect and will not work with the Firestore instance. You **must** use `setupMockDb` to ensure the entire database is mocked correctly.

#### Handling Asynchronous Operations

When testing components with asynchronous behavior, follow these guidelines to avoid `act` warnings:

1.  **Use `async` test functions:**
    ```typescript
    it('should render async data', async () => {
      // ...
    });
    ```
2.  **Use `find*` queries for assertions:** These queries return a promise that resolves when the element is found.
    ```typescript
    // Correct: waits for the element to appear
    const element = await screen.findByText('Loaded Data');
    expect(element).toBeInTheDocument();
    ```
3.  **Do NOT use `get*` queries for async content:** These are synchronous and will fail if the element is not immediately available.

#### Mocking `window.matchMedia()`

To fix `TypeError: window.matchMedia is not a function` in JSDOM, import the reusable mock at the top of your test file:

```typescript
import '@/matchMedia.mock'; // Must be the first import

import { MyComponent } from './MyComponent';
// ...
```

## 3. E2E Testing

This project uses Playwright for screenshot testing to catch visual regressions.

### Page URLs

E2E tests should use the "source" URLs for pages (See `apps/e2e-main/src/next.config.test.js`).

Good URLs look like:

- `manage/some-org/some-series/some-event/some-race/some-preem`
- `manage/some-org/some-series/some-event/race/new`
- `manage/some-org/some-series/edit`

### Adding a New Screenshot Test

1.  Create a new test file in `apps/e2e-main/src` with the `.spec.ts` extension.
2.  In the test file, navigate to the page you want to test and use the `toHaveScreenshot` assertion:

    ```typescript
    import { test, expect } from '@playwright/test';
    test('should take a screenshot of the about page', async ({ page }) => {
      await page.goto('/about');
      await expect(page).toHaveScreenshot();
    });
    ```

### Generating and Updating Snapshots

- **First Run:** When you run a new screenshot test for the first time, it will fail because no baseline snapshot exists. This is expected. The test runner will create a new snapshot file in the `apps/e2e-main/src/snapshots` directory.
- **Updating Snapshots:** If a test fails due to an intentional UI change, you need to update the baseline snapshot. You can do this by running the tests with the `--update-snapshots` flag:

  ```shell
  npx nx e2e e2e-main --update-snapshots
  ```

After updating the snapshots, you need to commit the new snapshot files to the repository.

### Debugging tests

Look for output like: `Error Context: test-output/test-results/some-test-chrome-pixel-5/error-context.md` to figure out what was on the page when the test failed. This path will be relative to apps/e2e-main, so the file path will be `apps/e2e-main/test-output/test-results/some-test-chrome-pixel-5/error-context.md`
