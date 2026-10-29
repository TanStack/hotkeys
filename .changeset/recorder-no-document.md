---
'@tanstack/hotkeys': patch
---

`HotkeyRecorder.start()` does nothing without a `document`. A recorder started during a server render no longer stays in the shared recording set and suspends hotkey dispatch for the rest of the process.
