---
id: RecorderRejectionReason
title: RecorderRejectionReason
---

```ts
type RecorderRejectionReason = "alt-graph" | "missing-code" | "whitespace" | "validation" | "conflict";
```

Defined in: [hotkey-recorder.ts:36](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L36)

Why the recorder rejected a key press or a recording:

- `'alt-graph'`: AltGr typed a character, which physical recording can't
  record. Record by key to accept characters.
- `'missing-code'`: the event has no usable physical key code.
- `'whitespace'`: the key is a whitespace character, which a hotkey can't
  hold.
- `'validation'`: your `validate` callback rejected the recording.
- `'conflict'`: the recording conflicts with registered hotkeys.
