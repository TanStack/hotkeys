---
'@tanstack/ember-hotkeys': minor
---

- **Breaking:** `EmberHotkeysScope.useHotkeyRecorder` is removed, which takes about 1.7 KB (brotli) off `createHotkeysScope`. Pass the scope to `useHotkeyRecorder(owner, options, scope)` to use its recorder defaults.
- `useKeyHold` and `useHotkeyHint` re-render only when their value changes, not on every key.
