---
id: HotkeyRecorderState
title: HotkeyRecorderState
---

# Interface: HotkeyRecorderState

Defined in: [recorder.ts:14](https://github.com/TanStack/keys/blob/main/packages/hotkeys/src/recorder.ts#L14)

State interface for the HotkeyRecorder.

## Properties

### isRecording

```ts
isRecording: boolean;
```

Defined in: [recorder.ts:16](https://github.com/TanStack/keys/blob/main/packages/hotkeys/src/recorder.ts#L16)

Whether recording is currently active

***

### recordedHotkey

```ts
recordedHotkey: Hotkey | null;
```

Defined in: [recorder.ts:18](https://github.com/TanStack/keys/blob/main/packages/hotkeys/src/recorder.ts#L18)

The currently recorded hotkey (for live preview)
