## 2024-05-24 - N+1 Query Optimization in Firestore
**Learning:** Hierarchical data fetching in Firestore (Org -> Series -> Event -> Race -> Preem -> Contribution) using recursive subcollection queries is extremely inefficient (O(N) queries).
**Action:** Use "Batch Fetch by IDs" with `collectionGroup` queries. Fetch parent IDs, then use `where('parentBrief.id', 'in', parentIds)` to fetch children in parallel batches (chunked by 30 due to Firestore limits). This reduces queries to O(Depth) instead of O(Nodes).
