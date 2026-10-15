---
id: HotkeyChordRecorderOptions
title: HotkeyChordRecorderOptions
---

Defined in: [hotkey-recorder.ts:53](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L53)

Options for recording a single chord. This is the default (`maxSteps: 1`).

## Extends

- `HotkeyRecorderBaseOptions`

## Properties

### detectConflicts?

```ts
optional detectConflicts?: boolean | HotkeyConflictOptions;
```

Defined in: [recorder-options.ts:21](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/recorder-options.ts#L21)

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

Defined in: [hotkey-recorder.ts:49](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L49)

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

Defined in: [hotkey-recorder.ts:55](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L55)

Maximum number of chords to record. Default: 1

***

### onCancel?

```ts
optional onCancel?: () => void;
```

Defined in: [hotkey-recorder.ts:38](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L38)

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

Defined in: [hotkey-recorder.ts:43](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L43)

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

Defined in: [hotkey-recorder.ts:62](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L62)

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

Defined in: [recorder-options.ts:23](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/recorder-options.ts#L23)

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

Defined in: [recorder-options.ts:19](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/recorder-options.ts#L19)

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

Defined in: [recorder-options.ts:17](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/recorder-options.ts#L17)

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

Defined in: [hotkey-recorder.ts:57](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L57)

Return true to accept, or false/a message to reject while staying in recording mode.

#### Parameters

##### hotkey

[`HotkeyChord`](../type-aliases/HotkeyChord.md)

##### context

[`HotkeyRecorderValidationContext`](HotkeyRecorderValidationContext.md)

#### Returns

`string` \| `boolean`
