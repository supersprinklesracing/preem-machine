## 2024-06-03 - Organization Page Query Optimization
**Learning:** Preventing deep hierarchical data fetching for pages that only need shallow data (like Organization list view) significantly reduces read operations.
**Action:** When creating data fetching functions, consider if the consumer needs the full tree or just the top level. Use shallow fetchers where possible.
