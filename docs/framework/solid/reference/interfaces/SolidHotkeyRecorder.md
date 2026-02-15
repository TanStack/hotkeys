---
id: SolidHotkeyRecorder
title: SolidHotkeyRecorder
---

# Interface: SolidHotkeyRecorder

Defined in: [createHotkeyRecorder.ts:6](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/createHotkeyRecorder.ts#L6)

## Properties

### cancelRecording()

```ts
cancelRecording: () => void;
```

Defined in: [createHotkeyRecorder.ts:16](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/createHotkeyRecorder.ts#L16)

Cancel recording without saving

#### Returns

`void`

***

### isRecording()

```ts
isRecording: () => boolean;
```

Defined in: [createHotkeyRecorder.ts:8](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/createHotkeyRecorder.ts#L8)

Whether recording is currently active

#### Returns

`boolean`

***

### recordedHotkey()

```ts
recordedHotkey: () => Hotkey | null;
```

Defined in: [createHotkeyRecorder.ts:10](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/createHotkeyRecorder.ts#L10)

The currently recorded hotkey (for live preview)

#### Returns

`Hotkey` \| `null`

***

### startRecording()

```ts
startRecording: () => void;
```

Defined in: [createHotkeyRecorder.ts:12](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/createHotkeyRecorder.ts#L12)

Start recording a new hotkey

#### Returns

`void`

***

### stopRecording()

```ts
stopRecording: () => void;
```

Defined in: [createHotkeyRecorder.ts:14](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/createHotkeyRecorder.ts#L14)

Stop recording (same as cancel)

#### Returns

`void`
