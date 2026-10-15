---
id: createHotkey
title: createHotkey
---

## Call Signature

```ts
function createHotkey<T>(
   hotkey, 
   callback, 
   options?): void;
```

Defined in: [createHotkey.ts:64](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/createHotkey.ts#L64)

Solid primitive for registering a hotkey: a chord such as `'Mod+S'`, a
sequence such as `['G', 'G']`, or an app hotkey from `defineAppHotkeys`.
The hotkey and options may be accessors.

Chords accept `requireReset`; sequences accept `timeout`. A one-step
sequence registers as its chord. An app hotkey uses its effective hotkey
from `HotkeysProvider` (including the user's custom hotkey) and its
declared meta and options, and registers nothing while unbound.

### Type Parameters

#### T

`T` *extends* `AppHotkey`\<`string`, `HotkeyChord` \| `HotkeySequence` \| `null`\>

### Parameters

#### hotkey

`MaybeAccessor`\<`T`\>

#### callback

`HotkeyCallback`

#### options?

`MaybeAccessor`\<[`CreateAppHotkeyOptions`](../type-aliases/CreateAppHotkeyOptions.md)\<`T`\>\>

### Returns

`void`

### Example

```tsx
createHotkey('Mod+S', () => save())
createHotkey(['G', 'G'], () => scrollToTop(), { timeout: 500 })
createHotkey('Escape', () => close(), () => ({ enabled: isOpen() }))
```

## Call Signature

```ts
function createHotkey<T>(
   hotkey, 
   callback, 
   options?): void;
```

Defined in: [createHotkey.ts:69](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/createHotkey.ts#L69)

Solid primitive for registering a hotkey: a chord such as `'Mod+S'`, a
sequence such as `['G', 'G']`, or an app hotkey from `defineAppHotkeys`.
The hotkey and options may be accessors.

Chords accept `requireReset`; sequences accept `timeout`. A one-step
sequence registers as its chord. An app hotkey uses its effective hotkey
from `HotkeysProvider` (including the user's custom hotkey) and its
declared meta and options, and registers nothing while unbound.

### Type Parameters

#### T

`T` *extends* `RegisterableHotkey`

### Parameters

#### hotkey

`MaybeAccessor`\<`T`\>

#### callback

`HotkeyCallback`

#### options?

`MaybeAccessor`\<`AdapterOptionsFor`\<`T`, [`CreateHotkeyTarget`](../type-aliases/CreateHotkeyTarget.md)\>\>

### Returns

`void`

### Example

```tsx
createHotkey('Mod+S', () => save())
createHotkey(['G', 'G'], () => scrollToTop(), { timeout: 500 })
createHotkey('Escape', () => close(), () => ({ enabled: isOpen() }))
```
