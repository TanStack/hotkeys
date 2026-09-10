---
id: AngularHotkeyRecorder
title: AngularHotkeyRecorder
---

# Interface: AngularHotkeyRecorder

Defined in: [injectHotkeyRecorder.ts:15](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectHotkeyRecorder.ts#L15)

## Properties

### cancelRecording()

```ts
readonly cancelRecording: () => void;
```

Defined in: [injectHotkeyRecorder.ts:25](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectHotkeyRecorder.ts#L25)

Cancel recording without saving

#### Returns

`void`

***

### isRecording()

```ts
readonly isRecording: () => boolean;
```

Defined in: [injectHotkeyRecorder.ts:17](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectHotkeyRecorder.ts#L17)

Whether recording is currently active

#### Returns

`boolean`

***

### recordedHotkey()

```ts
readonly recordedHotkey: () => Hotkey | null;
```

Defined in: [injectHotkeyRecorder.ts:19](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectHotkeyRecorder.ts#L19)

The currently recorded hotkey (for live preview)

#### Returns

`Hotkey` \| `null`

***

### startRecording()

```ts
readonly startRecording: () => void;
```

Defined in: [injectHotkeyRecorder.ts:21](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectHotkeyRecorder.ts#L21)

Start recording a new hotkey

#### Returns

`void`

***

### stopRecording()

```ts
readonly stopRecording: () => void;
```

Defined in: [injectHotkeyRecorder.ts:23](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectHotkeyRecorder.ts#L23)

Stop recording (same as cancel)

#### Returns

`void`
