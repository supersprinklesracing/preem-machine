## 2025-12-19 - Mantine FileButton Accessibility
**Learning:** Mantine's `FileButton` component is not keyboard accessible by default because it renders a hidden input and relies on a child element for interaction. Using a generic `Box` as a child leaves keyboard users unable to trigger the upload.
**Action:** Always wrap the trigger content of a `FileButton` in an interactive element like `UnstyledButton` (with `aria-label`) to ensure it receives focus and keyboard events.
