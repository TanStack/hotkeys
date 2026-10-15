---
id: SolidHotkeyRecorder
title: SolidHotkeyRecorder
---

Defined in: [createHotkeyRecorder.ts:14](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/createHotkeyRecorder.ts#L14)

## Type Parameters

### THotkey

`THotkey` *extends* `Hotkey` = `Hotkey`

## Properties

### cancelRecording

```ts
cancelRecording: () => void;
```

Defined in: [createHotkeyRecorder.ts:26](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/createHotkeyRecorder.ts#L26)

Cancel recording and call onCancel

#### Returns

`void`

***

### commitRecording

```ts
commitRecording: () => void;
```

Defined in: [createHotkeyRecorder.ts:28](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/createHotkeyRecorder.ts#L28)

Commit the recorded steps now (multi-step recordings)

#### Returns

`void`

***

### isRecording

```ts
isRecording: () => boolean;
```

Defined in: [createHotkeyRecorder.ts:16](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/createHotkeyRecorder.ts#L16)

Whether recording is currently active

#### Returns

`boolean`

***

### recordedHotkey

```ts
recordedHotkey: () => THotkey | null;
```

Defined in: [createHotkeyRecorder.ts:20](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/createHotkeyRecorder.ts#L20)

The last committed hotkey

#### Returns

`THotkey` \| `null`

***

### startRecording

```ts
startRecording: () => void;
```

Defined in: [createHotkeyRecorder.ts:22](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/createHotkeyRecorder.ts#L22)

Start recording a new hotkey

#### Returns

`void`

***

### steps

```ts
steps: () => HotkeySequence;
```

Defined in: [createHotkeyRecorder.ts:18](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/createHotkeyRecorder.ts#L18)

Chords recorded so far in a multi-step recording (for live preview)

#### Returns

`HotkeySequence`

***

### stopRecording

```ts
stopRecording: () => void;
```

Defined in: [createHotkeyRecorder.ts:24](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/createHotkeyRecorder.ts#L24)

Stop recording without calling onCancel

#### Returns

`void`
