---
'@tanstack/hotkeys': patch
---

A hotkey callback that throws no longer stops the other hotkeys on the same key press. The error is reported as uncaught on the next microtask, the way separate event listeners report theirs.
