---
id: HotkeyRecorderOptions
title: HotkeyRecorderOptions
---

# Interface: HotkeyRecorderOptions

Defined in: [recorder.ts:24](https://github.com/TanStack/keys/blob/main/packages/hotkeys/src/recorder.ts#L24)

Options for configuring a HotkeyRecorder instance.

## Properties

### onCancel()?

```ts
optional onCancel: () => void;
```

Defined in: [recorder.ts:28](https://github.com/TanStack/keys/blob/main/packages/hotkeys/src/recorder.ts#L28)

Optional callback when recording is cancelled (Escape pressed)

#### Returns

`void`

***

### onClear()?

```ts
optional onClear: () => void;
```

Defined in: [recorder.ts:30](https://github.com/TanStack/keys/blob/main/packages/hotkeys/src/recorder.ts#L30)

Optional callback when shortcut is cleared (Backspace/Delete pressed)

#### Returns

`void`

***

### onRecord()

```ts
onRecord: (hotkey) => void;
```

Defined in: [recorder.ts:26](https://github.com/TanStack/keys/blob/main/packages/hotkeys/src/recorder.ts#L26)

Callback when a hotkey is successfully recorded

#### Parameters

##### hotkey

[`Hotkey`](../type-aliases/Hotkey.md)

#### Returns

`void`
