---
'@tanstack/hotkeys': patch
---

fix: support hotkey targets in same-origin iframes and popup windows. Hotkeys targeting another frame's document, window, or element now fire, and typing in that frame's inputs is ignored.
