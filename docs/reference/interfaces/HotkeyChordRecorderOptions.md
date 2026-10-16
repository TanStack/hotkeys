---
id: HotkeyChordRecorderOptions
title: HotkeyChordRecorderOptions
---

Defined in: [hotkey-recorder.ts:88](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L88)

Options for recording a single chord. This is the default (`maxSteps: 1`).

## Extends

- `HotkeyRecorderBaseOptions`

## Properties

### detectConflicts?

```ts
optional detectConflicts?: boolean | HotkeyConflictOptions;
```

Defined in: [hotkey-recorder.ts:39](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L39)

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

Defined in: [hotkey-recorder.ts:84](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L84)

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

Defined in: [hotkey-recorder.ts:90](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L90)

Maximum number of chords to record. Default: 1

***

### onCancel?

```ts
optional onCancel?: () => void;
```

Defined in: [hotkey-recorder.ts:73](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L73)

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

Defined in: [hotkey-recorder.ts:78](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L78)

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

Defined in: [hotkey-recorder.ts:97](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L97)

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

Defined in: [hotkey-recorder.ts:41](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L41)

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

Defined in: [hotkey-recorder.ts:37](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L37)

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

Defined in: [hotkey-recorder.ts:35](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L35)

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

Defined in: [hotkey-recorder.ts:92](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L92)

Return true to accept, or false/a message to reject while staying in recording mode.

#### Parameters

##### hotkey

[`HotkeyChord`](../type-aliases/HotkeyChord.md)

##### context

[`HotkeyRecorderValidationContext`](HotkeyRecorderValidationContext.md)

#### Returns

`string` \| `boolean`
