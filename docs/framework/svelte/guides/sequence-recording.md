---
title: Sequence Recording Guide
id: sequence-recording
---

Use `createHotkeySequenceRecorder` from `@tanstack/svelte-hotkeys`. Reactive getters `isRecording`, `steps`, `recordedSequence` and methods `startRecording`, `stopRecording`, `cancelRecording`, `commitRecording` match the hotkey recorder pattern.

Configure `commitKeys`, `commitOnEnter`, and `idleTimeoutMs` on the options object; set defaults on `HotkeysProvider` with `hotkeySequenceRecorder`.
