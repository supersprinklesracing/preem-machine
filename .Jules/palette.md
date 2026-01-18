## 2025-02-18 - Accessible File Uploads
**Learning:** Mantine's `FileButton` renders a hidden input and relies on a child element for interaction. Using a generic `div` or `Box` makes the upload trigger inaccessible to keyboard users.
**Action:** Always wrap the visual trigger in an `<UnstyledButton>` (or semantic `<button>`) with an `aria-label` to ensure proper keyboard focus, activation, and screen reader support.
