---
id: HotkeyRecorderState
title: HotkeyRecorderState
---

# Interface: HotkeyRecorderState

Defined in: [hotkey-recorder.ts:10](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L10)

State interface for the HotkeyRecorder.

## Properties

### isRecording

```ts
isRecording: boolean;
```

Defined in: [hotkey-recorder.ts:12](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L12)

Whether recording is currently active

***

### recordedHotkey

```ts
recordedHotkey: Hotkey | null;
```

Defined in: [hotkey-recorder.ts:14](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L14)

The currently recorded hotkey (for live preview)
