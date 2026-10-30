---
id: HotkeyChordRecorderOptions
title: HotkeyChordRecorderOptions
---

Defined in: [hotkey-recorder.ts:102](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L102)

Options for recording a single chord. This is the default (`maxSteps: 1`).

## Extends

- `HotkeyRecorderBaseOptions`

## Properties

### detectConflicts?

```ts
optional detectConflicts?: boolean | HotkeyConflictOptions;
```

Defined in: [hotkey-recorder.ts:40](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L40)

Opt in to live-registry conflicts, including sequence prefixes. Default: false.

#### Inherited from

```ts
HotkeyRecorderBaseOptions.detectConflicts
```

***

### ignoreInputs?

```ts
optional ignoreInputs?: boolean;
```

Defined in: [hotkey-recorder.ts:98](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L98)

Whether to ignore keyboard events from input-like elements (text inputs,
textarea, select, contenteditable) while recording. When true, typing in
inputs passes through normally (Escape still cancels). Defaults to true.

#### Inherited from

```ts
HotkeyRecorderBaseOptions.ignoreInputs
```

***

### maxSteps?

```ts
optional maxSteps?: 1;
```

Defined in: [hotkey-recorder.ts:104](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L104)

Maximum number of chords to record. Default: 1

***

### onCancel?

```ts
optional onCancel?: () => void;
```

Defined in: [hotkey-recorder.ts:87](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L87)

Optional callback when recording is cancelled (Escape pressed)

#### Returns

`void`

#### Inherited from

```ts
HotkeyRecorderBaseOptions.onCancel
```

***

### onClear?

```ts
optional onClear?: () => void;
```

Defined in: [hotkey-recorder.ts:92](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L92)

Optional callback when the recording is cleared: Backspace/Delete with no
modifiers and no recorded steps

#### Returns

`void`

#### Inherited from

```ts
HotkeyRecorderBaseOptions.onClear
```

***

### onRecord

```ts
onRecord: (hotkey) => void;
```

Defined in: [hotkey-recorder.ts:111](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L111)

Callback when a chord is successfully recorded

#### Parameters

##### hotkey

[`HotkeyChord`](../type-aliases/HotkeyChord.md)

#### Returns

`void`

***

### onReject?

```ts
optional onReject?: (rejection) => void;
```

Defined in: [hotkey-recorder.ts:42](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L42)

Rejected candidates leave recording active.

#### Parameters

##### rejection

[`RecorderRejection`](RecorderRejection.md)

#### Returns

`void`

#### Inherited from

```ts
HotkeyRecorderBaseOptions.onReject
```

***

### platform?

```ts
optional platform?: "mac" | "windows" | "linux";
```

Defined in: [hotkey-recorder.ts:38](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L38)

Platform used for Mod and AltGraph handling. Defaults to platform detection.

#### Inherited from

```ts
HotkeyRecorderBaseOptions.platform
```

***

### recordBy?

```ts
optional recordBy?: RecorderKeyMode;
```

Defined in: [hotkey-recorder.ts:36](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L36)

Physical code recording is the default. Choose key to record logical characters.

#### Inherited from

```ts
HotkeyRecorderBaseOptions.recordBy
```

***

### validate?

```ts
optional validate?: (hotkey, context) => string | boolean;
```

Defined in: [hotkey-recorder.ts:106](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L106)

Return true to accept, or false/a message to reject while staying in recording mode.

#### Parameters

##### hotkey

[`HotkeyChord`](../type-aliases/HotkeyChord.md)

##### context

[`HotkeyChordRecorderValidationContext`](HotkeyChordRecorderValidationContext.md)

#### Returns

`string` \| `boolean`
