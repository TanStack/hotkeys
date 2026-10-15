---
id: HotkeyRecorderState
title: HotkeyRecorderState
---

Defined in: [hotkey-recorder.ts:24](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L24)

State interface for the HotkeyRecorder.

## Properties

### isRecording

```ts
isRecording: boolean;
```

Defined in: [hotkey-recorder.ts:26](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L26)

Whether recording is currently active

***

### recordedHotkey

```ts
recordedHotkey: Hotkey | null;
```

Defined in: [hotkey-recorder.ts:30](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L30)

The last committed hotkey: a chord, or a sequence of two or more steps

***

### steps

```ts
steps: HotkeySequence;
```

Defined in: [hotkey-recorder.ts:28](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L28)

Chords recorded so far in a multi-step recording (empty for `maxSteps: 1`)
