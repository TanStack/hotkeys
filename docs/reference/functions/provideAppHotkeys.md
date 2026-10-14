---
id: provideAppHotkeys
title: provideAppHotkeys
---

```ts
function provideAppHotkeys<T>(appHotkeys, options?): object;
```

Defined in: app-hotkeys.ts:569

Creates an app hotkeys store and publishes it on the HotkeyManager, for
adapters without a provider component (such as Lit and Alpine). Hotkey
APIs in those adapters resolve app hotkeys and custom hotkeys from the
published store. Call it once at startup. Returns the store and a function
that unpublishes it.

## Type Parameters

### T

`T` *extends* `Readonly`\<`Record`\<`string`, [`AppHotkey`](../interfaces/AppHotkey.md)\<`string`, 
  \| [`HotkeyChord`](../type-aliases/HotkeyChord.md)
  \| [`HotkeySequence`](../type-aliases/HotkeySequence.md)
  \| `null`\>\>\>

## Parameters

### appHotkeys

`T`

### options?

[`AppHotkeysStoreOptions`](../interfaces/AppHotkeysStoreOptions.md)\<`T`\> = `{}`

## Returns

`object`

### dispose

```ts
dispose: () => void;
```

#### Returns

`void`

### store

```ts
store: AppHotkeysStore<T>;
```

## Example

```ts
provideAppHotkeys(appHotkeys, {
  customHotkeys: JSON.parse(localStorage.getItem('hotkeys') ?? '{}'),
  onCustomHotkeysChange: (custom) =>
    localStorage.setItem('hotkeys', JSON.stringify(custom)),
})
```
