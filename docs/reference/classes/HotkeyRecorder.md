---
id: HotkeyRecorder
title: HotkeyRecorder
---

# Class: HotkeyRecorder

Defined in: [recorder.ts:80](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/recorder.ts#L80)

Framework-agnostic class for recording keyboard shortcuts.

This class handles all the complexity of capturing keyboard events,
converting them to hotkey strings, and handling edge cases like
Escape to cancel or Backspace/Delete to clear.

State Management:
- Uses TanStack Store for reactive state management
- State can be accessed via `recorder.store.state` when using the class directly
- When using framework adapters (React), use `useStore` hooks for reactive state

## Example

```ts
const recorder = new HotkeyRecorder({
  onRecord: (hotkey) => {
    console.log('Recorded:', hotkey)
  },
  onCancel: () => {
    console.log('Recording cancelled')
  },
})

// Start recording
recorder.start()

// Access state directly
console.log(recorder.store.state.isRecording) // true

// Subscribe to changes with TanStack Store
const unsubscribe = recorder.store.subscribe(() => {
  console.log('Recording:', recorder.store.state.isRecording)
})

// Cleanup
recorder.destroy()
unsubscribe()
```

## Constructors

### Constructor

```ts
new HotkeyRecorder(options): HotkeyRecorder;
```

Defined in: [recorder.ts:93](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/recorder.ts#L93)

#### Parameters

##### options

[`HotkeyRecorderOptions`](../interfaces/HotkeyRecorderOptions.md)

#### Returns

`HotkeyRecorder`

## Properties

### store

```ts
readonly store: Store<HotkeyRecorderState>;
```

Defined in: [recorder.ts:85](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/recorder.ts#L85)

The TanStack Store instance containing the recorder state.
Use this to subscribe to state changes or access current state.

## Methods

### cancel()

```ts
cancel(): void;
```

Defined in: [recorder.ts:218](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/recorder.ts#L218)

Cancel recording without saving.

Removes the event listener, resets the recording state, and calls
the onCancel callback if provided.

#### Returns

`void`

***

### destroy()

```ts
destroy(): void;
```

Defined in: [recorder.ts:260](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/recorder.ts#L260)

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

Defined in: [recorder.ts:102](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/recorder.ts#L102)

Updates the recorder options, including callbacks.
This allows framework adapters to sync callback changes without recreating the recorder.

#### Parameters

##### options

`Partial`\<[`HotkeyRecorderOptions`](../interfaces/HotkeyRecorderOptions.md)\>

#### Returns

`void`

***

### start()

```ts
start(): void;
```

Defined in: [recorder.ts:116](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/recorder.ts#L116)

Start recording a new hotkey.

Sets up a keydown event listener that captures keyboard events
and converts them to hotkey strings. Recording continues until
a valid hotkey is recorded, Escape is pressed, or stop/cancel is called.

#### Returns

`void`

***

### stop()

```ts
stop(): void;
```

Defined in: [recorder.ts:201](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/recorder.ts#L201)

Stop recording (same as cancel, but doesn't call onCancel).

Removes the event listener and resets the recording state.

#### Returns

`void`
