## 2024-05-24 - Accessible Avatars
**Learning:** Decorative images (alt="") are not found by `getByRole('img')`, even with `hidden: true`.
**Action:** Use `container.querySelector('img')` to assert their presence and verify empty alt text.
