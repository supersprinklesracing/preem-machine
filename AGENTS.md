# AGENTS.md

## Key documentation

- [Eng Design](docs/eng-design.md)
- [Product Design](docs/product-design.md)

## Initialization

Use `npm ci` to initialize the repo.

## Commands

### Building and Running

The following commands are used to build, run, and test the project.

- **Run the dev server:** `npx nx --tuiAutoExit --outputStyle=static dev main`
- **Verify the build:** `npx nx --tuiAutoExit --outputStyle=static run @preem-machine/main:build:verify`
- **Create a production bundle:** `npx nx --tuiAutoExit --outputStyle=static run @preem-machine/main:build:production`
- **Run unit tests:** `npx nx --tuiAutoExit --outputStyle=static test main --forceExit`
- **Run a single unit tests:** `npx nx --tuiAutoExit --outputStyle=static run main:test --forceExit --testFile=${TEST_FILE}`
- **Run end-to-end tests:** `npx nx --tuiAutoExit --outputStyle=static e2e e2e-main`
- **See all available targets for main:** `npx nx --tuiAutoExit --outputStyle=static show project main`

Always pass recommended flags to commands: `npx nx --tuiAutoExit --outputStyle=static command`

### Code Style

The project enforces a consistent code style using ESLint, Prettier, and Stylelint. Configuration files are located at the root of the workspace (`eslint.config.mjs`, `.prettierrc`, `.stylelintrc.json`).

- **Lint (and fix) all affected files:** `npx nx --tuiAutoExit --outputStyle=static affected:lint --fix`
- **Lint (and fix) a single file:** `npx eslint --fix ${FILE}`
- **Format all affected files:** `npx nx --tuiAutoExit --outputStyle=static format:write`
- **Format a single file:** `npx nx --tuiAutoExit --outputStyle=static format:write --files=${FILE}`

### Syncing Repos & Branches

You can rebase a branch with the latest main:

```shell
git fetch origin
git rebase origin/main
```

### Tools & Shell Commands
- Use `git ls-files` to list files and `git grep` to search for strings within them. This is preferable to using general-purpose search tools as it automatically ignores build artifacts.
- Always quote filenames: e.g. "apps/main/src/app/(main)/layout.tsx" _not_ apps/main/src/app/(main)/layout.tsx
- Use `git ls-files` and `git grep` to find files or strings; this avoids searching build artifacts.

## Development Processes

### Feature Branches

- Always use **feature branches** when changing the code in a repository.
- Use Git Hub Pull Requests in order to merge changes to the **main** branch.
- After a Pull Request is merged, you can sync the repo to get the latest changes.

### Project Quality Tooling: husky, lint-staged

The project uses `husky` and `lint-staged` to ensure code quality commits.

- It is possible to disable pre-commit hooks: `git config --unset core.hooksPath`.
- Do not push branches upstream without restoring hooks: `git config core.hooksPath "./husky/_"`.


### Typescript

- Avoid casting to `any`.

### Testing

- **Unit Testing:** Jest is used for unit testing, with tests (`*.spec.ts`) located in `apps/main/src`.
- **End-to-End Testing:** Playwright is used for E2E testing, with tests located in `apps/e2e-main/src`.

### Nx Generators

The workspace is set up to use Nx generators for creating new applications and libraries, streamlining the development process.

## Jest Behaviors and Practices

### Mocking `window.matchMedia()`

https://jestjs.io/docs/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom

If some code uses a method which JSDOM (the DOM implementation used by Jest) hasn't implemented yet, testing it is not easily possible. This is e.g. the case with window.matchMedia(). Jest returns TypeError: window.matchMedia is not a function and doesn't properly execute the test.

In this case, mocking matchMedia in the test file should solve the issue:


```
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
```

This works if window.matchMedia() is used in a function (or method) which is invoked in the test. If window.matchMedia() is executed directly in the tested file, Jest reports the same error. In this case, the solution is to move the manual mock into a separate file and include this one in the test before the tested file:

```
import './matchMedia.mock'; // Must be imported before the tested file
import {myMethod} from './file-to-test';

describe('myMethod()', () => {
  // Test the method here...
});
```
