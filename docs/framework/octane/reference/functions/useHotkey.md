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

Defined in: [useHotkey.ts:49](https://github.com/TanStack/hotkeys/blob/main/packages/octane-hotkeys/src/useHotkey.ts#L49)

Registers one hotkey: a chord such as `'Mod+S'`, a sequence such as
`['G', 'G']`, or an app hotkey from `defineAppHotkeys`. The callback and
options are refreshed after every commit. `undefined`, `null`, or `''`
registers nothing, for an optional shortcut.

### Type Parameters

#### T

`T` *extends* `AppHotkey`\<`string`, `HotkeyChord` \| `HotkeySequence` \| `null`\>

### Parameters

#### hotkey

`T` \| `null` \| `undefined`

#### callback

`HotkeyCallback`

#### options?

[`UseAppHotkeyOptions`](../type-aliases/UseAppHotkeyOptions.md)\<`T`\>

### Returns

`void`

## Call Signature

```ts
function useHotkey<T>(
   hotkey, 
   callback, 
   options?): void;
```

Defined in: [useHotkey.ts:54](https://github.com/TanStack/hotkeys/blob/main/packages/octane-hotkeys/src/useHotkey.ts#L54)

Registers one hotkey: a chord such as `'Mod+S'`, a sequence such as
`['G', 'G']`, or an app hotkey from `defineAppHotkeys`. The callback and
options are refreshed after every commit. `undefined`, `null`, or `''`
registers nothing, for an optional shortcut.

### Type Parameters

#### T

`T` *extends* `RegisterableHotkey`

### Parameters

#### hotkey

`T` \| `null` \| `undefined`

#### callback

`HotkeyCallback`\<`HotkeyCallbackContextFor`\<`T`\>\>

#### options?

`AdapterOptionsFor`\<`T`, [`UseHotkeyTarget`](../type-aliases/UseHotkeyTarget.md)\>

### Returns

`void`
