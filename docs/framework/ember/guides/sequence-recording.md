---
title: Sequence Recording Guide
id: sequence-recording
---

Use `HotkeySequenceRecorder` from `@tanstack/ember-hotkeys` for recording multi-key sequences. It exposes `start`, `stop`, `cancel`, and `commit` methods, along with state like `isRecording`, `steps`, and `recordedSequence`.

```ts
import { HotkeySequenceRecorder } from '@tanstack/ember-hotkeys';

const recorder = new HotkeySequenceRecorder({
  onRecord: (sequence) => console.log('Recorded:', sequence),
  onCancel: () => console.log('Cancelled'),
});
```

## `ignoreInputs`

The `HotkeySequenceRecorder` supports an `ignoreInputs` option (defaults to `true`). When `true`, the recorder will not intercept normal typing in text inputs, textareas, selects, or contentEditable elements — keystrokes pass through to the input as usual. Pressing **Escape** still cancels recording even when focused on an input. Set `ignoreInputs: false` if you want the recorder to capture keys from within input elements.
