# Project Documentation for Agents

## 1. Overview

This document provides essential information for agents working on this project.

## 2. Getting Started

To set up your local environment, use `HUSKY=0 npm ci` to install the project dependencies.

## 3. Critical Rules

**WARNING: Definition of "Done"**

A task is **NOT** "done" until you have:

- Run all unit tests.
- Linted all affected files.
- Formatted all affected files.
- Run the verify build command.

**WARNING: Pushing branches (creating a PR)**

A branch is not ready for a PR until you have:

- Run all unit tests.
- Run all E2E tests.
- Linted all affected files in the branch.
- Formatted all affected files in the branch.
- Run the verify build command.

**WARNING: Merging Pull Requests**
**UNDER NO CIRCUMSTANCES** are you to merge a pull request without the user's direct and explicit consent. You **MUST** ask for confirmation before merging (e.g., "All checks have passed. Should I merge the pull request?").

**WARNING: Quoting or Escaping File Paths in Shell Commands**
You **MUST ALWAYS** quote or escape filenames and paths in shell commands to handle special characters.

- **Correct:** `ls "apps/main/src/app/(main)/layout.tsx"`
- **Correct:** `ls apps/main/src/app/\(main\)/layout.tsx`
- **Incorrect:** `ls apps/main/src/app/(main)/layout.tsx`

**WARNING: Firestore ID vs. Path Uniqueness**
A Firestore Document **ID** is only unique within its parent collection. A Document **Path** is always globally unique. When processing `collectionGroup` queries, you **MUST** use the document's `path` as the unique identifier (e.g., for React keys).

## 4. Project Structure Overview

This is an NX monorepo. The key applications are:

- `apps/main`: The main Next.js web application.
- `apps/e2e-main`: Playwright E2E tests for the main application.
- `apps/cli`: Command-line tools for project automation.

## 5. Development Workflow

### Git & Branching

- **Feature Branches:** Always use feature branches for new development.
- **Pull Requests:** Merge changes to the `main` branch via GitHub Pull Requests.
- **Syncing:** After a PR is merged, run `git fetch origin && git rebase origin/main` to get the latest changes.

### Pull Request Best Practices

- **Scope:** Keep PRs small and focused on a single concern.
- **Title:** Must be clear, concise, include an issue ID, and have a type prefix (e.g., `feat: Super feature (#123)`).
- **Description:** Explain the "what" and "why." Link issues with `Closes #123`.
- **Commits:** Keep history clean using interactive rebase. Write meaningful commit messages.
- **Tests:** All CI checks must pass. Add tests for new features and bug fixes.

## 6. Commands

### Common NX Development Commands

#### Building & Running

- **Run Dev Server:** `./tools/nx run @preem-machine/main:dev`
- **Verify Build:** `./tools/nx run @preem-machine/main:build:verify`
- **Production Bundle:** `./tools/nx run @preem-machine/main:build`

#### Testing

**WARNING: Do not update E2E snapshots**
You **MUST NOT** run E2E tests with `--update-snapshots` unless the user explicitly asks you to.

Note: Always quote file path variables like `"${TEST_FILE}"` to prevent errors.

- **Run all unit tests:** `./tools/nx run @preem-machine/main:test`
- **Run a single unit test:** `./tools/nx run @preem-machine/main:test --testFile="'${TEST_REGEX_PATTERN}'"` (This is a regular expression, special characters like "." or "\" must be escaped in the pattern must be escaped (e.g. "\(main\)/my\.test\.ts").)
- **Run all E2E tests:** `./tools/nx e2e e2e-main`
- **Run a single E2E test:** `./tools/nx e2e e2e-main -- "${TEST_FILE}"`
- **Update E2E snapshots:** `./tools/nx e2e e2e-main --update-snapshots`
- **Update a single E2E snapshot:** `./tools/nx e2e e2e-main --update-snapshots -- "${TEST_FILE}"`

#### Code Style & Formatting

- **Lint all affected files:** `./tools/nx affected:lint --fix`
- **Format all affected files:**: `./tools/nx format:write`
- **Lint all affected files in the branch:**: `./tools/nx affected -t lint --base=main --head=HEAD`
- **Format all affected files in the branch:**: `./tools/nx format:write --base=main --head HEAD`

### File System & Search Tools

- **To search code content:** Use `git grep "search pattern"`. It's fast and respects `.gitignore`.
- **To find files by name/path:** Use the `glob` tool with a pattern like `'apps/main/src/**/*.tsx'`.
- **To read one or more files:** Use `read_file` or `read_many_files`.
- **To list all tracked files:** Use `git ls-files`.

## 7. Testing Guide

This project uses Jest for unit testing and Playwright for E2E testing. All new features and bug fixes must include tests. For detailed instructions on writing and running tests, mocking, and handling asynchronous operations, please refer to the [**Testing Guide (TESTING.md)**](./TESTING.md).

## 8. Handling Forms

This project uses `@mantine/form` for state management and validation, and `@mantine/hooks` for debouncing user input to improve UX.

- **Form State Reference:** `apps/main/src/app/(main)/manage/series/[seriesId]/edit/EditSeries.tsx`
- **Debouncing Reference:** `apps/main/src/app/(main)/account/Details.tsx`

## 9. Accessing Environment Variables

Do not use `process.env.XYZ` directly. Instead, access all environment variables through `src/env.ts` (or other `*-env.ts` files) to ensure they are documented and validated.

## 10. React Guidelines

### `Context` vs. `Context.Provider`

In React 19, you can render `<Context>` as a provider instead of `<Context.Provider>`.

- **Incorrect:**

  ```typescript
  const ThemeContext = createContext('light');

  function App() {
    return (
      <ThemeContext.Provider value="dark">
        <Toolbar />
      </Theme-Context.Provider>
    );
  }
  ```

- **Correct:**

  ```typescript
  const ThemeContext = createContext('light');

  function App() {
    return (
      <ThemeContext value="dark">
        <Toolbar />
      </ThemeContext>
    );
  }
  ```
