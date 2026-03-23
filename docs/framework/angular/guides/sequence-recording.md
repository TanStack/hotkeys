---
title: Sequence Recording Guide
id: sequence-recording
---

Use `injectHotkeySequenceRecorder` from `@tanstack/angular-hotkeys` for sequence recording. It returns signals: `isRecording()`, `steps()`, `recordedSequence()`, and methods `startRecording`, `stopRecording`, `cancelRecording`, `commitRecording`.

Options match the core `HotkeySequenceRecorder` class. Provide defaults via `provideHotkeys({ hotkeySequenceRecorder: { ... } })`.
