---
title: Sequence Recording Guide
id: sequence-recording
---

Use `createHotkeySequenceRecorder` from `@tanstack/solid-hotkeys` to record multi-chord sequences. API mirrors `createHotkeyRecorder`: accessors `isRecording`, `steps`, `recordedSequence`, plus `startRecording`, `stopRecording`, `cancelRecording`, `commitRecording`.

Options and keyboard behavior are the same as the core `HotkeySequenceRecorder` class (`commitKeys`, `commitOnEnter`, `idleTimeoutMs`, Enter / Escape / Backspace). Set provider defaults with `HotkeysProvider` `defaultOptions.hotkeySequenceRecorder`.
