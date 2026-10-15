---
'@tanstack/hotkeys': minor
---

Add `capture: true` for hotkeys, including sequences, to handle shortcuts before descendant widgets consume them. Capture defaults to false and supports runtime updates while preserving registration state. App hotkeys can declare it, and framework adapters inherit the option, including provider defaults.
