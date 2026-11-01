---
'@tanstack/preact-hotkeys': patch
---

- Hotkeys, scopes and the recorder register and clean up in layout effects, so they're ready before the next event after a render. On Preact 11, a removed component's hotkey no longer fires.
- `useHotkeyRecorder` returns the same action functions on every render.
