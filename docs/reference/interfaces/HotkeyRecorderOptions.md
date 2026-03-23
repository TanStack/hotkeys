---
id: HotkeyRecorderOptions
title: HotkeyRecorderOptions
---

# Interface: HotkeyRecorderOptions

Defined in: [hotkey-recorder.ts:19](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L19)

Options for configuring a HotkeyRecorder instance.

## Properties

### onCancel()?

```ts
optional onCancel: () => void;
```

Defined in: [hotkey-recorder.ts:23](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L23)

Optional callback when recording is cancelled (Escape pressed)

#### Returns

`void`

***

### onClear()?

```ts
optional onClear: () => void;
```

Defined in: [hotkey-recorder.ts:25](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L25)

Optional callback when shortcut is cleared (Backspace/Delete pressed)

#### Returns

`void`

***

### onRecord()

```ts
onRecord: (hotkey) => void;
```

Defined in: [hotkey-recorder.ts:21](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L21)

Callback when a hotkey is successfully recorded

#### Parameters

##### hotkey

[`Hotkey`](../type-aliases/Hotkey.md)

#### Returns

`void`
