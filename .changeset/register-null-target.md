---
'@tanstack/hotkeys': minor
---

Behavior change: `HotkeyManager.register` with `target: null` now registers nothing and returns an inactive handle. Before, it listened on `document`, so a `querySelector` that found no element turned an element hotkey into a page-wide one that also prevented the key's default action. The framework adapters already skipped a `null` target. To listen on `document`, omit `target` or pass `document`.
