---
id: PreactHotkeyRecorder
title: PreactHotkeyRecorder
---

Defined in: [useHotkeyRecorder.ts:15](https://github.com/TanStack/hotkeys/blob/main/packages/preact-hotkeys/src/useHotkeyRecorder.ts#L15)

## Type Parameters

### THotkey

`THotkey` *extends* `Hotkey` = `Hotkey`

## Properties

### cancelRecording

```ts
cancelRecording: () => void;
```

Defined in: [useHotkeyRecorder.ts:27](https://github.com/TanStack/hotkeys/blob/main/packages/preact-hotkeys/src/useHotkeyRecorder.ts#L27)

Cancel recording and call onCancel

#### Returns

`void`

***

### commitRecording

```ts
commitRecording: () => void;
```

Defined in: [useHotkeyRecorder.ts:29](https://github.com/TanStack/hotkeys/blob/main/packages/preact-hotkeys/src/useHotkeyRecorder.ts#L29)

Commit the recorded steps now (multi-step recordings)

#### Returns

`void`

***

### isRecording

```ts
isRecording: boolean;
```

Defined in: [useHotkeyRecorder.ts:17](https://github.com/TanStack/hotkeys/blob/main/packages/preact-hotkeys/src/useHotkeyRecorder.ts#L17)

Whether recording is currently active

***

### recordedHotkey

```ts
recordedHotkey: THotkey | null;
```

Defined in: [useHotkeyRecorder.ts:21](https://github.com/TanStack/hotkeys/blob/main/packages/preact-hotkeys/src/useHotkeyRecorder.ts#L21)

The last committed hotkey

***

### startRecording

```ts
startRecording: () => void;
```

Defined in: [useHotkeyRecorder.ts:23](https://github.com/TanStack/hotkeys/blob/main/packages/preact-hotkeys/src/useHotkeyRecorder.ts#L23)

Start recording a new hotkey

#### Returns

`void`

***

### steps

```ts
steps: HotkeySequence;
```

Defined in: [useHotkeyRecorder.ts:19](https://github.com/TanStack/hotkeys/blob/main/packages/preact-hotkeys/src/useHotkeyRecorder.ts#L19)

Chords recorded so far in a multi-step recording (for live preview)

***

### stopRecording

```ts
stopRecording: () => void;
```

Defined in: [useHotkeyRecorder.ts:25](https://github.com/TanStack/hotkeys/blob/main/packages/preact-hotkeys/src/useHotkeyRecorder.ts#L25)

Stop recording without calling onCancel

#### Returns

`void`
