---
title: Sequence Recording Guide
id: sequence-recording
---

Use `createHotkeySequenceRecorder` from `@tanstack/solid-hotkeys` to record multi-chord sequences. API mirrors `createHotkeyRecorder`: accessors `isRecording`, `steps`, `recordedSequence`, plus `startRecording`, `stopRecording`, `cancelRecording`, `commitRecording`.

Options and keyboard behavior are the same as the core `HotkeySequenceRecorder` class (`commitKeys`, `commitOnEnter`, `idleTimeoutMs`, Enter / Escape / Backspace). Set provider defaults with `HotkeysProvider` `defaultOptions.hotkeySequenceRecorder`.

### `ignoreInputs`

The `HotkeySequenceRecorderOptions` supports an `ignoreInputs` option (defaults to `true`). When `true`, the recorder will not intercept normal typing in text inputs, textareas, selects, or contentEditable elements -- keystrokes pass through to the input as usual. Pressing **Escape** still cancels recording even when focused on an input. Set `ignoreInputs: false` if you want the recorder to capture keys from within input elements.
