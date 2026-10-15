---
id: HotkeyManager
title: HotkeyManager
---

Defined in: [hotkey-manager.ts:340](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L340)

Singleton manager for hotkey registrations, including sequences.

This class provides a centralized way to register and manage keyboard
hotkeys. It shares one keydown and one keyup listener per target and
capture phase across registrations.

Sequences (Vim-style hotkeys such as `['G', 'G']`) match when every step is
pressed within the timeout. Modifier-only events (Shift, Control, Alt, or
Meta alone) neither advance nor reset a sequence, so chained modifier chords
such as `['Shift+R', 'Shift+T']` work.

## Example

```ts
const manager = HotkeyManager.getInstance()

const save = manager.register('Mod+S', (event, context) => {
  console.log('Save triggered!')
})
const top = manager.register(['G', 'G'], () => scrollToTop(), { timeout: 500 })

// Later, to unregister:
save.unregister()
top.unregister()
```

## Properties

### appHotkeys

```ts
readonly appHotkeys: Store<
  | AppHotkeysStore<Readonly<Record<string, AppHotkey<string, 
  | HotkeyChord
  | HotkeySequence
  | null>>>>
| null>;
```

Defined in: [hotkey-manager.ts:369](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L369)

The app hotkeys store published by a framework provider, so tools such as
devtools can list declared hotkeys that are not registered.

***

### registrations

```ts
readonly registrations: Store<Map<string, HotkeyRegistration>>;
```

Defined in: [hotkey-manager.ts:362](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L362)

The TanStack Store containing all hotkey registrations, chords and sequences.
Use this to subscribe to registration changes or access current registrations.

#### Example

```ts
const manager = HotkeyManager.getInstance()

// Subscribe to registration changes
const unsubscribe = manager.registrations.subscribe(() => {
  console.log('Registrations changed:', manager.registrations.state.size)
})

// Access current registrations
for (const [id, reg] of manager.registrations.state) {
  console.log(reg.hotkey, reg.options.enabled)
}
```

## Methods

### destroy()

```ts
destroy(): void;
```

Defined in: [hotkey-manager.ts:1045](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L1045)

Destroys the manager and removes all listeners.

#### Returns

`void`

***

### getRegistrationCount()

```ts
getRegistrationCount(): number;
```

Defined in: [hotkey-manager.ts:1015](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L1015)

Gets the number of registered hotkeys, chords and sequences.

#### Returns

`number`

***

### isRegistered()

```ts
isRegistered(hotkey, target?): boolean;
```

Defined in: [hotkey-manager.ts:1026](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L1026)

Checks if a specific hotkey is registered.

#### Parameters

##### hotkey

[`RegisterableHotkey`](../type-aliases/RegisterableHotkey.md)

The chord or sequence to check

##### target?

[`Target`](../type-aliases/Target.md)

Optional target element to match (if provided, both hotkey and target must match)

#### Returns

`boolean`

True if a matching registration exists

***

### register()

```ts
register<T>(
   hotkey, 
   callback, 
options?): HotkeyRegistrationHandle<HotkeyOptionsFor<T>>;
```

Defined in: [hotkey-manager.ts:434](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L434)

Registers a hotkey handler and returns a handle for updating the registration.

Pass a chord (`'Mod+S'` or a RawHotkey object) or a sequence (`['G', 'G']`).
A one-step sequence registers as its chord. Chords accept `requireReset`;
sequences accept `timeout`.

The returned handle allows updating the callback and options without
re-registering, which is useful for avoiding stale closures in React.

#### Type Parameters

##### T

`T` *extends* [`RegisterableHotkey`](../type-aliases/RegisterableHotkey.md)

#### Parameters

##### hotkey

`T`

A chord string, RawHotkey object, or sequence

##### callback

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

The function to call when the hotkey is pressed

##### options?

[`HotkeyOptionsFor`](../type-aliases/HotkeyOptionsFor.md)\<`T`\>

Options for the hotkey behavior

#### Returns

[`HotkeyRegistrationHandle`](../interfaces/HotkeyRegistrationHandle.md)\<[`HotkeyOptionsFor`](../type-aliases/HotkeyOptionsFor.md)\<`T`\>\>

A handle for managing the registration

#### Example

```ts
const handle = manager.register('Mod+S', callback)

// Update callback without re-registering (avoids stale closures)
handle.callback = newCallback

// Update options
handle.setOptions({ enabled: false })

// Unregister when done
handle.unregister()
```

***

### resetSequenceProgress()

```ts
resetSequenceProgress(): void;
```

Defined in: [hotkey-manager.ts:960](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L960)

Resets the progress of every in-progress sequence.

#### Returns

`void`

***

### triggerRegistration()

```ts
triggerRegistration(id): boolean;
```

Defined in: [hotkey-manager.ts:978](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L978)

Triggers a registration's callback programmatically from devtools.
Creates a synthetic KeyboardEvent from the chord (or a sequence's last step)
and invokes the callback.

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
static getInstance(): HotkeyManager;
```

Defined in: [hotkey-manager.ts:383](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L383)

Gets the singleton instance of HotkeyManager.

#### Returns

`HotkeyManager`

***

### resetInstance()

```ts
static resetInstance(): void;
```

Defined in: [hotkey-manager.ts:393](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L393)

Resets the singleton instance. Useful for testing.

#### Returns

`void`
