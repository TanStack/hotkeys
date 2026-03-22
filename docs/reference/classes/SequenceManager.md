---
id: SequenceManager
title: SequenceManager
---

# Class: SequenceManager

Defined in: [sequence-manager.ts:148](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/sequence-manager.ts#L148)

## Properties

### registrations

```ts
readonly registrations: Store<Map<string, SequenceRegistrationView>>;
```

Defined in: [sequence-manager.ts:155](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/sequence-manager.ts#L155)

The TanStack Store containing sequence registration views for devtools.
Subscribe to this to observe registration changes.

## Methods

### destroy()

```ts
destroy(): void;
```

Defined in: [sequence-manager.ts:602](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/sequence-manager.ts#L602)

Destroys the manager and removes all listeners.

#### Returns

`void`

***

### getRegistrationCount()

```ts
getRegistrationCount(): number;
```

Defined in: [sequence-manager.ts:595](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/sequence-manager.ts#L595)

Gets the number of registered sequences.

#### Returns

`number`

***

### register()

```ts
register(
   sequence, 
   callback, 
   options): SequenceRegistrationHandle;
```

Defined in: [sequence-manager.ts:201](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/sequence-manager.ts#L201)

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

[`SequenceRegistrationHandle`](../interfaces/SequenceRegistrationHandle.md)

A handle to update or unregister the sequence

***

### resetAll()

```ts
resetAll(): void;
```

Defined in: [sequence-manager.ts:537](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/sequence-manager.ts#L537)

Resets all sequence progress.

#### Returns

`void`

***

### triggerSequence()

```ts
triggerSequence(id): boolean;
```

Defined in: [sequence-manager.ts:551](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/sequence-manager.ts#L551)

Triggers a sequence's callback programmatically from devtools.
Creates a synthetic KeyboardEvent from the last key in the sequence.

#### Parameters

##### id

`string`

The registration ID to trigger

#### Returns

`boolean`

True if the registration was found and triggered

***

### getInstance()

```ts
static getInstance(): SequenceManager;
```

Defined in: [sequence-manager.ts:176](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/sequence-manager.ts#L176)

Gets the singleton instance of SequenceManager.

#### Returns

`SequenceManager`

***

### resetInstance()

```ts
static resetInstance(): void;
```

Defined in: [sequence-manager.ts:186](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/sequence-manager.ts#L186)

Resets the singleton instance. Useful for testing.

#### Returns

`void`
