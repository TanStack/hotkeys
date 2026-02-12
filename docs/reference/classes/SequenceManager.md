---
id: SequenceManager
title: SequenceManager
---

# Class: SequenceManager

Defined in: [sequence.ts:79](https://github.com/TanStack/keys/blob/main/packages/hotkeys/src/sequence.ts#L79)

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

Defined in: [sequence.ts:300](https://github.com/TanStack/keys/blob/main/packages/hotkeys/src/sequence.ts#L300)

Destroys the manager and removes all listeners.

#### Returns

`void`

***

### getRegistrationCount()

```ts
getRegistrationCount(): number;
```

Defined in: [sequence.ts:293](https://github.com/TanStack/keys/blob/main/packages/hotkeys/src/sequence.ts#L293)

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

Defined in: [sequence.ts:118](https://github.com/TanStack/keys/blob/main/packages/hotkeys/src/sequence.ts#L118)

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

Defined in: [sequence.ts:283](https://github.com/TanStack/keys/blob/main/packages/hotkeys/src/sequence.ts#L283)

Resets all sequence progress.

#### Returns

`void`

***

### getInstance()

```ts
static getInstance(): SequenceManager;
```

Defined in: [sequence.ts:93](https://github.com/TanStack/keys/blob/main/packages/hotkeys/src/sequence.ts#L93)

Gets the singleton instance of SequenceManager.

#### Returns

`SequenceManager`

***

### resetInstance()

```ts
static resetInstance(): void;
```

Defined in: [sequence.ts:103](https://github.com/TanStack/keys/blob/main/packages/hotkeys/src/sequence.ts#L103)

Resets the singleton instance. Useful for testing.

#### Returns

`void`
