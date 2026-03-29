---
title: Sequence Recording Guide
id: sequence-recording
---

Use `injectHotkeySequenceRecorder` from `@tanstack/angular-hotkeys` for sequence recording. It returns signals: `isRecording()`, `steps()`, `recordedSequence()`, and methods `startRecording`, `stopRecording`, `cancelRecording`, `commitRecording`.

Options match the core `HotkeySequenceRecorder` class. Provide defaults via `provideHotkeys({ hotkeySequenceRecorder: { ... } })`.

### `ignoreInputs`

The `HotkeySequenceRecorderOptions` supports an `ignoreInputs` option (defaults to `true`). When `true`, the recorder will not intercept normal typing in text inputs, textareas, selects, or contentEditable elements -- keystrokes pass through to the input as usual. Pressing **Escape** still cancels recording even when focused on an input. Set `ignoreInputs: false` if you want the recorder to capture keys from within input elements.
