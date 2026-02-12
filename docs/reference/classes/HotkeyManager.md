---
id: HotkeyManager
title: HotkeyManager
---

# Class: HotkeyManager

Defined in: [hotkey-manager.ts:159](https://github.com/TanStack/keys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L159)

Singleton manager for hotkey registrations.

This class provides a centralized way to register and manage keyboard hotkeys.
It uses a single event listener for efficiency, regardless of how many hotkeys
are registered.

## Example

```ts
const manager = HotkeyManager.getInstance()

const unregister = manager.register('Mod+S', (event, context) => {
  console.log('Save triggered!')
})

// Later, to unregister:
unregister()
```

## Properties

### registrations

```ts
readonly registrations: Store<Map<string, HotkeyRegistration>>;
```

Defined in: [hotkey-manager.ts:181](https://github.com/TanStack/keys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L181)

The TanStack Store containing all hotkey registrations.
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

Defined in: [hotkey-manager.ts:783](https://github.com/TanStack/keys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L783)

Destroys the manager and removes all listeners.

#### Returns

`void`

***

### getRegistrationCount()

```ts
getRegistrationCount(): number;
```

Defined in: [hotkey-manager.ts:754](https://github.com/TanStack/keys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L754)

Gets the number of registered hotkeys.

#### Returns

`number`

***

### isRegistered()

```ts
isRegistered(hotkey, target?): boolean;
```

Defined in: [hotkey-manager.ts:765](https://github.com/TanStack/keys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L765)

Checks if a specific hotkey is registered.

#### Parameters

##### hotkey

[`Hotkey`](../type-aliases/Hotkey.md)

The hotkey string to check

##### target?

Optional target element to match (if provided, both hotkey and target must match)

`Document` | `Window` | `HTMLElement`

#### Returns

`boolean`

True if a matching registration exists

***

### register()

```ts
register(
   hotkey, 
   callback, 
   options): HotkeyRegistrationHandle;
```

Defined in: [hotkey-manager.ts:244](https://github.com/TanStack/keys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L244)

Registers a hotkey handler and returns a handle for updating the registration.

The returned handle allows updating the callback and options without
re-registering, which is useful for avoiding stale closures in React.

#### Parameters

##### hotkey

[`RegisterableHotkey`](../type-aliases/RegisterableHotkey.md)

The hotkey string (e.g., 'Mod+S') or RawHotkey object

##### callback

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)

The function to call when the hotkey is pressed

##### options

[`HotkeyOptions`](../interfaces/HotkeyOptions.md) = `{}`

Options for the hotkey behavior

#### Returns

[`HotkeyRegistrationHandle`](../interfaces/HotkeyRegistrationHandle.md)

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

### triggerRegistration()

```ts
triggerRegistration(id): boolean;
```

Defined in: [hotkey-manager.ts:718](https://github.com/TanStack/keys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L718)

Triggers a registration's callback programmatically from devtools.
Creates a synthetic KeyboardEvent and invokes the callback.

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

Defined in: [hotkey-manager.ts:202](https://github.com/TanStack/keys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L202)

Gets the singleton instance of HotkeyManager.

#### Returns

`HotkeyManager`

***

### resetInstance()

```ts
static resetInstance(): void;
```

Defined in: [hotkey-manager.ts:212](https://github.com/TanStack/keys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L212)

Resets the singleton instance. Useful for testing.

#### Returns

`void`
