---
id: VueHotkeyRecorder
title: VueHotkeyRecorder
---

# Interface: VueHotkeyRecorder

Defined in: [packages/vue-hotkeys/src/useHotkeyRecorder.ts:8](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/useHotkeyRecorder.ts#L8)

## Properties

### cancelRecording()

```ts
cancelRecording: () => void;
```

Defined in: [packages/vue-hotkeys/src/useHotkeyRecorder.ts:18](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/useHotkeyRecorder.ts#L18)

Cancel recording without saving

#### Returns

`void`

***

### isRecording

```ts
isRecording: Ref<boolean>;
```

Defined in: [packages/vue-hotkeys/src/useHotkeyRecorder.ts:10](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/useHotkeyRecorder.ts#L10)

Whether recording is currently active

***

### recordedHotkey

```ts
recordedHotkey: Ref<Hotkey | null>;
```

Defined in: [packages/vue-hotkeys/src/useHotkeyRecorder.ts:12](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/useHotkeyRecorder.ts#L12)

The currently recorded hotkey (for live preview)

***

### startRecording()

```ts
startRecording: () => void;
```

Defined in: [packages/vue-hotkeys/src/useHotkeyRecorder.ts:14](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/useHotkeyRecorder.ts#L14)

Start recording a new hotkey

#### Returns

`void`

***

### stopRecording()

```ts
stopRecording: () => void;
```

Defined in: [packages/vue-hotkeys/src/useHotkeyRecorder.ts:16](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/useHotkeyRecorder.ts#L16)

Stop recording (same as cancel)

#### Returns

`void`
