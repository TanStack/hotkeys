---
'@tanstack/hotkeys': patch
---

`formatForDisplay` orders modifiers the same way on every platform. Held modifiers joined in the order they were pressed, such as `'Shift+Control'`, now display as `Ctrl+Shift` on Windows and Linux, as they already did on macOS.
