---
id: HotkeyCallbackContext
title: HotkeyCallbackContext
---

```ts
type HotkeyCallbackContext = 
  | HotkeyChordCallbackContext
  | HotkeySequenceCallbackContext;
```

Defined in: [hotkey.types.ts:254](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.types.ts#L254)

Context passed to hotkey callbacks along with the keyboard event.
Narrow with `kind` to read `parsedChord` or `parsedSequence`.
