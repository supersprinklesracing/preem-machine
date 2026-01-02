# Bolt Performance Journal

## 2024-05-23 - Initial Optimization Search
**Learning:** The application uses deep recursive fetching for hierarchical data (Organization -> Series -> Event -> Race -> Preem -> Contribution). This results in severe N+1 query issues.
**Action:** Replace recursive waterfall fetches with parallel `collectionGroup` queries where possible, utilizing the denormalized `*Brief` fields that contain the ancestor hierarchy.
