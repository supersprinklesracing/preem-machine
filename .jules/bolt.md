## 2024-05-22 - Missing Peer Dependency in Test Setup
**Learning:** `firestore-jest-mock` implicitly relies on `lodash` (specifically `lodash/merge`) but does not list it as a dependency. This causes `Cannot find module 'lodash/merge'` errors.
**Action:** Instead of adding `lodash` as a dependency (which requires permission), mock `lodash/merge` in `jest.setup.ts` with a simple deep merge implementation using `jest.mock('lodash/merge', ..., { virtual: true })`.
