---
'@tanstack/solid-hotkeys': patch
---

A server render of a component that calls `createHotkeyRecorder` no longer prints Solid's `[SERVER_WRITE]` warning, which Solid says will become an error. The recorder reset its state when the server render ended, while its readers were still subscribed.
