---
id: VueHotkeyRecorder
title: VueHotkeyRecorder
---

Defined in: [useHotkeyRecorder.ts:16](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/useHotkeyRecorder.ts#L16)

## Type Parameters

### THotkey

`THotkey` *extends* `Hotkey` = `Hotkey`

## Properties

### cancelRecording

```ts
cancelRecording: () => void;
```

Defined in: [useHotkeyRecorder.ts:28](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/useHotkeyRecorder.ts#L28)

Cancel recording and call onCancel

#### Returns

`void`

***

### commitRecording

```ts
commitRecording: () => void;
```

Defined in: [useHotkeyRecorder.ts:30](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/useHotkeyRecorder.ts#L30)

Commit the recorded steps now (multi-step recordings)

#### Returns

`void`

***

### isRecording

```ts
isRecording: Readonly<Ref<boolean>>;
```

Defined in: [useHotkeyRecorder.ts:18](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/useHotkeyRecorder.ts#L18)

Whether recording is currently active

***

### recordedHotkey

```ts
recordedHotkey: Readonly<Ref<THotkey | null>>;
```

Defined in: [useHotkeyRecorder.ts:22](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/useHotkeyRecorder.ts#L22)

The last committed hotkey

***

### startRecording

```ts
startRecording: () => void;
```

Defined in: [useHotkeyRecorder.ts:24](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/useHotkeyRecorder.ts#L24)

Start recording a new hotkey

#### Returns

`void`

***

### steps

```ts
steps: Readonly<Ref<HotkeySequence>>;
```

Defined in: [useHotkeyRecorder.ts:20](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/useHotkeyRecorder.ts#L20)

Chords recorded so far in a multi-step recording (for live preview)

***

### stopRecording

```ts
stopRecording: () => void;
```

Defined in: [useHotkeyRecorder.ts:26](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/useHotkeyRecorder.ts#L26)

Stop recording without calling onCancel

#### Returns

`void`
