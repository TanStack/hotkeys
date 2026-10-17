---
id: RegisterableHotkey
title: RegisterableHotkey
---

```ts
type RegisterableHotkey = 
  | RegisterableHotkeyChord
  | RegisterableHotkeySequence;
```

Defined in: [hotkey.types.ts:229](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.types.ts#L229)

Anything that can be registered: a chord or a sequence, with each chord
written as a string or an object.
