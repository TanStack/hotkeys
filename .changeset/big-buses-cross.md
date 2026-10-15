---
'@tanstack/hotkeys': patch
---

Recover stale held modifier keys when a system shortcut swallows their keyup without blurring the window. The next real keyboard or mouse event releases any modifier it reports as up. Events dispatched by page code are ignored for this, so they can't clear keys the user is still holding.
