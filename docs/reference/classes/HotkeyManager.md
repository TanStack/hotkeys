---
id: HotkeyManager
title: HotkeyManager
---

Defined in: [hotkey-manager.ts:448](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L448)

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

Defined in: [hotkey-manager.ts:475](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L475)

The app hotkeys store published by a framework provider, so tools such as
devtools can list declared hotkeys that are not registered.

***

### registrations

```ts
readonly registrations: Store<Map<string, HotkeyRegistration>>;
```

Defined in: [hotkey-manager.ts:468](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L468)

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

***

### scopes

```ts
readonly scopes: Store<HotkeyScopesState>;
```

Defined in: [hotkey-manager.ts:478](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L478)

Active scopes. Subscribe to show which hotkeys are suspended.

## Methods

### activateScope()

```ts
activateScope(scope, options?): () => void;
```

Defined in: [hotkey-manager.ts:540](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L540)

Activates a scope until the returned function is called. Activations are
counted, so a scope stays active until every activation is released.
Framework providers call this while mounted.

When active scopes share a hotkey, a nested scope takes precedence over
its ancestors, and otherwise the most recently activated scope wins. The
same order picks the exclusive scope when several are active, and only
that scope's `allow` list applies.

#### Parameters

##### scope

`string`

##### options?

[`ActivateHotkeyScopeOptions`](../interfaces/ActivateHotkeyScopeOptions.md) = `{}`

#### Returns

() => `void`

#### Example

```ts
const release = manager.activateScope('dialog', { exclusive: true })
// Only hotkeys with scope 'dialog', or scopes nested in it, fire now.
release()

manager.activateScope('dialog', { exclusive: { allow: ['global'] } })
// Hotkeys with scope 'global' fire too.
```

***

### destroy()

```ts
destroy(): void;
```

Defined in: [hotkey-manager.ts:1519](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L1519)

Destroys the manager and removes all listeners.

#### Returns

`void`

***

### getRegistrationCount()

```ts
getRegistrationCount(): number;
```

Defined in: [hotkey-manager.ts:1458](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L1458)

Gets the number of registered hotkeys, chords and sequences.

#### Returns

`number`

***

### hasActiveRegistration()

```ts
hasActiveRegistration(hotkey): boolean;
```

Defined in: [hotkey-manager.ts:1493](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L1493)

Checks whether a hotkey can fire now: at least one registration is
enabled and in an active scope. An app hotkey matches registrations by
id, so custom hotkeys apply. This does not check focus or `target`.

#### Parameters

##### hotkey

  \| [`RegisterableHotkey`](../type-aliases/RegisterableHotkey.md)
  \| [`AppHotkey`](../interfaces/AppHotkey.md)\<`string`, HotkeyChord \| HotkeySequence \| null\>

A chord, sequence, or app hotkey

#### Returns

`boolean`

True if an enabled registration in an active scope exists

***

### isRegistered()

```ts
isRegistered(hotkey, target?): boolean;
```

Defined in: [hotkey-manager.ts:1469](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L1469)

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

### isScopeActive()

```ts
isScopeActive(scope?): boolean;
```

Defined in: [hotkey-manager.ts:575](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L575)

Whether hotkeys in a scope can fire: the scope is `'global'` or
activated, and either no scope is exclusive or this scope is the
exclusive one, nested in it, or allowed by it.

#### Parameters

##### scope?

`string` = `GLOBAL_SCOPE`

#### Returns

`boolean`

***

### register()

```ts
register<T>(
   hotkey, 
   callback, 
options?): HotkeyRegistrationHandle<HotkeyOptionsFor<T>>;
```

Defined in: [hotkey-manager.ts:751](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L751)

Registers a hotkey handler and returns a handle for updating the registration.

Pass a chord (`'Mod+S'` or a RawHotkeyChord object) or a sequence (`['G', 'G']`).
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

A chord string, RawHotkeyChord object, or sequence

##### callback

[`HotkeyCallback`](../type-aliases/HotkeyCallback.md)\<[`HotkeyCallbackContextFor`](../type-aliases/HotkeyCallbackContextFor.md)\<`T`\>\>

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

Defined in: [hotkey-manager.ts:1405](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L1405)

Resets the progress of every in-progress sequence.

#### Returns

`void`

***

### triggerRegistration()

```ts
triggerRegistration(id): boolean;
```

Defined in: [hotkey-manager.ts:1425](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L1425)

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

Defined in: [hotkey-manager.ts:508](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L508)

Gets the singleton instance of HotkeyManager.

#### Returns

`HotkeyManager`

***

### resetInstance()

```ts
static resetInstance(): void;
```

Defined in: [hotkey-manager.ts:515](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L515)

Resets the singleton instance. Useful for testing.

#### Returns

`void`
