## 2025-02-18 - Nested Subcollection N+1
**Learning:** The data model relies heavily on nested subcollections (Event -> Race -> Preem -> Contribution). The original query implementation fetched these recursively using sequential `for...of` loops, causing severe N+1 (or N+M+P) latency issues.
**Action:** Always check recursive data fetching functions for sequential `await` in loops. Use `Promise.all` + `map` to parallelize subcollection fetches.
