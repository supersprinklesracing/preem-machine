# Gemini Code Assistant Workspace Context

This document provides context for the Gemini Code Assistant to understand the structure and conventions of this workspace.

## Building and Running

The following commands are used to build, run, and test the project.

Always pass `--outputStyle=stream-without-prefixes` to the `nx` command.

- **Run the dev server:** `npx nx --outputStyle=stream-without-prefixes dev main`
- **Verify the build:** `nx --outputStyle=stream-without-prefixes run @preem-machine/main:build:verify`
- **Create a production bundle:** `nx --outputStyle=stream-without-prefixes run @preem-machine/main:build:production`
- **Run unit tests:** `npx nx --outputStyle=stream-without-prefixes test main --forceExit`
- **Run end-to-end tests:** `npx nx --outputStyle=stream-without-prefixes e2e e2e-main`

To see all available targets for the main application, run:

```sh
npx nx show project main
```

## Development Conventions

### Code Style

The project enforces a consistent code style using ESLint, Prettier, and Stylelint. Configuration files are located at the root of the workspace (`eslint.config.mjs`, `.prettierrc`, `.stylelintrc.json`).

### Typescript

- Avoid casting to `any`.

### Testing

- **Unit Testing:** Jest is used for unit testing, with tests (`*.spec.ts`) located in `apps/main/src`.
- **End-to-End Testing:** Playwright is used for E2E testing, with tests located in `apps/e2e-main/src`.

### Commits

The project uses `husky` and `lint-staged` to run pre-commit hooks that lint and format staged files, ensuring code quality before commits.

### Nx Generators

The workspace is set up to use Nx generators for creating new applications and libraries, streamlining the development process.

## Key Documentation

@docs/eng-design.md
@docs/product-design.md

## Gemini Added Memories

- When verifying a build for this project, use the command: `nx run main:build:verify --outputStyle=stream-without-prefixes`
- The user prefers `nx` commands to use `--outputStyle=stream-without-prefixes` (but additional flags may be added)
