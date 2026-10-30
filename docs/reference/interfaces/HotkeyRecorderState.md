---
id: HotkeyRecorderState
title: HotkeyRecorderState
---

Defined in: [hotkey-recorder.ts:72](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L72)

State interface for the HotkeyRecorder.

## Properties

### isRecording

```ts
isRecording: boolean;
```

Defined in: [hotkey-recorder.ts:74](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L74)

Whether recording is currently active

***

### recordedHotkey

```ts
recordedHotkey: Hotkey | null;
```

Defined in: [hotkey-recorder.ts:78](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L78)

The last committed hotkey: a chord, or a sequence of two or more steps

***

### steps

```ts
steps: HotkeySequence;
```

Defined in: [hotkey-recorder.ts:76](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L76)

Chords recorded so far in a multi-step recording (empty for `maxSteps: 1`)
