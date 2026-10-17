---
id: HotkeyRecorderValidationContext
title: HotkeyRecorderValidationContext
---

```ts
type HotkeyRecorderValidationContext = 
  | HotkeyChordRecorderValidationContext
  | HotkeySequenceRecorderValidationContext;
```

Defined in: [hotkey-recorder.ts:66](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L66)

Validation context for a recorded chord or sequence. Narrow with `kind` to
read `parsedChord` or `parsedSequence`.
