## 2024-05-22 - Missing Peer Dependency in Test Setup
**Learning:** `firestore-jest-mock` implicitly relies on `lodash` (specifically `lodash/merge`) but does not list it as a dependency. This causes `Cannot find module 'lodash/merge'` errors.
**Action:** Install `lodash` and `@types/lodash` as dev dependencies. This is necessary for tests using `firestore-jest-mock` to run correctly.
