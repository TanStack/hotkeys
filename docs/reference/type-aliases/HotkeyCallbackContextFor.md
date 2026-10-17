---
id: HotkeyCallbackContextFor
title: HotkeyCallbackContextFor
---

```ts
type HotkeyCallbackContextFor<T> = [T] extends [never] ? HotkeyCallbackContext : T extends readonly [RegisterableHotkeyChord] ? HotkeyChordCallbackContext : T extends RegisterableHotkeySequence ? HotkeySequenceCallbackContext : HotkeyChordCallbackContext;
```

Defined in: [hotkey.types.ts:262](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.types.ts#L262)

The callback context for a hotkey: chord context for chords (including
one-step tuples), sequence context for sequences, and either when the kind
is not known statically.

## Type Parameters

### T

`T` *extends* [`RegisterableHotkey`](RegisterableHotkey.md)
