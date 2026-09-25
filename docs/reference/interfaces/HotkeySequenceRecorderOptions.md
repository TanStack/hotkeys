---
id: HotkeySequenceRecorderOptions
title: HotkeySequenceRecorderOptions
---

Defined in: [hotkey-sequence-recorder.ts:42](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-sequence-recorder.ts#L42)

Options for configuring a HotkeySequenceRecorder instance.

## Extends

- [`RecorderOptions`](RecorderOptions.md)

## Properties

### commitKeys?

```ts
optional commitKeys?: HotkeySequenceRecorderCommitKeys;
```

Defined in: [hotkey-sequence-recorder.ts:63](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-sequence-recorder.ts#L63)

Keyboard commit mode. When `'none'`, use [HotkeySequenceRecorder.commit](../classes/HotkeySequenceRecorder.md#commit) (and optional idle timeout).

#### Default

```ts
'enter'
```

***

### commitOnEnter?

```ts
optional commitOnEnter?: boolean;
```

Defined in: [hotkey-sequence-recorder.ts:58](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-sequence-recorder.ts#L58)

Whether plain Enter commits the current steps. Ignored when [commitKeys](#commitkeys) is `'none'`.

#### Default

```ts
true
```

***

### detectConflicts?

```ts
optional detectConflicts?: boolean | HotkeyConflictOptions;
```

Defined in: [recorder-options.ts:21](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/recorder-options.ts#L21)

Opt in to live-registry conflicts, including sequence prefixes. Default: false.

#### Inherited from

[`RecorderOptions`](RecorderOptions.md).[`detectConflicts`](RecorderOptions.md#detectconflicts)

***

### idleTimeoutMs?

```ts
optional idleTimeoutMs?: number;
```

Defined in: [hotkey-sequence-recorder.ts:68](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-sequence-recorder.ts#L68)

Milliseconds of inactivity after the **last completed chord** before auto-committing.
The timer does not run while waiting for the first chord (`steps.length === 0`).

***

### ignoreInputs?

```ts
optional ignoreInputs?: boolean;
```

Defined in: [hotkey-sequence-recorder.ts:76](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-sequence-recorder.ts#L76)

Whether to ignore keyboard events from input-like elements (text inputs,
textarea, select, contenteditable). When true, typing in inputs passes
through normally instead of being captured as a sequence recording.
Escape always works regardless of this setting.

#### Default

```ts
true
```

***

### onCancel?

```ts
optional onCancel?: () => void;
```

Defined in: [hotkey-sequence-recorder.ts:51](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-sequence-recorder.ts#L51)

Optional callback when recording is cancelled (Escape pressed)

#### Returns

`void`

***

### onClear?

```ts
optional onClear?: () => void;
```

Defined in: [hotkey-sequence-recorder.ts:53](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-sequence-recorder.ts#L53)

Optional callback when the sequence is cleared (Backspace/Delete with no steps)

#### Returns

`void`

***

### onRecord

```ts
onRecord: (sequence) => void;
```

Defined in: [hotkey-sequence-recorder.ts:49](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-sequence-recorder.ts#L49)

Callback when a sequence is successfully recorded

#### Parameters

##### sequence

[`HotkeySequence`](../type-aliases/HotkeySequence.md)

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

[`RecorderOptions`](RecorderOptions.md).[`onReject`](RecorderOptions.md#onreject)

***

### platform?

```ts
optional platform?: "mac" | "windows" | "linux";
```

Defined in: [recorder-options.ts:19](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/recorder-options.ts#L19)

Platform used for Mod and AltGraph handling. Defaults to platform detection.

#### Inherited from

[`RecorderOptions`](RecorderOptions.md).[`platform`](RecorderOptions.md#platform)

***

### recordBy?

```ts
optional recordBy?: RecorderKeyMode;
```

Defined in: [recorder-options.ts:17](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/recorder-options.ts#L17)

Physical code recording is the default. Choose key to record logical characters.

#### Inherited from

[`RecorderOptions`](RecorderOptions.md).[`recordBy`](RecorderOptions.md#recordby)

***

### validate?

```ts
optional validate?: (sequence, context) => string | boolean;
```

Defined in: [hotkey-sequence-recorder.ts:44](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-sequence-recorder.ts#L44)

Validate the completed sequence. Rejection preserves the steps for editing.

#### Parameters

##### sequence

[`HotkeySequence`](../type-aliases/HotkeySequence.md)

##### context

[`HotkeySequenceRecorderValidationContext`](HotkeySequenceRecorderValidationContext.md)

#### Returns

`string` \| `boolean`
