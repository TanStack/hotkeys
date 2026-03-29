---
id: HotkeySequenceRecorderState
title: HotkeySequenceRecorderState
---

# Interface: HotkeySequenceRecorderState

Defined in: [hotkey-sequence-recorder.ts:17](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-sequence-recorder.ts#L17)

State interface for the HotkeySequenceRecorder.

## Properties

### isRecording

```ts
isRecording: boolean;
```

Defined in: [hotkey-sequence-recorder.ts:19](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-sequence-recorder.ts#L19)

Whether recording is currently active

***

### recordedSequence

```ts
recordedSequence: HotkeySequence | null;
```

Defined in: [hotkey-sequence-recorder.ts:23](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-sequence-recorder.ts#L23)

The last successfully committed sequence, or null if none / after starting a new session

***

### steps

```ts
steps: HotkeySequence;
```

Defined in: [hotkey-sequence-recorder.ts:21](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-sequence-recorder.ts#L21)

Chords captured so far in the current recording session
