---
id: HotkeySequenceRecorderOptions
title: HotkeySequenceRecorderOptions
---

# Interface: HotkeySequenceRecorderOptions

Defined in: [hotkey-sequence-recorder.ts:29](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-sequence-recorder.ts#L29)

Options for configuring a HotkeySequenceRecorder instance.

## Properties

### commitKeys?

```ts
optional commitKeys: HotkeySequenceRecorderCommitKeys;
```

Defined in: [hotkey-sequence-recorder.ts:45](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-sequence-recorder.ts#L45)

Keyboard commit mode. When `'none'`, use [HotkeySequenceRecorder.commit](../classes/HotkeySequenceRecorder.md#commit) (and optional idle timeout).

#### Default

```ts
'enter'
```

***

### commitOnEnter?

```ts
optional commitOnEnter: boolean;
```

Defined in: [hotkey-sequence-recorder.ts:40](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-sequence-recorder.ts#L40)

Whether plain Enter commits the current steps. Ignored when [commitKeys](#commitkeys) is `'none'`.

#### Default

```ts
true
```

***

### idleTimeoutMs?

```ts
optional idleTimeoutMs: number;
```

Defined in: [hotkey-sequence-recorder.ts:50](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-sequence-recorder.ts#L50)

Milliseconds of inactivity after the **last completed chord** before auto-committing.
The timer does not run while waiting for the first chord (`steps.length === 0`).

***

### ignoreInputs?

```ts
optional ignoreInputs: boolean;
```

Defined in: [hotkey-sequence-recorder.ts:58](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-sequence-recorder.ts#L58)

Whether to ignore keyboard events from input-like elements (text inputs,
textarea, select, contenteditable). When true, typing in inputs passes
through normally instead of being captured as a sequence recording.
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

Defined in: [hotkey-sequence-recorder.ts:33](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-sequence-recorder.ts#L33)

Optional callback when recording is cancelled (Escape pressed)

#### Returns

`void`

***

### onClear()?

```ts
optional onClear: () => void;
```

Defined in: [hotkey-sequence-recorder.ts:35](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-sequence-recorder.ts#L35)

Optional callback when the sequence is cleared (Backspace/Delete with no steps)

#### Returns

`void`

***

### onRecord()

```ts
onRecord: (sequence) => void;
```

Defined in: [hotkey-sequence-recorder.ts:31](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-sequence-recorder.ts#L31)

Callback when a sequence is successfully recorded (including empty array when cleared)

#### Parameters

##### sequence

[`HotkeySequence`](../type-aliases/HotkeySequence.md)

#### Returns

`void`
