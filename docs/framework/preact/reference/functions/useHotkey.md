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

Defined in: [useHotkey.ts:88](https://github.com/TanStack/hotkeys/blob/main/packages/preact-hotkeys/src/useHotkey.ts#L88)

Preact hook for registering a hotkey: a chord such as `'Mod+S'`, a sequence
such as `['G', 'G']`, or an app hotkey from `defineAppHotkeys`.

Uses the singleton HotkeyManager for efficient event handling. The callback
and options sync on every render, so callbacks that reference Preact state
always see the latest values. `enabled: false` keeps the registration
(visible in devtools) and only suppresses firing.

Chords accept `requireReset`; sequences accept `timeout`. A one-step
sequence registers as its chord. An app hotkey uses its effective hotkey
from `HotkeysProvider` (including the user's custom hotkey) and its declared
meta and options, and registers nothing while unbound.

Options merge in this order: provider defaults, app hotkey declaration,
call-site options.

### Type Parameters

#### T

`T` *extends* `AppHotkey`\<`string`, `HotkeyChord` \| `HotkeySequence` \| `null`\>

### Parameters

#### hotkey

`T`

A chord string, RawHotkeyChord object, sequence, or app hotkey

#### callback

`HotkeyCallback`

The function to call when the hotkey is pressed

#### options?

[`UseAppHotkeyOptions`](../type-aliases/UseAppHotkeyOptions.md)\<`T`\>

Options for the hotkey behavior

### Returns

`void`

### Examples

```tsx
function Editor() {
  const [count, setCount] = useState(0)

  useHotkey('Mod+S', () => save(count))
  useHotkey(['G', 'G'], () => scrollToTop(), { timeout: 500 })
  useHotkey('Escape', () => close(), { enabled: isOpen })
}
```

```tsx
function Toolbar() {
  const appHotkeys = useAppHotkeys()
  useHotkey(appHotkeys['doc.save'], () => save())
}
```

## Call Signature

```ts
function useHotkey<T>(
   hotkey, 
   callback, 
   options?): void;
```

Defined in: [useHotkey.ts:93](https://github.com/TanStack/hotkeys/blob/main/packages/preact-hotkeys/src/useHotkey.ts#L93)

Preact hook for registering a hotkey: a chord such as `'Mod+S'`, a sequence
such as `['G', 'G']`, or an app hotkey from `defineAppHotkeys`.

Uses the singleton HotkeyManager for efficient event handling. The callback
and options sync on every render, so callbacks that reference Preact state
always see the latest values. `enabled: false` keeps the registration
(visible in devtools) and only suppresses firing.

Chords accept `requireReset`; sequences accept `timeout`. A one-step
sequence registers as its chord. An app hotkey uses its effective hotkey
from `HotkeysProvider` (including the user's custom hotkey) and its declared
meta and options, and registers nothing while unbound.

Options merge in this order: provider defaults, app hotkey declaration,
call-site options.

### Type Parameters

#### T

`T` *extends* `RegisterableHotkey`

### Parameters

#### hotkey

`T`

A chord string, RawHotkeyChord object, sequence, or app hotkey

#### callback

`HotkeyCallback`\<`HotkeyCallbackContextFor`\<`T`\>\>

The function to call when the hotkey is pressed

#### options?

`AdapterOptionsFor`\<`T`, [`UseHotkeyTarget`](../type-aliases/UseHotkeyTarget.md)\>

Options for the hotkey behavior

### Returns

`void`

### Examples

```tsx
function Editor() {
  const [count, setCount] = useState(0)

  useHotkey('Mod+S', () => save(count))
  useHotkey(['G', 'G'], () => scrollToTop(), { timeout: 500 })
  useHotkey('Escape', () => close(), { enabled: isOpen })
}
```

```tsx
function Toolbar() {
  const appHotkeys = useAppHotkeys()
  useHotkey(appHotkeys['doc.save'], () => save())
}
```
