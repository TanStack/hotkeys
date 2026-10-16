---
id: HotkeyRecorderState
title: HotkeyRecorderState
---

Defined in: [hotkey-recorder.ts:59](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L59)

State interface for the HotkeyRecorder.

## Properties

### isRecording

```ts
isRecording: boolean;
```

Defined in: [hotkey-recorder.ts:61](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L61)

Whether recording is currently active

***

### recordedHotkey

```ts
recordedHotkey: Hotkey | null;
```

Defined in: [hotkey-recorder.ts:65](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L65)

The last committed hotkey: a chord, or a sequence of two or more steps

***

### steps

```ts
steps: HotkeySequence;
```

Defined in: [hotkey-recorder.ts:63](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L63)

Chords recorded so far in a multi-step recording (empty for `maxSteps: 1`)
