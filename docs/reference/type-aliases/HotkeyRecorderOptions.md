---
id: HotkeyRecorderOptions
title: HotkeyRecorderOptions
---

```ts
type HotkeyRecorderOptions = 
  | HotkeyChordRecorderOptions
  | HotkeySequenceRecorderOptions;
```

Defined in: [hotkey-recorder.ts:152](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L152)

Options for HotkeyRecorder. `maxSteps` (default 1) selects between recording
a single chord and recording a sequence.
