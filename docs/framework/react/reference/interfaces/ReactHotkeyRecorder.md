---
id: ReactHotkeyRecorder
title: ReactHotkeyRecorder
---

# Interface: ReactHotkeyRecorder

Defined in: [useHotkeyRecorder.ts:6](https://github.com/TanStack/keys/blob/main/packages/react-keys/src/useHotkeyRecorder.ts#L6)

## Properties

### cancelRecording()

```ts
cancelRecording: () => void;
```

Defined in: [useHotkeyRecorder.ts:16](https://github.com/TanStack/keys/blob/main/packages/react-keys/src/useHotkeyRecorder.ts#L16)

Cancel recording without saving

#### Returns

`void`

***

### isRecording

```ts
isRecording: boolean;
```

Defined in: [useHotkeyRecorder.ts:8](https://github.com/TanStack/keys/blob/main/packages/react-keys/src/useHotkeyRecorder.ts#L8)

Whether recording is currently active

***

### recordedHotkey

```ts
recordedHotkey: Hotkey | null;
```

Defined in: [useHotkeyRecorder.ts:10](https://github.com/TanStack/keys/blob/main/packages/react-keys/src/useHotkeyRecorder.ts#L10)

The currently recorded hotkey (for live preview)

***

### startRecording()

```ts
startRecording: () => void;
```

Defined in: [useHotkeyRecorder.ts:12](https://github.com/TanStack/keys/blob/main/packages/react-keys/src/useHotkeyRecorder.ts#L12)

Start recording a new hotkey

#### Returns

`void`

***

### stopRecording()

```ts
stopRecording: () => void;
```

Defined in: [useHotkeyRecorder.ts:14](https://github.com/TanStack/keys/blob/main/packages/react-keys/src/useHotkeyRecorder.ts#L14)

Stop recording (same as cancel)

#### Returns

`void`
