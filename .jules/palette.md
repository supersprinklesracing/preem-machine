# Palette's UX Journal

This journal tracks critical UX and accessibility learnings.

## Template

## YYYY-MM-DD - [Title]

**Learning:** [UX/a11y insight]
**Action:** [How to apply next time]

## 2025-02-18 - Icon-Only Link Accessibility

**Learning:** Icon-only links (like user avatars) relying solely on `alt` text can become inaccessible if the image fails to load or is replaced by a decorative placeholder without text.
**Action:** Always add an explicit `aria-label` to the wrapping `Link` component for icon-only interactive elements to ensure a robust accessible name.
