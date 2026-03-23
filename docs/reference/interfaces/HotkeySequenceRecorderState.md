---
id: HotkeySequenceRecorderState
title: HotkeySequenceRecorderState
---

# Interface: HotkeySequenceRecorderState

Defined in: hotkey-sequence-recorder.ts:16

State interface for the HotkeySequenceRecorder.

## Properties

### isRecording

```ts
isRecording: boolean;
```

Defined in: hotkey-sequence-recorder.ts:18

Whether recording is currently active

***

### recordedSequence

```ts
recordedSequence: HotkeySequence | null;
```

Defined in: hotkey-sequence-recorder.ts:22

The last successfully committed sequence, or null if none / after starting a new session

***

### steps

```ts
steps: HotkeySequence;
```

Defined in: hotkey-sequence-recorder.ts:20

Chords captured so far in the current recording session
