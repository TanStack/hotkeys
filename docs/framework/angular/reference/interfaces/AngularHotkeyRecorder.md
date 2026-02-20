---
id: AngularHotkeyRecorder
title: AngularHotkeyRecorder
---

# Interface: AngularHotkeyRecorder

Defined in: [injectHotkeyRecorder.ts:7](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectHotkeyRecorder.ts#L7)

## Properties

### cancelRecording()

```ts
cancelRecording: () => void;
```

Defined in: [injectHotkeyRecorder.ts:17](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectHotkeyRecorder.ts#L17)

Cancel recording without saving

#### Returns

`void`

***

### isRecording()

```ts
isRecording: () => boolean;
```

Defined in: [injectHotkeyRecorder.ts:9](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectHotkeyRecorder.ts#L9)

Whether recording is currently active

#### Returns

`boolean`

***

### recordedHotkey()

```ts
recordedHotkey: () => Hotkey | null;
```

Defined in: [injectHotkeyRecorder.ts:11](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectHotkeyRecorder.ts#L11)

The currently recorded hotkey (for live preview)

#### Returns

`Hotkey` \| `null`

***

### startRecording()

```ts
startRecording: () => void;
```

Defined in: [injectHotkeyRecorder.ts:13](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectHotkeyRecorder.ts#L13)

Start recording a new hotkey

#### Returns

`void`

***

### stopRecording()

```ts
stopRecording: () => void;
```

Defined in: [injectHotkeyRecorder.ts:15](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectHotkeyRecorder.ts#L15)

Stop recording (same as cancel)

#### Returns

`void`
