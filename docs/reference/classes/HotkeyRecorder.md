---
id: HotkeyRecorder
title: HotkeyRecorder
---

Defined in: [hotkey-recorder.ts:192](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L192)

Framework-agnostic class for recording keyboard shortcuts.

With the default `maxSteps: 1`, the first valid chord commits. With a larger
`maxSteps`, each chord adds a step; the recording commits on Enter (unless
`commitKeys: 'none'`), after `idleTimeoutMs`, or when it reaches `maxSteps`.
Backspace/Delete removes the last step, and on an empty recording calls
`onClear`. Escape cancels. A one-step result is a chord string.

State Management:
- Uses TanStack Store for reactive state management
- State can be accessed via `recorder.store.state` when using the class directly
- When using framework adapters, use the `useHotkeyRecorder` hook for reactive state

## Example

```ts
const recorder = new HotkeyRecorder({
  onRecord: (hotkey) => {
    console.log('Recorded:', hotkey) // 'Mod+S'
  },
})

const sequenceRecorder = new HotkeyRecorder({
  maxSteps: Infinity,
  onRecord: (hotkey) => {
    console.log('Recorded:', hotkey) // 'Mod+S' or ['G', 'H']
  },
})

recorder.start()
// ... later
recorder.destroy()
```

## Constructors

### Constructor

```ts
new HotkeyRecorder(options): HotkeyRecorder;
```

Defined in: [hotkey-recorder.ts:217](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L217)

#### Parameters

##### options

  \| [`HotkeyChordRecorderOptions`](../interfaces/HotkeyChordRecorderOptions.md)
  \| (() => [`HotkeyChordRecorderOptions`](../interfaces/HotkeyChordRecorderOptions.md))

#### Returns

`HotkeyRecorder`

### Constructor

```ts
new HotkeyRecorder(options): HotkeyRecorder;
```

Defined in: [hotkey-recorder.ts:220](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L220)

#### Parameters

##### options

  \| [`HotkeySequenceRecorderOptions`](../interfaces/HotkeySequenceRecorderOptions.md)
  \| (() => [`HotkeySequenceRecorderOptions`](../interfaces/HotkeySequenceRecorderOptions.md))

#### Returns

`HotkeyRecorder`

## Properties

### store

```ts
readonly store: Store<HotkeyRecorderState>;
```

Defined in: [hotkey-recorder.ts:193](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L193)

## Methods

### cancel()

```ts
cancel(): void;
```

Defined in: [hotkey-recorder.ts:476](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L476)

Cancel recording without saving.

Removes the event listener, resets the recording state, and calls
the onCancel callback if provided.

#### Returns

`void`

***

### commit()

```ts
commit(): void;
```

Defined in: [hotkey-recorder.ts:382](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L382)

Commits the recorded steps after validation and conflict checks.
Called automatically at `maxSteps`, on Enter, or after `idleTimeoutMs`.
A rejected commit leaves recording active with its steps intact.

#### Returns

`void`

***

### destroy()

```ts
destroy(): void;
```

Defined in: [hotkey-recorder.ts:503](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L503)

Clean up event listeners and reset state.

Call this when you're done with the recorder to ensure
all event listeners are properly removed.

#### Returns

`void`

***

### setOptions()

```ts
setOptions(options): void;
```

Defined in: [hotkey-recorder.ts:233](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L233)

Updates the recorder options, including callbacks.
This allows framework adapters to sync callback changes without recreating the recorder.

#### Parameters

##### options

`Partial`\<[`HotkeyRecorderOptions`](../type-aliases/HotkeyRecorderOptions.md)\>

#### Returns

`void`

***

### start()

```ts
start(): void;
```

Defined in: [hotkey-recorder.ts:267](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L267)

Start recording a new hotkey.

Sets up a keydown event listener that captures keyboard events
and records chords according to `maxSteps`.

#### Returns

`void`

***

### stop()

```ts
stop(): void;
```

Defined in: [hotkey-recorder.ts:466](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L466)

Stop recording (same as cancel, but doesn't call onCancel).

Removes the event listener and resets the recording state.

#### Returns

`void`
