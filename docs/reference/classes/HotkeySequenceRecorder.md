---
id: HotkeySequenceRecorder
title: HotkeySequenceRecorder
---

Defined in: [hotkey-sequence-recorder.ts:104](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-sequence-recorder.ts#L104)

Framework-agnostic class for recording multi-chord sequences (Vim-style shortcuts).

Each step is captured like a single hotkey chord. Press **Enter** (no modifiers) to commit
when [HotkeySequenceRecorderOptions.commitKeys](../interfaces/HotkeySequenceRecorderOptions.md#commitkeys) is `'enter'` (default), **Escape** to cancel,
**Backspace/Delete** to remove the last step or clear when empty.

## Constructors

### Constructor

```ts
new HotkeySequenceRecorder(options): HotkeySequenceRecorder;
```

Defined in: [hotkey-sequence-recorder.ts:131](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-sequence-recorder.ts#L131)

Options may be a getter to read current configuration during an active session.

#### Parameters

##### options

  \| [`HotkeySequenceRecorderOptions`](../interfaces/HotkeySequenceRecorderOptions.md)
  \| (() => [`HotkeySequenceRecorderOptions`](../interfaces/HotkeySequenceRecorderOptions.md))

#### Returns

`HotkeySequenceRecorder`

## Properties

### store

```ts
readonly store: Store<HotkeySequenceRecorderState>;
```

Defined in: [hotkey-sequence-recorder.ts:105](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-sequence-recorder.ts#L105)

## Methods

### cancel()

```ts
cancel(): void;
```

Defined in: [hotkey-sequence-recorder.ts:379](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-sequence-recorder.ts#L379)

Stops, discards in-progress steps, and notifies onCancel.

#### Returns

`void`

***

### commit()

```ts
commit(): void;
```

Defined in: [hotkey-sequence-recorder.ts:302](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-sequence-recorder.ts#L302)

Commit the current steps as a sequence. No-op if fewer than one step.

#### Returns

`void`

***

### destroy()

```ts
destroy(): void;
```

Defined in: [hotkey-sequence-recorder.ts:411](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-sequence-recorder.ts#L411)

#### Returns

`void`

***

### setOptions()

```ts
setOptions(options): void;
```

Defined in: [hotkey-sequence-recorder.ts:140](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-sequence-recorder.ts#L140)

Merges current callbacks and options without discarding recorded steps.

#### Parameters

##### options

`Partial`\<[`HotkeySequenceRecorderOptions`](../interfaces/HotkeySequenceRecorderOptions.md)\>

#### Returns

`void`

***

### start()

```ts
start(): void;
```

Defined in: [hotkey-sequence-recorder.ts:183](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-sequence-recorder.ts#L183)

Starts a fresh recording; repeated starts during an active session are ignored.

#### Returns

`void`

***

### stop()

```ts
stop(): void;
```

Defined in: [hotkey-sequence-recorder.ts:363](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-sequence-recorder.ts#L363)

Stops and discards in-progress steps without invoking onCancel.

#### Returns

`void`
