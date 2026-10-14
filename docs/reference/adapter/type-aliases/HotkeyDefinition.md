---
id: HotkeyDefinition
title: HotkeyDefinition
---

```ts
type HotkeyDefinition = 
  | {
  callback: HotkeyCallback;
  hotkey: RegisterableHotkeyChord;
  options?: HotkeyChordOptions;
}
  | {
  callback: HotkeyCallback;
  hotkey: HotkeySequence;
  options?: HotkeySequenceOptions;
};
```

Defined in: [adapter.ts:34](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/adapter.ts#L34)

A hotkey and its callback, with optional per-binding options. Chords accept
`requireReset`; sequences accept `timeout`.
