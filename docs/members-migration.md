# Migrate preem-machine/apps/primes to members/apps/primes

This document outlines the detailed step-by-step plan for migrating the "primes" web application from the `preem-machine` monorepo into the `members` monorepo.

## Resolved Decisions

1. **Mantine UI Version:** We will upgrade `primes` to use Mantine UI `v9.0.x` to stay consistent with the `members` monorepo.
2. **Shared Libraries:** We will keep the migrated libraries namespace-separated:
   - `preem-machine/libs/firestore` → `members/libs/primes-firestore`
   - `preem-machine/libs/env-vars` → `members/libs/primes-env`
3. **Stripe Dependencies:** We will add the required Stripe dependencies to the `members` root `package.json`.
4. **Git History:** We will preserve Git history. To do this while renaming paths, we will create a temporary local clone of `preem-machine`, use `git filter-repo` to isolate and rename the target directories (`libs/firestore` -> `libs/primes-firestore`, etc.), and then pull those commits into the `members` repository.
5. **E2E Tests:** We will copy the e2e tests into `members/apps/e2e-primes`.

## Proposed Changes

### Dependencies Layer

#### [MODIFY] [package.json](file:///home/jlapenna/p/members/package.json)

- Add required dependencies from `preem-machine`: `@stripe/stripe-js`, `@stripe/react-stripe-js`, `stripe`.
- Run lockfile synchronization (e.g., `pnpm install`).

### Library Layer

Assuming we keep the libraries separate for the initial migration to reduce scope:

#### [NEW] [members/libs/stripe](file:///home/jlapenna/p/members/libs/stripe)

- Copy from `preem-machine/libs/stripe`.
- Update `package.json` and `project.json` to `@members/stripe`.

#### [NEW] [members/libs/primes-firestore](file:///home/jlapenna/p/members/libs/primes-firestore)

- Copy from `preem-machine/libs/firestore`.
- Update config files to `@members/primes-firestore`.

#### [NEW] [members/libs/primes-env](file:///home/jlapenna/p/members/libs/primes-env)

- Copy from `preem-machine/libs/env-vars`.
- Update config files to `@members/primes-env`.

### Application Layer

#### [NEW] [members/apps/primes](file:///home/jlapenna/p/members/apps/primes)

- Copy `preem-machine/apps/primes` into this directory.
- Update `project.json` name from `@preem-machine/primes` to `@members/primes`.
- Update `tsconfig.json` paths and extends to point to `members` base configs.
- Find and replace all `import { ... } from '@preem-machine/...'` with `import { ... } from '@members/...'`.
- Update internal imports to reference the newly namespaced libraries (`@members/primes-firestore`, `@members/stripe`, `@members/primes-env`).
- Update `apphosting.yaml` and `.env` references as needed.

#### [NEW] [members/apps/e2e-primes](file:///home/jlapenna/p/members/apps/e2e-primes)

- Copy `preem-machine/apps/e2e-primes` into this directory.
- Update Playwright and project config files to target `primes`.

### Infrastructure & Deployment Layer

#### [MODIFY] [firebase.json](file:///home/jlapenna/p/members/firebase.json)

- Add `primes` to the `apphosting` array/configs to allow Firebase to build and serve the application.

#### [NEW] [members/apps/primes/apphosting.yaml](file:///home/jlapenna/p/members/apps/primes/apphosting.yaml)

- Copy the deployment configuration from `preem-machine` and adjust run settings, memory, and environment variables.

### Scripts and Tooling

#### [MODIFY] [tools/setup-repo.sh](file:///home/jlapenna/p/members/tools/setup-repo.sh)

- Refactor the script to cleanly handle `.env` downloads for multiple apps (e.g., adding `primes` alongside `onecake-dev`).

#### [MODIFY] [tools/dotenv-init.sh](file:///home/jlapenna/p/members/tools/dotenv-init.sh)

- Extend secret fetching logic to accommodate `primes` specific `.env` keys.

#### [MODIFY] [.agents/skills/sprinkles-dev/scripts/deploy.py](file:///home/jlapenna/p/members/.agents/skills/sprinkles-dev/scripts/deploy.py)

- Ensure the custom deployment script correctly identifies `primes` as a valid deployment target and routes `apphosting` properly.

## Verification Plan

### Automated Tests

- Run `pnpm exec nx test primes` to ensure unit tests pass.
- Run `pnpm exec nx test stripe` and other migrated libraries.
- Run `pnpm exec nx e2e e2e-primes` to verify the application flows remain unbroken.

### Build & Lint

- Run `pnpm exec nx lint primes` and apply automated fixes.
- Run `pnpm exec nx build primes` to ensure Next.js can successfully compile a standalone production bundle.

### Infrastructure Verification

- Use `./tools/setup-repo.sh` on a fresh branch to verify `apps/primes/.env.development.local` for `primes` is downloaded correctly.
- Test the deployment script locally with `python3 .agents/skills/sprinkles-dev/scripts/deploy.py primes --monitor-only` (or a dry-run equivalent) to ensure Firebase target mapping succeeds.
- Start the server using `./tools/nx run @members/primes:serve`.
- Navigate to the local instance (e.g., `localhost:4200`) and manually verify the UI loads.
