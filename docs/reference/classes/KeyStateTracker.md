---
id: KeyStateTracker
title: KeyStateTracker
---

# Class: KeyStateTracker

Defined in: [key-state-tracker.ts:63](https://github.com/TanStack/keys/blob/main/packages/hotkeys/src/key-state-tracker.ts#L63)

Singleton tracker for currently held keyboard keys.

This class maintains a list of all keys currently being pressed,
which is useful for:
- Displaying currently held keys to users
- Custom shortcut recording for rebinding
- Complex chord detection

State Management:
- Uses TanStack Store for reactive state management
- State can be accessed via `tracker.store.state` when using the class directly
- When using framework adapters (React), use `useHeldKeys` and `useHeldKeyCodes` hooks for reactive state

## Example

```ts
const tracker = KeyStateTracker.getInstance()

// Access state directly
console.log(tracker.store.state.heldKeys) // ['Control', 'Shift']

// Subscribe to changes with TanStack Store
const unsubscribe = tracker.store.subscribe(() => {
  console.log('Currently held:', tracker.store.state.heldKeys)
})

// Check current state
console.log(tracker.getHeldKeys()) // ['Control', 'Shift']
console.log(tracker.isKeyHeld('Control')) // true

// Cleanup
unsubscribe()
```

## Properties

### store

```ts
readonly store: Store<KeyStateTrackerState>;
```

Defined in: [key-state-tracker.ts:70](https://github.com/TanStack/keys/blob/main/packages/hotkeys/src/key-state-tracker.ts#L70)

The TanStack Store instance containing the tracker state.
Use this to subscribe to state changes or access current state.

## Methods

### areAllKeysHeld()

```ts
areAllKeysHeld(keys): boolean;
```

Defined in: [key-state-tracker.ts:228](https://github.com/TanStack/keys/blob/main/packages/hotkeys/src/key-state-tracker.ts#L228)

Checks if all of the given keys are currently held.

#### Parameters

##### keys

`string`[]

Array of key names to check

#### Returns

`boolean`

True if all of the keys are currently held

***

### destroy()

```ts
destroy(): void;
```

Defined in: [key-state-tracker.ts:235](https://github.com/TanStack/keys/blob/main/packages/hotkeys/src/key-state-tracker.ts#L235)

Destroys the tracker and removes all listeners.

#### Returns

`void`

***

### getHeldKeys()

```ts
getHeldKeys(): string[];
```

Defined in: [key-state-tracker.ts:197](https://github.com/TanStack/keys/blob/main/packages/hotkeys/src/key-state-tracker.ts#L197)

Gets an array of currently held key names.

#### Returns

`string`[]

Array of key names currently being pressed

***

### isAnyKeyHeld()

```ts
isAnyKeyHeld(keys): boolean;
```

Defined in: [key-state-tracker.ts:218](https://github.com/TanStack/keys/blob/main/packages/hotkeys/src/key-state-tracker.ts#L218)

Checks if any of the given keys are currently held.

#### Parameters

##### keys

`string`[]

Array of key names to check

#### Returns

`boolean`

True if any of the keys are currently held

***

### isKeyHeld()

```ts
isKeyHeld(key): boolean;
```

Defined in: [key-state-tracker.ts:207](https://github.com/TanStack/keys/blob/main/packages/hotkeys/src/key-state-tracker.ts#L207)

Checks if a specific key is currently being held.

#### Parameters

##### key

`string`

The key name to check (case-insensitive)

#### Returns

`boolean`

True if the key is currently held

***

### getInstance()

```ts
static getInstance(): KeyStateTracker;
```

Defined in: [key-state-tracker.ts:87](https://github.com/TanStack/keys/blob/main/packages/hotkeys/src/key-state-tracker.ts#L87)

Gets the singleton instance of KeyStateTracker.

#### Returns

`KeyStateTracker`

***

### resetInstance()

```ts
static resetInstance(): void;
```

Defined in: [key-state-tracker.ts:97](https://github.com/TanStack/keys/blob/main/packages/hotkeys/src/key-state-tracker.ts#L97)

Resets the singleton instance. Useful for testing.

#### Returns

`void`
