---
id: HotkeySequenceRecorderState
title: HotkeySequenceRecorderState
---

# Interface: HotkeySequenceRecorderState

Defined in: [hotkey-sequence-recorder.ts:16](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-sequence-recorder.ts#L16)

State interface for the HotkeySequenceRecorder.

## Properties

### isRecording

```ts
isRecording: boolean;
```

Defined in: [hotkey-sequence-recorder.ts:18](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-sequence-recorder.ts#L18)

Whether recording is currently active

***

### recordedSequence

```ts
recordedSequence: HotkeySequence | null;
```

Defined in: [hotkey-sequence-recorder.ts:22](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-sequence-recorder.ts#L22)

The last successfully committed sequence, or null if none / after starting a new session

***

### steps

```ts
steps: HotkeySequence;
```

Defined in: [hotkey-sequence-recorder.ts:20](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-sequence-recorder.ts#L20)

Chords captured so far in the current recording session
