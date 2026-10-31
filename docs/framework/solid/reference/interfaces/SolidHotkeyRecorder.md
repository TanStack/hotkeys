---
id: SolidHotkeyRecorder
title: SolidHotkeyRecorder
---

Defined in: [createHotkeyRecorder.ts:15](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/createHotkeyRecorder.ts#L15)

## Type Parameters

### THotkey

`THotkey` *extends* `Hotkey` = `Hotkey`

## Properties

### cancelRecording

```ts
cancelRecording: () => void;
```

Defined in: [createHotkeyRecorder.ts:27](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/createHotkeyRecorder.ts#L27)

Cancel recording and call onCancel

#### Returns

`void`

***

### commitRecording

```ts
commitRecording: () => void;
```

Defined in: [createHotkeyRecorder.ts:29](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/createHotkeyRecorder.ts#L29)

Commit the recorded steps now (multi-step recordings)

#### Returns

`void`

***

### isRecording

```ts
isRecording: () => boolean;
```

Defined in: [createHotkeyRecorder.ts:17](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/createHotkeyRecorder.ts#L17)

Whether recording is currently active

#### Returns

`boolean`

***

### recordedHotkey

```ts
recordedHotkey: () => THotkey | null;
```

Defined in: [createHotkeyRecorder.ts:21](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/createHotkeyRecorder.ts#L21)

The last committed hotkey

#### Returns

`THotkey` \| `null`

***

### startRecording

```ts
startRecording: () => void;
```

Defined in: [createHotkeyRecorder.ts:23](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/createHotkeyRecorder.ts#L23)

Start recording a new hotkey

#### Returns

`void`

***

### steps

```ts
steps: () => HotkeySequence;
```

Defined in: [createHotkeyRecorder.ts:19](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/createHotkeyRecorder.ts#L19)

Chords recorded so far in a multi-step recording (for live preview)

#### Returns

`HotkeySequence`

***

### stopRecording

```ts
stopRecording: () => void;
```

Defined in: [createHotkeyRecorder.ts:25](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/createHotkeyRecorder.ts#L25)

Stop recording without calling onCancel

#### Returns

`void`
