---
id: ReactHotkeyRecorder
title: ReactHotkeyRecorder
---

# Interface: ReactHotkeyRecorder

Defined in: [useHotkeyRecorder.ts:7](https://github.com/TanStack/keys/blob/main/packages/react-hotkeys/src/useHotkeyRecorder.ts#L7)

## Properties

### cancelRecording()

```ts
cancelRecording: () => void;
```

Defined in: [useHotkeyRecorder.ts:17](https://github.com/TanStack/keys/blob/main/packages/react-hotkeys/src/useHotkeyRecorder.ts#L17)

Cancel recording without saving

#### Returns

`void`

***

### isRecording

```ts
isRecording: boolean;
```

Defined in: [useHotkeyRecorder.ts:9](https://github.com/TanStack/keys/blob/main/packages/react-hotkeys/src/useHotkeyRecorder.ts#L9)

Whether recording is currently active

***

### recordedHotkey

```ts
recordedHotkey: Hotkey | null;
```

Defined in: [useHotkeyRecorder.ts:11](https://github.com/TanStack/keys/blob/main/packages/react-hotkeys/src/useHotkeyRecorder.ts#L11)

The currently recorded hotkey (for live preview)

***

### startRecording()

```ts
startRecording: () => void;
```

Defined in: [useHotkeyRecorder.ts:13](https://github.com/TanStack/keys/blob/main/packages/react-hotkeys/src/useHotkeyRecorder.ts#L13)

Start recording a new hotkey

#### Returns

`void`

***

### stopRecording()

```ts
stopRecording: () => void;
```

Defined in: [useHotkeyRecorder.ts:15](https://github.com/TanStack/keys/blob/main/packages/react-hotkeys/src/useHotkeyRecorder.ts#L15)

Stop recording (same as cancel)

#### Returns

`void`
