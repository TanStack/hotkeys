---
id: useHotkey
title: useHotkey
---

## Call Signature

```ts
function useHotkey<T>(
   hotkey, 
   callback, 
   options?): void;
```

Defined in: [useHotkey.ts:77](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/useHotkey.ts#L77)

Vue composable for registering a hotkey: a chord such as `'Mod+S'`, a
sequence such as `['G', 'G']`, or an app hotkey from `defineAppHotkeys`.
The hotkey and options may be refs or getters.

Chords accept `requireReset`; sequences accept `timeout`. A one-step
sequence registers as its chord. An app hotkey uses its effective hotkey
from `HotkeysProvider` (including the user's custom hotkey) and its
declared meta and options, and registers nothing while unbound.
`undefined`, `null`, or `''` registers nothing, for an optional shortcut.

### Type Parameters

#### T

`T` *extends* `AppHotkey`\<`string`, `HotkeyChord` \| `HotkeySequence` \| `null`\>

### Parameters

#### hotkey

`MaybeRefOrGetter`\<`T` \| `null` \| `undefined`\>

#### callback

`HotkeyCallback`

#### options?

`MaybeRefOrGetter`\<[`UseAppHotkeyOptions`](../type-aliases/UseAppHotkeyOptions.md)\<`T`\>\>

### Returns

`void`

### Example

```ts
useHotkey('Mod+S', () => save())
useHotkey(['G', 'G'], () => scrollToTop(), { timeout: 500 })
useHotkey('Escape', () => close(), { enabled: isOpen })
```

## Call Signature

```ts
function useHotkey<T>(
   hotkey, 
   callback, 
   options?): void;
```

Defined in: [useHotkey.ts:82](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/useHotkey.ts#L82)

Vue composable for registering a hotkey: a chord such as `'Mod+S'`, a
sequence such as `['G', 'G']`, or an app hotkey from `defineAppHotkeys`.
The hotkey and options may be refs or getters.

Chords accept `requireReset`; sequences accept `timeout`. A one-step
sequence registers as its chord. An app hotkey uses its effective hotkey
from `HotkeysProvider` (including the user's custom hotkey) and its
declared meta and options, and registers nothing while unbound.
`undefined`, `null`, or `''` registers nothing, for an optional shortcut.

### Type Parameters

#### T

`T` *extends* `RegisterableHotkey`

### Parameters

#### hotkey

`MaybeRefOrGetter`\<`T` \| `null` \| `undefined`\>

#### callback

`HotkeyCallback`\<`HotkeyCallbackContextFor`\<`T`\>\>

#### options?

`MaybeRefOrGetter`\<[`UseHotkeyOptionsFor`](../type-aliases/UseHotkeyOptionsFor.md)\<`T`\>\>

### Returns

`void`

### Example

```ts
useHotkey('Mod+S', () => save())
useHotkey(['G', 'G'], () => scrollToTop(), { timeout: 500 })
useHotkey('Escape', () => close(), { enabled: isOpen })
```
