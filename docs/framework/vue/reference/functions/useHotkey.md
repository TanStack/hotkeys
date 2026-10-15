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

Defined in: [useHotkey.ts:75](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/useHotkey.ts#L75)

Vue composable for registering a hotkey: a chord such as `'Mod+S'`, a
sequence such as `['G', 'G']`, or an app hotkey from `defineAppHotkeys`.
The hotkey and options may be refs or getters.

Chords accept `requireReset`; sequences accept `timeout`. A one-step
sequence registers as its chord. An app hotkey uses its effective hotkey
from `HotkeysProvider` (including the user's custom hotkey) and its
declared meta and options, and registers nothing while unbound.

### Type Parameters

#### T

`T` *extends* `AppHotkey`\<`string`, `HotkeyChord` \| `HotkeySequence` \| `null`\>

### Parameters

#### hotkey

`MaybeRefOrGetter`\<`T`\>

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

Defined in: [useHotkey.ts:80](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/useHotkey.ts#L80)

Vue composable for registering a hotkey: a chord such as `'Mod+S'`, a
sequence such as `['G', 'G']`, or an app hotkey from `defineAppHotkeys`.
The hotkey and options may be refs or getters.

Chords accept `requireReset`; sequences accept `timeout`. A one-step
sequence registers as its chord. An app hotkey uses its effective hotkey
from `HotkeysProvider` (including the user's custom hotkey) and its
declared meta and options, and registers nothing while unbound.

### Type Parameters

#### T

`T` *extends* `RegisterableHotkey`

### Parameters

#### hotkey

`MaybeRefOrGetter`\<`T`\>

#### callback

`HotkeyCallback`

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
