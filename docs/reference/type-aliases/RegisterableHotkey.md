---
id: RegisterableHotkey
title: RegisterableHotkey
---

# Type Alias: RegisterableHotkey

```ts
type RegisterableHotkey = Hotkey | RawHotkey;
```

Defined in: [hotkey.ts:363](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.ts#L363)

A hotkey that can be passed to `HotkeyManager.register()` and `useHotkey()`.
Either a type-safe string (`Hotkey`) or a raw object (`RawHotkey`).
