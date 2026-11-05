---
'@tanstack/hotkeys': minor
---

A hotkey with an unknown modifier or no key besides modifiers now registers nothing, and `validateHotkey` reports both as errors. Before, an unknown modifier was dropped, so `Ctl+K` from plain JavaScript or saved data fired on a bare K. `parseHotkey` now returns an empty key for it, so `normalizeHotkey` and `formatForDisplay` return an empty string. Modifier-only hotkeys such as `Shift+Alt+Mod` never fired, and a modifier code such as `[ShiftLeft]` fired on every Shift release. The types no longer accept modifier codes such as `[ShiftLeft]` as a key. Use the held-key APIs to act while modifiers are held.
