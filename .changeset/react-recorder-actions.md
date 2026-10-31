---
'@tanstack/react-hotkeys': patch
'@tanstack/octane-hotkeys': patch
---

`useHotkeyRecorder` returns the same action functions on every render, so memoized children and effects that depend on them no longer re-run.
