---
id: HotkeyRecorderOptions
title: HotkeyRecorderOptions
---

Defined in: [hotkey-recorder.ts:33](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L33)

Options for configuring a HotkeyRecorder instance.

## Extends

- [`RecorderOptions`](RecorderOptions.md)

## Properties

### detectConflicts?

```ts
optional detectConflicts: boolean | HotkeyConflictOptions;
```

Defined in: [recorder-options.ts:21](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/recorder-options.ts#L21)

Opt in to live-registry conflicts, including sequence prefixes. Default: false.

#### Inherited from

[`RecorderOptions`](RecorderOptions.md).[`detectConflicts`](RecorderOptions.md#detectconflicts)

***

### ignoreInputs?

```ts
optional ignoreInputs: boolean;
```

Defined in: [hotkey-recorder.ts:52](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L52)

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

Defined in: [hotkey-recorder.ts:42](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L42)

Optional callback when recording is cancelled (Escape pressed)

#### Returns

`void`

***

### onClear()?

```ts
optional onClear: () => void;
```

Defined in: [hotkey-recorder.ts:44](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L44)

Optional callback when shortcut is cleared (Backspace/Delete pressed)

#### Returns

`void`

***

### onRecord()

```ts
onRecord: (hotkey) => void;
```

Defined in: [hotkey-recorder.ts:40](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L40)

Callback when a hotkey is successfully recorded

#### Parameters

##### hotkey

[`Hotkey`](../type-aliases/Hotkey.md)

#### Returns

`void`

***

### onReject()?

```ts
optional onReject: (rejection) => void;
```

Defined in: [recorder-options.ts:23](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/recorder-options.ts#L23)

Rejected candidates leave recording active.

#### Parameters

##### rejection

[`RecorderRejection`](RecorderRejection.md)

#### Returns

`void`

#### Inherited from

[`RecorderOptions`](RecorderOptions.md).[`onReject`](RecorderOptions.md#onreject)

***

### platform?

```ts
optional platform: "mac" | "windows" | "linux";
```

Defined in: [recorder-options.ts:19](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/recorder-options.ts#L19)

Platform used for Mod and AltGraph handling. Defaults to platform detection.

#### Inherited from

[`RecorderOptions`](RecorderOptions.md).[`platform`](RecorderOptions.md#platform)

***

### recordBy?

```ts
optional recordBy: RecorderKeyMode;
```

Defined in: [recorder-options.ts:17](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/recorder-options.ts#L17)

Physical code recording is the default. Choose key to record logical characters.

#### Inherited from

[`RecorderOptions`](RecorderOptions.md).[`recordBy`](RecorderOptions.md#recordby)

***

### validate()?

```ts
optional validate: (hotkey, context) => string | boolean;
```

Defined in: [hotkey-recorder.ts:35](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L35)

Return true to accept, or false/a message to reject while staying in recording mode.

#### Parameters

##### hotkey

[`Hotkey`](../type-aliases/Hotkey.md)

##### context

[`HotkeyRecorderValidationContext`](HotkeyRecorderValidationContext.md)

#### Returns

`string` \| `boolean`
