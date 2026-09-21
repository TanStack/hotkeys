---
id: HotkeySequenceRecorderState
title: HotkeySequenceRecorderState
---

Defined in: [hotkey-sequence-recorder.ts:30](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-sequence-recorder.ts#L30)

State interface for the HotkeySequenceRecorder.

## Properties

### isRecording

```ts
isRecording: boolean;
```

Defined in: [hotkey-sequence-recorder.ts:32](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-sequence-recorder.ts#L32)

Whether recording is currently active

***

### recordedSequence

```ts
recordedSequence: HotkeySequence | null;
```

Defined in: [hotkey-sequence-recorder.ts:36](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-sequence-recorder.ts#L36)

The last successfully committed sequence, or null if none / after starting a new session

***

### steps

```ts
steps: HotkeySequence;
```

Defined in: [hotkey-sequence-recorder.ts:34](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-sequence-recorder.ts#L34)

Chords captured so far in the current recording session
