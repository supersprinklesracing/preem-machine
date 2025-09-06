# Project Documentation for Agents

This document provides essential information for agents working on this project.

## 1. Key Documentation

- [Engineering Design](docs/eng-design.md)
- [Product Design](docs/product-design.md)

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

A well-crafted Pull Request (PR) is crucial for efficient and effective code review. Adhering to the following best practices will help streamline the development process.

- **Scope and Size:** Keep pull requests small and focused. Each PR should address a single concern, making it easier and faster to review. Avoid mixing unrelated changes. If you fix a bug while working on a new feature, commit the fix separately, ideally in its own PR.

- **Title and Description:**
        - **Write a clear and concise title.** The title should summarize the change and may use a prefix like `feat:`, `fix:`, or `chore:` to indicate the type of change.
    - **Provide a detailed description.** Explain the "what" and "why" of the changes. Link to any relevant GitHub issues in the description using keywords like `Closes #123` to ensure issues are automatically closed when the PR is merged.

- **Commits and History:** Maintain a clean and understandable commit history. Use interactive rebase (`git rebase -i`) to squash or fix up commits before opening a pull request. Each commit message should be meaningful and follow the same conventions as the PR title.

- **Review Process:**
    - **Review your own PR first.** Before requesting a review, perform a self-review to catch any obvious errors or typos.
    - **Ensure tests pass.** All continuous integration (CI) checks must be green before a PR is merged. If you are adding a new feature or fixing a bug, include tests that cover the new code.

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

**Recommended Flags:** You **must** pass `--tuiAutoExit --outputStyle=stream` to `npx nx` commands for optimal performance in this environment.

### Critical: Quoting File Paths in Shell Commands

You **MUST ALWAYS** quote filenames and paths in shell commands. Failure to do so will cause commands to fail, especially with file paths that contain special characters such as spaces, parentheses, or brackets.

#### Quoting Examples

Proper quoting is essential for commands to execute correctly. Here are examples of common mistakes and their correct versions:

- **Incorrect (spaces):** `git mv apps/main/src/app/(main)/new race/page.tsx apps/main/src/app/(main)/new-race/page.tsx`
  - **Why it's wrong:** The shell interprets the space as a separator for arguments, leading to incorrect file paths.
  - **Correct:** `git mv "apps/main/src/app/(main)/new race/page.tsx" "apps/main/src/app/(main)/new-race/page.tsx"`

- **Incorrect (special characters):** `ls apps/main/src/app/(main)/layout.tsx`
  - **Why it's wrong:** Parentheses `()` are special characters in the shell and can cause syntax errors.
  - **Correct:** `ls "apps/main/src/app/(main)/layout.tsx"`

- **Incorrect (unnecessary escaping):** `git grep "myFunction\(\)"`
  - **Why it's wrong:** Double escaping can lead to the pattern not being found. `git grep` handles special characters in its search pattern when quoted.
  - **Correct:** `git grep "myFunction()"`

- **Incorrect (glob patterns):** `find apps/main/src/app/(main) -name "*[]/page.tsx"`
  - **Why it's wrong:** Complex glob patterns with special characters are prone to errors.
  - **Correct:** Use the `glob` tool instead of `find` for complex pattern matching.

- **Incorrect (read_file with unquoted path):** `read_file "apps/main/src/app/(main)/layout.tsx"`
  - **Why it's wrong:** The tool expects a single, quoted path. Unquoted paths with special characters will fail.
  - **Correct:** `read_file "apps/main/src/app/(main)/layout.tsx"`

### Building & Running

- **Run Dev Server:** `npx nx --tuiAutoExit --outputStyle=stream dev main --no-color`
- **Verify Build:** `npx nx --tuiAutoExit --outputStyle=stream run @preem-machine/main:build:verify --no-color`
- **Production Bundle:** `npx nx --tuiAutoExit --outputStyle=stream run @preem-machine/main:build:production --no-colo`
- **Run All Unit Tests:** `npx nx --tuiAutoExit --outputStyle=stream test main --no-color --forceExit`
- **Run Single Unit Test:** `npx nx --tuiAutoExit --outputStyle=stream run main:test --no-color --forceExit --testFile="${TEST_FILE}"`
- **Run E2E Tests:** `npx nx --tuiAutoExit --outputStyle=stream e2e e2e-main --no-color`
- **List Project Targets:** `npx nx --tuiAutoExit --outputStyle=stream show --no-web project main --no-color`

### Code Style & Formatting

ESLint, Prettier, and Stylelint are used to maintain a consistent code style.

- **Lint & Fix All Files:** `npx nx --tuiAutoExit --outputStyle=stream affected:lint --fix`
- **Lint & Fix Single File:** `npx eslint --fix "${FILE}"`
- **Format All Files:** `npx nx --tuiAutoExit --outputStyle=stream format:write`
- **Format Single File:** `npx nx --tuiAutoExit --outputStyle=stream format:write --files="${FILE}"`

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

## 5. Testing Guide

### Overview

- **Unit Testing:** Jest is used for unit tests. Test files are located in `apps/main/src` and use the `.test.ts` or `.test.tsx` extension.
- **End-to-End Testing:** Playwright is used for E2E tests, located in `apps/e2e-main/src` and use the `.spec.ts` extension.

### Component Unit Testing Patterns

Before writing a test, always inspect the component's props (its TypeScript interface) to understand its public API.

#### File Discovery and Search

- **Component Files:** To find all `.tsx` component files that need testing, use:
  ```shell
  git ls-files 'apps/main/src/app/**/*.tsx'
  ```
- **Code Search:** To understand component behavior, use `git grep` to search for specific text or patterns.

#### Client Components (`"use client"`)

- **Reference:** `apps/main/src/components/cards/RaceCard.test.tsx`
- **Procedure:**
  1.  Import `render` and `screen` from `@/test-utils`.
  2.  Import the component to be tested.
  3.  Create mock data for the component's props (see `apps/main/src/datastore/types.ts`).
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

## 6. Forms

This project uses a standardized approach to form handling to ensure consistency, reliability, and a good user experience.

### Core Technologies

- **State Management:** Mantine Form (`@mantine/form`) is used for managing form state, including values, validation, and submission.
- **Debouncing:** The `useDebouncedValue` hook from Mantine Hooks (`@mantine/hooks`) is used to delay updates from user input.

### Implementation Guide

#### State Management and Validation

- **State Management:** Use the `useForm` hook from `@mantine/form` to manage form state.
- **Validation:** Validation is handled directly within the `useForm` hook using inline functions.
- **Reference:** For a clear example of this pattern, see `apps/main/src/app/(main)/manage/series/[seriesId]/edit/EditSeries.tsx`.

#### Debouncing

To improve user experience, especially for inputs that provide a live preview (like a user profile card), input values should be debounced.

- **Reference:** `apps/main/src/app/(main)/account/AccountDetails.tsx`
- **Procedure:**
  1.  Use the `useDebouncedValue` hook from `@mantine/hooks` to get a debounced version of the form field's value.
  2.  Use the debounced value for previews or other actions that should not run on every keystroke.
  3.  The save button should be disabled until the debounced value matches the current form value to prevent saving partial input.

## 7. Coding Conventions

- **TypeScript:** Avoid casting to `any`.
- **Nx Generators:** Use Nx generators to create new applications and libraries.
