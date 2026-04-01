---
'@tanstack/hotkeys': minor
---

feat: Add `matchBy` option for physical key (`event.code`) matching

Added a new `matchBy` option to `HotkeyOptions` that allows matching hotkeys by physical key position (`event.code`) instead of the default layout-aware matching (`event.key`). This enables hotkeys to work correctly when a non-Latin IME is active and `event.key` produces non-Latin characters.

```ts
useHotkey('A', callback, { matchBy: 'code' })
```
