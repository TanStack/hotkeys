---
id: HotkeySequenceRecorderOptions
title: HotkeySequenceRecorderOptions
---

# Interface: HotkeySequenceRecorderOptions

Defined in: [hotkey-sequence-recorder.ts:28](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-sequence-recorder.ts#L28)

Options for configuring a HotkeySequenceRecorder instance.

## Properties

### commitKeys?

```ts
optional commitKeys: HotkeySequenceRecorderCommitKeys;
```

Defined in: [hotkey-sequence-recorder.ts:44](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-sequence-recorder.ts#L44)

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

Defined in: [hotkey-sequence-recorder.ts:39](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-sequence-recorder.ts#L39)

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

Defined in: [hotkey-sequence-recorder.ts:49](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-sequence-recorder.ts#L49)

Milliseconds of inactivity after the **last completed chord** before auto-committing.
The timer does not run while waiting for the first chord (`steps.length === 0`).

***

### onCancel()?

```ts
optional onCancel: () => void;
```

Defined in: [hotkey-sequence-recorder.ts:32](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-sequence-recorder.ts#L32)

Optional callback when recording is cancelled (Escape pressed)

#### Returns

`void`

***

### onClear()?

```ts
optional onClear: () => void;
```

Defined in: [hotkey-sequence-recorder.ts:34](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-sequence-recorder.ts#L34)

Optional callback when the sequence is cleared (Backspace/Delete with no steps)

#### Returns

`void`

***

### onRecord()

```ts
onRecord: (sequence) => void;
```

Defined in: [hotkey-sequence-recorder.ts:30](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-sequence-recorder.ts#L30)

Callback when a sequence is successfully recorded (including empty array when cleared)

#### Parameters

##### sequence

[`HotkeySequence`](../type-aliases/HotkeySequence.md)

#### Returns

`void`
