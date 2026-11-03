---
id: AngularHotkeyRecorder
title: AngularHotkeyRecorder
---

Defined in: [injectHotkeyRecorder.ts:24](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectHotkeyRecorder.ts#L24)

## Type Parameters

### THotkey

`THotkey` *extends* `Hotkey` = `Hotkey`

## Properties

### cancelRecording

```ts
readonly cancelRecording: () => void;
```

Defined in: [injectHotkeyRecorder.ts:36](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectHotkeyRecorder.ts#L36)

Cancel recording and call onCancel

#### Returns

`void`

***

### commitRecording

```ts
readonly commitRecording: () => void;
```

Defined in: [injectHotkeyRecorder.ts:38](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectHotkeyRecorder.ts#L38)

Commit the recorded steps now (multi-step recordings)

#### Returns

`void`

***

### isRecording

```ts
readonly isRecording: () => boolean;
```

Defined in: [injectHotkeyRecorder.ts:26](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectHotkeyRecorder.ts#L26)

Whether recording is currently active

#### Returns

`boolean`

***

### recordedHotkey

```ts
readonly recordedHotkey: () => THotkey | null;
```

Defined in: [injectHotkeyRecorder.ts:30](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectHotkeyRecorder.ts#L30)

The last committed hotkey

#### Returns

`THotkey` \| `null`

***

### startRecording

```ts
readonly startRecording: () => void;
```

Defined in: [injectHotkeyRecorder.ts:32](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectHotkeyRecorder.ts#L32)

Start recording a new hotkey

#### Returns

`void`

***

### steps

```ts
readonly steps: () => HotkeySequence;
```

Defined in: [injectHotkeyRecorder.ts:28](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectHotkeyRecorder.ts#L28)

Chords recorded so far in a multi-step recording (for live preview)

#### Returns

`HotkeySequence`

***

### stopRecording

```ts
readonly stopRecording: () => void;
```

Defined in: [injectHotkeyRecorder.ts:34](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectHotkeyRecorder.ts#L34)

Stop recording without calling onCancel

#### Returns

`void`
