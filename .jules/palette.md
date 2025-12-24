## 2024-05-23 - Added Visible Labels to Authentication Forms
**Learning:**
Authentication forms often rely solely on placeholders for design minimalism, but this significantly hurts accessibility (no persistent label) and usability (context loss when typing).

**Action:**
I added explicit `label` props to the `TextInput` and `PasswordInput` components in both the Login and Register forms. I also updated the "Submit" button to "Log in" to be more descriptive of the action. This ensures that users always know what field they are filling out, improving the experience for everyone, especially those using screen readers or with cognitive impairments.
