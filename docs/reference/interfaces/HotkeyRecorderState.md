---
id: HotkeyRecorderState
title: HotkeyRecorderState
---

Defined in: [hotkey-recorder.ts:87](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L87)

State interface for the HotkeyRecorder.

## Properties

### isRecording

```ts
isRecording: boolean;
```

Defined in: [hotkey-recorder.ts:89](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L89)

Whether recording is currently active

***

### recordedHotkey

```ts
recordedHotkey: Hotkey | null;
```

Defined in: [hotkey-recorder.ts:93](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L93)

The last committed hotkey: a chord, or a sequence of two or more steps

***

### steps

```ts
steps: HotkeySequence;
```

Defined in: [hotkey-recorder.ts:91](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L91)

Chords recorded so far in a multi-step recording (empty for `maxSteps: 1`)
