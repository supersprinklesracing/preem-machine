# Project Documentation for Agents

## 1. Overview

This document provides essential information for agents working on this project.

## 2. Getting Started

### Initialization

To set up your local environment, use `HUSKY=0 npm ci` to install the project dependencies.

## 3. Development Workflow

### Git & Branching

- **Feature Branches:** Always use feature branches for new development.
- **Pull Requests:** Merge changes to the `main` branch via GitHub Pull Requests.
- **Syncing:** After a PR is merged, sync your local repository to get the latest changes:
  ```shell
  git fetch origin
  git rebase origin/main
  ```

### Pull Request Best Practices

- **Scope:** Keep PRs small and focused on a single concern.
- **Title:** Must be clear, concise, include an issue ID, and have a type prefix (e.g., `feat: Super feature (#123)`).
- **Description:** Explain the "what" and "why." Link issues with `Closes #123`.
- **Commits:** Keep history clean using interactive rebase. Write meaningful commit messages.
- **Review:** Self-review PRs before requesting a review from others.
- **Tests:** All CI checks must pass. Add tests for new features and bug fixes.
- **Local Verification:** Before pushing your changes, you **MUST** ensure that your changes work by running the local verification checks for linting, building, and testing. The commands for these checks are listed in the "Commands" section of this document.

### Critical: The Definition of "Done"

> **WARNING:** A task is **NOT** "done" or "complete" until you have successfully run **ALL** local verification steps (lint, build, and tests) without any errors. Claiming a task is complete before all checks have passed is a critical failure of your operational protocol. Do not state that you are finished, complete, or verified until you have the output to prove it. This is a non-negotiable directive.

### Critical: Merging Pull Requests

**UNDER NO CIRCUMSTANCES** are you to merge a pull request without the user's direct and explicit consent. This is a strict and non-negotiable rule. Even if all checks pass and the user seems to imply approval, you **MUST** ask for confirmation before merging. For example, ask: "All checks have passed. Should I merge the pull request?" This rule applies in all modes, including any "yolo" or autonomous mode.

### Code Quality Tools

This project uses `husky` and `lint-staged` to enforce code quality standards on every commit.

- **Disabling Hooks (Temporary):** If you need to bypass pre-commit hooks for a specific reason, you can disable them temporarily:
  ```shell
  git config --unset core.hooksPath
  ```
- **Restoring Hooks:** Do not push branches upstream without restoring the hooks:
  ```shell
  git config core.hooksPath "./husky/_"
  ```

## 4. Commands

### Common NX Development Commands

#### Building & Running

- **Run Dev Server:** `./tools/nx/nx run @preem-machine/main:dev`
- **Verify Build:** `./tools/nx/nx run @preem-machine/main:build:verify`
- **Production Bundle:** `./tools/nx/nx run @preem-machine/main:build`
- **List Project Targets:** `./tools/nx/nx show --no-web project main`

#### Testing

- **Tests using Jest**
  - **Run All Unit Tests:** `tools/test.sh`
  - **Run Single Unit Test:** `tools/test.sh --testFile='"${TEST_FILE}"'`

- **E2E Tests using Playwright**
  - **Run E2E Tests:** `./tools/nx/nx e2e e2e-main`
  - **Run Single E2E Test:** `./tools/nx/nx e2e e2e-main -- --project="chrome-desktop" "${TEST_FILE}"`
  - **Update Snapshots:** `./tools/nx/nx e2e e2e-main --update-snapshots`

#### Code Style & Formatting

- **Lint & Fix All Files:** `./tools/nx/nx affected:lint --fix`
- **Lint & Fix Single File:** `npx eslint --fix "${FILE}"`
- **Format All Files:** `./tools/nx/nx format:write`
- **Format Single File:** `./tools/nx/nx format:write --files="${FILE}"`

### File System & Search Tools

This project provides a variety of tools for interacting with the file system. Choose the best tool for the job to ensure your commands are safe, effective, and respect the project's structure.

#### **1. Codebase Search (`git grep`)**

For most codebase searches, `git grep` is the preferred tool. It is fast, powerful, and automatically ignores files listed in `.gitignore`, ensuring that search results are focused on relevant source code.

- **Usage:** `git grep "search pattern"`
- **Example:** `git grep "newRaceAction"`

#### **2. Targeted File Search (Built-in Tools)**

For more specific file system operations, the built-in tools offer more direct access and control.

- **Reading Files:**
  - `read_file`: To read the full content of a single file.
  - `read_many_files`: To read the full content of multiple files at once.
- **Finding Files by Path:**
  - `glob`: To find files based on path patterns (e.g., `apps/main/src/**/*.tsx`).
- **Searching Content with Regex:**
  - `search_file_content`: To search for a specific regex pattern within a targeted set of files (defined by a glob). Use this when your search requires a complex regex that `git grep` might not support well, or when you need to search outside of a git repository.

#### **3. Listing Tracked Files (`git ls-files`)**

To get a list of all files tracked by Git (respecting `.gitignore`), use `git ls-files`. This is useful for discovery or for piping to other commands.

### Critical: Quoting File Paths in Shell Commands

You **MUST ALWAYS** quote filenames and paths in shell commands. Failure to do so will cause commands to fail, especially with file paths that contain special characters such as spaces, parentheses, or brackets.

#### Quoting Examples

Proper quoting is essential for commands to execute correctly. Here are examples of common mistakes and their correct versions:

- **Incorrect (read_file with unquoted path):** `read_file "apps/main/src/app/(main)/layout.tsx"`
  - **Why it's wrong:** The tool expects a single, quoted path. Unquoted paths with fail.
  - **Correct:** `read_file "apps/main/src/app/(main)/layout.tsx"`

- **Incorrect (Unittest with unquoted path):** `tools/test.sh --no-color --testFile=apps/main/src/app/(main)/layout.tsx`
  - **Why it's wrong:** The tool expects a single, quoted path. Unquoted paths will fail.
  - **Correct:** `tools/test.sh --testFile="apps/main/src/app/(main)/layout.tsx"`

- **Incorrect (special characters):** `ls apps/main/src/app/(main)/layout.tsx`
  - **Why it's wrong:** Parentheses `()` are special characters. Unquoted special characters will fail.
  - **Correct:** `ls "apps/main/src/app/(main)/layout.tsx"`

- **Incorrect (glob patterns):** `find apps/main/src/app/(main) -name "*[]/page.tsx"`
  - **Why it's wrong:** Complex glob patterns with special characters are prone to errors.
  - **Correct:** Use the `glob` tool instead of `find` for complex pattern matching.

## 5. Testing Guide

### Overview

- **Unit Testing:** Jest is used for unit tests. Test files are located in `apps/main/src` and use the `.test.ts` or `.test.tsx` extension.
- **End-to-End Testing:** Playwright is used for E2E tests, located in `apps/e2e-main/src` and use the `.spec.ts` extension.

### Unit Testing
#### Component Unit Testing Patterns

Before writing a test, always inspect the component's props (its TypeScript interface) to understand its public API.

##### Client Components (`"use client"`)

- **Reference:** `apps/main/src/components/cards/RaceCard.test.tsx`
- **Procedure:**
  1.  Import `render` and `screen` from `@/test-utils`.
  2.  Import the component to be tested.
  3.  Create mock data for the component's props (see `apps/main/src/datastore/schema.ts`).
  4.  Write a simple "smoke test" to ensure the component renders without errors.
  5.  Assert that a key piece of text or an element is present in the document. Example: `expect(screen.getByText('Some Text')).toBeInTheDocument();`.

##### Server Components (No `"use client"` directive)

- **Reference:** `apps/main/src/datastore/mock-db.test.ts`
- **Procedure:**
  1.  Follow the detailed procedure in the **Mocking `firestore`** section below to set up a mock database.
  2.  Your test function **must** be `async`.
  3.  Render the component. React Testing Library's `render` function will correctly handle and wait for the async component to resolve.
  4.  Use `await screen.findByText(...)` to assert that the content derived from your mock data is present in the document.

For server components that interact with Firestore, refer to the **Mocking `firestore`** section below.

#### Jest Best Practices

##### Mocking `firestore`

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

##### Handling Asynchronous Operations

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

##### Mocking `window.matchMedia()`

To fix `TypeError: window.matchMedia is not a function` in JSDOM, import the reusable mock at the top of your test file:

```typescript
import '@/matchMedia.mock'; // Must be the first import

import { MyComponent } from './MyComponent';
// ...
```

### E2E Testing

This project uses Playwright for screenshot testing to catch visual regressions.

#### Page URLs

E2E tests should use the "source" URLs for pages (See `apps/e2e-main/src/next.config.test.js`).

Good URLs look like:

*   `manage/some-org/some-series/some-event/some-race/some-preem`
*   `manage/some-org/some-series/some-event/race/new`
*   `manage/some-org/some-series/edit`

#### Adding a New Screenshot Test

1.  Create a new test file in `apps/e2e-main/src` with the `.spec.ts` extension.
2.  In the test file, navigate to the page you want to test and use the `toHaveScreenshot` assertion:

    ```typescript
    import { test, expect } from '@playwright/test';
    test('should take a screenshot of the about page', async ({ page }) => {
      await page.goto('/about');
      await expect(page).toHaveScreenshot();
    });
    ```

#### Generating and Updating Snapshots

- **First Run:** When you run a new screenshot test for the first time, it will fail because no baseline snapshot exists. This is expected. The test runner will create a new snapshot file in the `apps/e2e-main/src/snapshots` directory.
- **Updating Snapshots:** If a test fails due to an intentional UI change, you need to update the baseline snapshot. You can do this by running the tests with the `--update-snapshots` flag:

  ```shell
  npx nx e2e e2e-main --update-snapshots
  ```

After updating the snapshots, you need to commit the new snapshot files to the repository.

#### Debugging tests

Look for output like: `Error Context: test-output/test-results/some-test-chrome-pixel-5/error-context.md` to figure out what was on the page when the test failed. This path will be relative to apps/e2e-main, so the file path will be `apps/e2e-main/test-output/test-results/some-test-chrome-pixel-5/error-context.md`

## 6. Forms

This project uses a standardized approach to form handling to ensure consistency, reliability, and a good user experience.

### State Management and Validation

Mantine Form (`@mantine/form`) is used for managing form state, including values, validation, and submission.

- **State Management:** Use the `useForm` hook from `@mantine/form` to manage form state.
- **Validation:** Validation is handled directly within the `useForm` hook using inline functions.
- **Reference:** For a clear example of this pattern, see `apps/main/src/app/(main)/manage/series/[seriesId]/edit/EditSeries.tsx`.

### Debouncing

The `useDebouncedValue` hook from Mantine Hooks (`@mantine/hooks`) is used to delay updates from user input.

To improve user experience, especially for inputs that provide a live preview (like a user profile card), input values should be debounced.

- **Reference:** `apps/main/src/app/(main)/account/AccountDetails.tsx`
- **Procedure:**
  1.  Use the `useDebouncedValue` hook from `@mantine/hooks` to get a debounced version of the form field's value.
  2.  Use the debounced value for previews or other actions that should not run on every keystroke.
  3.  The save button should be disabled until the debounced value matches the current form value to prevent saving partial input.

## 7. Environment Variables

When accessing environment variables, do not use `process.env.XYZ` directly in the code. Instead, all environment variable access should go through either `src/env.ts` (or other `*-env.ts` files) file. This ensures that all environment variables are documented and validated in a single place.

## 8. Firestore Data Modeling Notes

### Critical: ID vs. Path Uniqueness

A key architectural concept to understand in this project is the difference between a Firestore Document ID and a Document Path, especially when using collection group queries.

*   **Document ID:** A Document ID (e.g., `giro-sf-2025`) is **only unique within its parent collection**. It is perfectly valid to have two different documents with the same ID if they are in different collections (e.g., `.../series/series-A/events/giro-sf-2025` and `.../series/series-B/events/giro-sf-2025`).

*   **Document Path:** A Document Path (e.g., `organizations/super-sprinkles/series/sprinkles-2025/events/giro-sf-2025`) is the full path from the root of the database to the document. It is **always globally unique**.

### The Collection Group Query Problem

Several queries in this application use `collectionGroup()` to fetch documents from all collections with a specific name (e.g., `events`). This is a powerful feature, but it can lead to subtle bugs if not handled correctly.

**Problem:** A `collectionGroup('events')` query will fetch documents from `.../series-A/events/` and `.../series-B/events/`. If both series contain an event with the ID `giro-sf-202s`, the query will return both documents. If you then attempt to de-duplicate or key this data using only the `id` field, you will encounter errors or incorrect UI rendering.

**Solution:** When processing the results of a `collectionGroup` query, you **MUST** use the document's `path` as the unique identifier for operations like React keys or de-duplication. The `id` is not sufficient.

**Example (Incorrect):**
```typescript
const uniqueDocs = docs.filter(
  (doc, index, self) => index === self.findIndex((t) => t.id === doc.id),
);
```

**Example (Correct):**
```typescript
const uniqueDocs = docs.filter(
  (doc, index, self) =>
    index === self.findIndex((t) => t.ref.path === doc.ref.path),
);
```