---
id: KeyStateTracker
title: KeyStateTracker
---

# Class: KeyStateTracker

Defined in: [key-state-tracker.ts:63](https://github.com/TanStack/keys/blob/main/packages/keys/src/key-state-tracker.ts#L63)

Singleton tracker for currently held keyboard keys.

This class maintains a list of all keys currently being pressed,
which is useful for:
- Displaying currently held keys to users
- Custom shortcut recording for rebinding
- Complex chord detection

State Management:
- Uses TanStack Store for reactive state management
- State can be accessed via `tracker.store.state` when using the class directly
- When using framework adapters (React/Solid), use `useStore` hooks for reactive state

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

Defined in: [key-state-tracker.ts:70](https://github.com/TanStack/keys/blob/main/packages/keys/src/key-state-tracker.ts#L70)

The TanStack Store instance containing the tracker state.
Use this to subscribe to state changes or access current state.

## Methods

### areAllKeysHeld()

```ts
areAllKeysHeld(keys): boolean;
```

Defined in: [key-state-tracker.ts:209](https://github.com/TanStack/keys/blob/main/packages/keys/src/key-state-tracker.ts#L209)

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

Defined in: [key-state-tracker.ts:233](https://github.com/TanStack/keys/blob/main/packages/keys/src/key-state-tracker.ts#L233)

Destroys the tracker and removes all listeners.

#### Returns

`void`

***

### getHeldKeys()

```ts
getHeldKeys(): string[];
```

Defined in: [key-state-tracker.ts:178](https://github.com/TanStack/keys/blob/main/packages/keys/src/key-state-tracker.ts#L178)

Gets an array of currently held key names.

#### Returns

`string`[]

Array of key names currently being pressed

***

### isAnyKeyHeld()

```ts
isAnyKeyHeld(keys): boolean;
```

Defined in: [key-state-tracker.ts:199](https://github.com/TanStack/keys/blob/main/packages/keys/src/key-state-tracker.ts#L199)

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

Defined in: [key-state-tracker.ts:188](https://github.com/TanStack/keys/blob/main/packages/keys/src/key-state-tracker.ts#L188)

Checks if a specific key is currently being held.

#### Parameters

##### key

`string`

The key name to check (case-insensitive)

#### Returns

`boolean`

True if the key is currently held

***

### ~~subscribe()~~

```ts
subscribe(listener): () => void;
```

Defined in: [key-state-tracker.ts:220](https://github.com/TanStack/keys/blob/main/packages/keys/src/key-state-tracker.ts#L220)

Subscribes to key state changes.

#### Parameters

##### listener

[`KeyStateListener`](../type-aliases/KeyStateListener.md)

Function to call when key state changes

#### Returns

Unsubscribe function

```ts
(): void;
```

##### Returns

`void`

#### Deprecated

Use `tracker.store.subscribe()` or `useStore()` from `@tanstack/react-store` instead.

***

### getInstance()

```ts
static getInstance(): KeyStateTracker;
```

Defined in: [key-state-tracker.ts:86](https://github.com/TanStack/keys/blob/main/packages/keys/src/key-state-tracker.ts#L86)

Gets the singleton instance of KeyStateTracker.

#### Returns

`KeyStateTracker`

***

### resetInstance()

```ts
static resetInstance(): void;
```

Defined in: [key-state-tracker.ts:96](https://github.com/TanStack/keys/blob/main/packages/keys/src/key-state-tracker.ts#L96)

Resets the singleton instance. Useful for testing.

#### Returns

`void`
