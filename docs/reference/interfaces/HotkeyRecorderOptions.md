---
id: HotkeyRecorderOptions
title: HotkeyRecorderOptions
---

# Interface: HotkeyRecorderOptions

Defined in: [hotkey-recorder.ts:20](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L20)

Options for configuring a HotkeyRecorder instance.

## Properties

### ignoreInputs?

```ts
optional ignoreInputs: boolean;
```

Defined in: [hotkey-recorder.ts:34](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L34)

Whether to ignore keyboard events from input-like elements (text inputs,
textarea, select, contenteditable). When true, typing in inputs passes
through normally instead of being captured as a hotkey recording.
Escape always works regardless of this setting.

#### Default

```ts
true
```

***

### onCancel()?

```ts
optional onCancel: () => void;
```

Defined in: [hotkey-recorder.ts:24](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L24)

Optional callback when recording is cancelled (Escape pressed)

#### Returns

`void`

***

### onClear()?

```ts
optional onClear: () => void;
```

Defined in: [hotkey-recorder.ts:26](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L26)

Optional callback when shortcut is cleared (Backspace/Delete pressed)

#### Returns

`void`

***

### onRecord()

```ts
onRecord: (hotkey) => void;
```

Defined in: [hotkey-recorder.ts:22](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L22)

Callback when a hotkey is successfully recorded

#### Parameters

##### hotkey

[`Hotkey`](../type-aliases/Hotkey.md)

#### Returns

`void`
