---
id: HotkeyRecorderState
title: HotkeyRecorderState
---

Defined in: [hotkey-recorder.ts:73](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L73)

State interface for the HotkeyRecorder.

## Properties

### isRecording

```ts
isRecording: boolean;
```

Defined in: [hotkey-recorder.ts:75](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L75)

Whether recording is currently active

***

### recordedHotkey

```ts
recordedHotkey: Hotkey | null;
```

Defined in: [hotkey-recorder.ts:79](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L79)

The last committed hotkey: a chord, or a sequence of two or more steps

***

### steps

```ts
steps: HotkeySequence;
```

Defined in: [hotkey-recorder.ts:77](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L77)

Chords recorded so far in a multi-step recording (empty for `maxSteps: 1`)
