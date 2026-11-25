---
'@tanstack/hotkeys': patch
---

Held-key state no longer keeps an input method's `Process` keydown, whose keyup may never arrive. A modifier pressed during a composition still counts as held.
