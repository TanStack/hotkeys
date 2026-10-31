---
id: VueHotkeyRecorder
title: VueHotkeyRecorder
---

Defined in: [useHotkeyRecorder.ts:17](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/useHotkeyRecorder.ts#L17)

## Type Parameters

### THotkey

`THotkey` *extends* `Hotkey` = `Hotkey`

## Properties

### cancelRecording

```ts
cancelRecording: () => void;
```

Defined in: [useHotkeyRecorder.ts:29](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/useHotkeyRecorder.ts#L29)

Cancel recording and call onCancel

#### Returns

`void`

***

### commitRecording

```ts
commitRecording: () => void;
```

Defined in: [useHotkeyRecorder.ts:31](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/useHotkeyRecorder.ts#L31)

Commit the recorded steps now (multi-step recordings)

#### Returns

`void`

***

### isRecording

```ts
isRecording: Readonly<Ref<boolean>>;
```

Defined in: [useHotkeyRecorder.ts:19](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/useHotkeyRecorder.ts#L19)

Whether recording is currently active

***

### recordedHotkey

```ts
recordedHotkey: Readonly<Ref<THotkey | null>>;
```

Defined in: [useHotkeyRecorder.ts:23](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/useHotkeyRecorder.ts#L23)

The last committed hotkey

***

### startRecording

```ts
startRecording: () => void;
```

Defined in: [useHotkeyRecorder.ts:25](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/useHotkeyRecorder.ts#L25)

Start recording a new hotkey

#### Returns

`void`

***

### steps

```ts
steps: Readonly<Ref<HotkeySequence>>;
```

Defined in: [useHotkeyRecorder.ts:21](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/useHotkeyRecorder.ts#L21)

Chords recorded so far in a multi-step recording (for live preview)

***

### stopRecording

```ts
stopRecording: () => void;
```

Defined in: [useHotkeyRecorder.ts:27](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/useHotkeyRecorder.ts#L27)

Stop recording without calling onCancel

#### Returns

`void`
