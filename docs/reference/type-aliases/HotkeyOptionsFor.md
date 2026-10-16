---
id: HotkeyOptionsFor
title: HotkeyOptionsFor
---

```ts
type HotkeyOptionsFor<T> = [T] extends [never] ? HotkeyChordOptions & HotkeySequenceOptions : T extends readonly [RegisterableHotkeyChord] ? HotkeyChordOptions : T extends HotkeySequence ? HotkeySequenceOptions : HotkeyChordOptions;
```

Defined in: [hotkey-manager.ts:112](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L112)

The options type for a hotkey: chord options for chords (including one-step
tuples), sequence options for sequences.

## Type Parameters

### T

`T` *extends* [`RegisterableHotkey`](RegisterableHotkey.md)
