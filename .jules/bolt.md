## 2026-01-06 - Optimized Home Page Data Fetching
**Learning:** The "Upcoming Events" section on the home page was triggering an N+1 query waterfall (Events -> Races -> Preems -> Contributions), fetching deeply nested data that was never used in the UI.
**Action:** Introduced a `getRacesForEventShallow` function that fetches races for an event without their children (preems). This is used specifically for the home page event list, significantly reducing the number of database reads. Future list views should verify if they need deep data before reusing generic fetch functions.
