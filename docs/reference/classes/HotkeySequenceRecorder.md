---
id: HotkeySequenceRecorder
title: HotkeySequenceRecorder
---

# Class: HotkeySequenceRecorder

Defined in: [hotkey-sequence-recorder.ts:76](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-sequence-recorder.ts#L76)

Framework-agnostic class for recording multi-chord sequences (Vim-style shortcuts).

Each step is captured like a single hotkey chord. Press **Enter** (no modifiers) to commit
when [HotkeySequenceRecorderOptions.commitKeys](../interfaces/HotkeySequenceRecorderOptions.md#commitkeys) is `'enter'` (default), **Escape** to cancel,
**Backspace/Delete** to remove the last step or clear when empty.

## Constructors

### Constructor

```ts
new HotkeySequenceRecorder(options): HotkeySequenceRecorder;
```

Defined in: [hotkey-sequence-recorder.ts:89](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-sequence-recorder.ts#L89)

#### Parameters

##### options

[`HotkeySequenceRecorderOptions`](../interfaces/HotkeySequenceRecorderOptions.md)

#### Returns

`HotkeySequenceRecorder`

## Properties

### store

```ts
readonly store: Store<HotkeySequenceRecorderState>;
```

Defined in: [hotkey-sequence-recorder.ts:77](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-sequence-recorder.ts#L77)

## Methods

### cancel()

```ts
cancel(): void;
```

Defined in: [hotkey-sequence-recorder.ts:272](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-sequence-recorder.ts#L272)

#### Returns

`void`

***

### commit()

```ts
commit(): void;
```

Defined in: [hotkey-sequence-recorder.ts:223](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-sequence-recorder.ts#L223)

Commit the current steps as a sequence. No-op if fewer than one step.

#### Returns

`void`

***

### destroy()

```ts
destroy(): void;
```

Defined in: [hotkey-sequence-recorder.ts:300](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-sequence-recorder.ts#L300)

#### Returns

`void`

***

### setOptions()

```ts
setOptions(options): void;
```

Defined in: [hotkey-sequence-recorder.ts:97](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-sequence-recorder.ts#L97)

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

Defined in: [hotkey-sequence-recorder.ts:140](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-sequence-recorder.ts#L140)

#### Returns

`void`

***

### stop()

```ts
stop(): void;
```

Defined in: [hotkey-sequence-recorder.ts:259](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-sequence-recorder.ts#L259)

#### Returns

`void`
