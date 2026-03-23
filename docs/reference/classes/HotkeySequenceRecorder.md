---
id: HotkeySequenceRecorder
title: HotkeySequenceRecorder
---

# Class: HotkeySequenceRecorder

Defined in: hotkey-sequence-recorder.ts:74

Framework-agnostic class for recording multi-chord sequences (Vim-style shortcuts).

Each step is captured like a single hotkey chord. Press **Enter** (no modifiers) to commit
when [HotkeySequenceRecorderOptions.commitKeys](../interfaces/HotkeySequenceRecorderOptions.md#commitkeys) is `'enter'` (default), **Escape** to cancel,
**Backspace/Delete** to remove the last step or clear when empty.

## Constructors

### Constructor

```ts
new HotkeySequenceRecorder(options): HotkeySequenceRecorder;
```

Defined in: hotkey-sequence-recorder.ts:87

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

Defined in: hotkey-sequence-recorder.ts:75

## Methods

### cancel()

```ts
cancel(): void;
```

Defined in: hotkey-sequence-recorder.ts:270

#### Returns

`void`

***

### commit()

```ts
commit(): void;
```

Defined in: hotkey-sequence-recorder.ts:221

Commit the current steps as a sequence. No-op if fewer than one step.

#### Returns

`void`

***

### destroy()

```ts
destroy(): void;
```

Defined in: hotkey-sequence-recorder.ts:298

#### Returns

`void`

***

### setOptions()

```ts
setOptions(options): void;
```

Defined in: hotkey-sequence-recorder.ts:95

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

Defined in: hotkey-sequence-recorder.ts:138

#### Returns

`void`

***

### stop()

```ts
stop(): void;
```

Defined in: hotkey-sequence-recorder.ts:257

#### Returns

`void`
