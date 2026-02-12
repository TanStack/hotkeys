---
id: RegisterableHotkey
title: RegisterableHotkey
---

# Type Alias: RegisterableHotkey

```ts
type RegisterableHotkey = Hotkey | RawHotkey;
```

Defined in: [hotkey.ts:362](https://github.com/TanStack/keys/blob/main/packages/hotkeys/src/hotkey.ts#L362)

A hotkey that can be passed to `HotkeyManager.register()` and `useHotkey()`.
Either a type-safe string (`Hotkey`) or a raw object (`RawHotkey`).
