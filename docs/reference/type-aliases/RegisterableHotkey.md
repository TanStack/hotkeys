---
id: RegisterableHotkey
title: RegisterableHotkey
---

```ts
type RegisterableHotkey = Hotkey | RawHotkey;
```

Defined in: [hotkey.types.ts:207](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.types.ts#L207)

A hotkey that can be passed to `HotkeyManager.register()` and `useHotkey()`.
Either a type-safe string (`Hotkey`) or a raw object (`RawHotkey`).
