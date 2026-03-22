---
id: HotkeyRecorderOptions
title: HotkeyRecorderOptions
---

# Interface: HotkeyRecorderOptions

Defined in: [recorder.ts:32](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/recorder.ts#L32)

Options for configuring a HotkeyRecorder instance.

## Properties

### onCancel()?

```ts
optional onCancel: () => void;
```

Defined in: [recorder.ts:36](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/recorder.ts#L36)

Optional callback when recording is cancelled (Escape pressed)

#### Returns

`void`

***

### onClear()?

```ts
optional onClear: () => void;
```

Defined in: [recorder.ts:38](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/recorder.ts#L38)

Optional callback when shortcut is cleared (Backspace/Delete pressed)

#### Returns

`void`

***

### onRecord()

```ts
onRecord: (hotkey) => void;
```

Defined in: [recorder.ts:34](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/recorder.ts#L34)

Callback when a hotkey is successfully recorded

#### Parameters

##### hotkey

[`Hotkey`](../type-aliases/Hotkey.md)

#### Returns

`void`
