---
'@tanstack/hotkeys': minor
---

Add `capture: true` for hotkeys, including sequences, to handle shortcuts before descendant widgets consume them. Capture defaults to false and supports runtime updates while preserving registration state. App hotkeys can declare it, and framework adapters inherit the option, including provider defaults.

Key-state tracking now listens in the capture phase on `window`, so a capture hotkey on `window` can no longer hide keys from it. If an earlier callback unregisters another hotkey that matches the same key press, the unregistered hotkey no longer fires.
