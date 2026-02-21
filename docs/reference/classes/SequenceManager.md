---
id: SequenceManager
title: SequenceManager
---

# Class: SequenceManager

Defined in: [sequence.ts:94](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/sequence.ts#L94)

Manages keyboard sequence matching for Vim-style shortcuts.

This class allows registering multi-key sequences like 'g g' or 'd d'
that trigger callbacks when the full sequence is pressed within
a configurable timeout.

## Example

```ts
const matcher = SequenceManager.getInstance()

// Register 'g g' to go to top
const unregister = matcher.register(['G', 'G'], (event, context) => {
  scrollToTop()
}, { timeout: 500 })

// Later, to unregister:
unregister()
```

## Methods

### destroy()

```ts
destroy(): void;
```

Defined in: [sequence.ts:359](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/sequence.ts#L359)

Destroys the manager and removes all listeners.

#### Returns

`void`

***

### getRegistrationCount()

```ts
getRegistrationCount(): number;
```

Defined in: [sequence.ts:352](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/sequence.ts#L352)

Gets the number of registered sequences.

#### Returns

`number`

***

### register()

```ts
register(
   sequence, 
   callback, 
   options): () => void;
```

Defined in: [sequence.ts:133](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/sequence.ts#L133)

Registers a hotkey sequence handler.

#### Parameters

##### sequence

[`HotkeySequence`](../type-aliases/HotkeySequence.md)

Array of hotkey strings that form the sequence

##### callback

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

Function to call when the sequence is completed

##### options

[`SequenceOptions`](../interfaces/SequenceOptions.md) = `{}`

Options for the sequence behavior

#### Returns

A function to unregister the sequence

```ts
(): void;
```

##### Returns

`void`

***

### resetAll()

```ts
resetAll(): void;
```

Defined in: [sequence.ts:342](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/sequence.ts#L342)

Resets all sequence progress.

#### Returns

`void`

***

### getInstance()

```ts
static getInstance(): SequenceManager;
```

Defined in: [sequence.ts:108](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/sequence.ts#L108)

Gets the singleton instance of SequenceManager.

#### Returns

`SequenceManager`

***

### resetInstance()

```ts
static resetInstance(): void;
```

Defined in: [sequence.ts:118](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/sequence.ts#L118)

Resets the singleton instance. Useful for testing.

#### Returns

`void`
