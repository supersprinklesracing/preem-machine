# AGENTS.md

## Initialization

Use `npm ci` to initialize the repo.

## Building and Running

The following commands are used to build, run, and test the project.

- **Run the dev server:** `npx nx --tuiAutoExit --outputStyle=static dev main`
- **Verify the build:** `npx nx --tuiAutoExit --outputStyle=static run @preem-machine/main:build:verify`
- **Create a production bundle:** `npx nx --tuiAutoExit --outputStyle=static run @preem-machine/main:build:production`
- **Run unit tests:** `npx nx --tuiAutoExit --outputStyle=static test main --forceExit`
- **Run a single unit tests:** `npx nx --tuiAutoExit --outputStyle=static run main:test --forceExit --testFile=${TEST_FILE}`
- **Run end-to-end tests:** `npx nx --tuiAutoExit --outputStyle=static e2e e2e-main`

- **See all available targets for main:** `npx nx --tuiAutoExit --outputStyle=static show project main`

Always pass recommended flags to commands: `npx nx --tuiAutoExit --outputStyle=static command`

## Development Conventions

### Code Style

The project enforces a consistent code style using ESLint, Prettier, and Stylelint. Configuration files are located at the root of the workspace (`eslint.config.mjs`, `.prettierrc`, `.stylelintrc.json`).

- **Lint (and fix) all affected files:** `npx nx --tuiAutoExit --outputStyle=static affected:lint --fix`
- **Lint (and fix) a single file:** `npx eslint --fix ${FILE}`
- **Format all affected files:** `npx nx --tuiAutoExit --outputStyle=static format:write`
- **Format a single file:** `npx nx --tuiAutoExit --outputStyle=static format:write --files=${FILE}`

### Typescript

- Avoid casting to `any`.

### Testing

- **Unit Testing:** Jest is used for unit testing, with tests (`*.spec.ts`) located in `apps/main/src`.
- **End-to-End Testing:** Playwright is used for E2E testing, with tests located in `apps/e2e-main/src`.

### Commits

The project uses `husky` and `lint-staged` to run pre-commit hooks that lint and format staged files, ensuring code quality before commits.

### Nx Generators

The workspace is set up to use Nx generators for creating new applications and libraries, streamlining the development process.

## Key documentation

- [Eng Design](docs/eng-design.md)
- [Product Design](docs/product-design.md)
