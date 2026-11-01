---
'@tanstack/alpine-hotkeys': minor
---

- **Breaking:** the recorder is no longer part of `$hotkeys` and `createHotkeysScope`, which removes about 1.6 KB (brotli) from every app. Use `createHotkeyRecorder($hotkeys, options)`, or register `hotkeyRecorderPlugin` and use `$hotkeyRecorder(options)`.
- An error in a hotkey effect, such as a conflict after a reactive hotkey changes, is reported instead of stopping Alpine's update queue.
