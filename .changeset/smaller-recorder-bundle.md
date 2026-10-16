---
'@tanstack/hotkeys': patch
---

Shrink bundles that use `HotkeyRecorder` without `HotkeyManager`. The recorder's opt-in conflict check no longer bundles the manager, so a recorder-only bundle drops from about 9.4 kB to 6.2 kB (minified and brotlied). `findHotkeyConflicts` no longer creates the manager when none exists. `normalizeKeyName` now resolves key aliases in any case (`'ESC'` → `'Escape'`). `isModifierKey` returns `false` for `Object.prototype` names such as `'constructor'`.
