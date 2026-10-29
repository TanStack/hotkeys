---
'@tanstack/hotkeys': minor
---

Input detection now matches what users type into. Single-key hotkeys such as `K` can fire where they were blocked before, so check any hotkeys that relied on the old behavior.

- Checkbox, radio, range, color, file, and image inputs, and read-only text inputs and textareas, are no longer text fields. Hotkeys skip only the keys each control uses, such as Space on a checkbox and the arrow keys on a range input.
- `role="textbox"` and `role="searchbox"` elements count as text fields.
- A custom element with focus inside a closed shadow root, or a form-associated custom element without a `role` attribute, counts as a text field, because its contents can't be seen from outside.
- `hasActiveRegistration` and hotkey hints see focus on content slotted into a hotkey's target, and focus in nested shadow roots.
