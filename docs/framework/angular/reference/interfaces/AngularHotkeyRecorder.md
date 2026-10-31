---
id: AngularHotkeyRecorder
title: AngularHotkeyRecorder
---

Defined in: [injectHotkeyRecorder.ts:23](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectHotkeyRecorder.ts#L23)

## Type Parameters

### THotkey

`THotkey` *extends* `Hotkey` = `Hotkey`

## Properties

### cancelRecording

```ts
readonly cancelRecording: () => void;
```

Defined in: [injectHotkeyRecorder.ts:35](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectHotkeyRecorder.ts#L35)

Cancel recording and call onCancel

#### Returns

`void`

***

### commitRecording

```ts
readonly commitRecording: () => void;
```

Defined in: [injectHotkeyRecorder.ts:37](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectHotkeyRecorder.ts#L37)

Commit the recorded steps now (multi-step recordings)

#### Returns

`void`

***

### isRecording

```ts
readonly isRecording: () => boolean;
```

Defined in: [injectHotkeyRecorder.ts:25](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectHotkeyRecorder.ts#L25)

Whether recording is currently active

#### Returns

`boolean`

***

### recordedHotkey

```ts
readonly recordedHotkey: () => THotkey | null;
```

Defined in: [injectHotkeyRecorder.ts:29](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectHotkeyRecorder.ts#L29)

The last committed hotkey

#### Returns

`THotkey` \| `null`

***

### startRecording

```ts
readonly startRecording: () => void;
```

Defined in: [injectHotkeyRecorder.ts:31](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectHotkeyRecorder.ts#L31)

Start recording a new hotkey

#### Returns

`void`

***

### steps

```ts
readonly steps: () => HotkeySequence;
```

Defined in: [injectHotkeyRecorder.ts:27](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectHotkeyRecorder.ts#L27)

Chords recorded so far in a multi-step recording (for live preview)

#### Returns

`HotkeySequence`

***

### stopRecording

```ts
readonly stopRecording: () => void;
```

Defined in: [injectHotkeyRecorder.ts:33](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectHotkeyRecorder.ts#L33)

Stop recording without calling onCancel

#### Returns

`void`
