---
'@tanstack/hotkeys': patch
---

Held-key state releases AltGr when a later key press reports AltGr as up, so a missed AltGr keyup no longer hides hotkey hints until the window loses focus.
