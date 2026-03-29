---
id: HotkeySequenceRecorder
title: HotkeySequenceRecorder
---

# Class: HotkeySequenceRecorder

Defined in: [hotkey-sequence-recorder.ts:85](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-sequence-recorder.ts#L85)

Framework-agnostic class for recording multi-chord sequences (Vim-style shortcuts).

Each step is captured like a single hotkey chord. Press **Enter** (no modifiers) to commit
when [HotkeySequenceRecorderOptions.commitKeys](../interfaces/HotkeySequenceRecorderOptions.md#commitkeys) is `'enter'` (default), **Escape** to cancel,
**Backspace/Delete** to remove the last step or clear when empty.

## Constructors

### Constructor

```ts
new HotkeySequenceRecorder(options): HotkeySequenceRecorder;
```

Defined in: [hotkey-sequence-recorder.ts:98](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-sequence-recorder.ts#L98)

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

Defined in: [hotkey-sequence-recorder.ts:86](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-sequence-recorder.ts#L86)

## Methods

### cancel()

```ts
cancel(): void;
```

Defined in: [hotkey-sequence-recorder.ts:292](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-sequence-recorder.ts#L292)

#### Returns

`void`

***

### commit()

```ts
commit(): void;
```

Defined in: [hotkey-sequence-recorder.ts:243](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-sequence-recorder.ts#L243)

Commit the current steps as a sequence. No-op if fewer than one step.

#### Returns

`void`

***

### destroy()

```ts
destroy(): void;
```

Defined in: [hotkey-sequence-recorder.ts:320](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-sequence-recorder.ts#L320)

#### Returns

`void`

***

### setOptions()

```ts
setOptions(options): void;
```

Defined in: [hotkey-sequence-recorder.ts:106](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-sequence-recorder.ts#L106)

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

Defined in: [hotkey-sequence-recorder.ts:149](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-sequence-recorder.ts#L149)

#### Returns

`void`

***

### stop()

```ts
stop(): void;
```

Defined in: [hotkey-sequence-recorder.ts:279](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-sequence-recorder.ts#L279)

#### Returns

`void`
