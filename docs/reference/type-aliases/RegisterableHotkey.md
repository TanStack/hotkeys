---
id: RegisterableHotkey
title: RegisterableHotkey
---

```ts
type RegisterableHotkey = 
  | RegisterableHotkeyChord
  | HotkeySequence;
```

Defined in: [hotkey.types.ts:224](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.types.ts#L224)

Anything that can be registered: a chord string, a raw chord object, or a sequence.
