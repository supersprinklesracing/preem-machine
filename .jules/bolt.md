# Bolt's Journal

## 2024-05-22 - Initial Setup
**Learning:** Performance requires measurement. Always look for measurable wins.
**Action:** Start by exploring common hotspots like list rendering and data fetching.

## 2024-05-22 - List Virtualization & Memoization
**Learning:** `useMediaQuery` in Mantine triggers re-renders on resize. If a component renders a list, the entire list is re-created even if data is stable. `React.memo` on list items prevents this O(N) re-render cost. Also, setting `getInitialValueInEffect: false` in `useMediaQuery` avoids hydration mismatches in Next.js.
**Action:** Always memoize list items in components that depend on global state or media queries.
