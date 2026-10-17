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

Defined in: [useHotkey.ts:48](https://github.com/TanStack/hotkeys/blob/main/packages/octane-hotkeys/src/useHotkey.ts#L48)

Registers one hotkey: a chord such as `'Mod+S'`, a sequence such as
`['G', 'G']`, or an app hotkey from `defineAppHotkeys`. The callback and
options are refreshed after every commit.

### Type Parameters

#### T

`T` *extends* `AppHotkey`\<`string`, `HotkeyChord` \| `HotkeySequence` \| `null`\>

### Parameters

#### hotkey

`T`

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

Defined in: [useHotkey.ts:53](https://github.com/TanStack/hotkeys/blob/main/packages/octane-hotkeys/src/useHotkey.ts#L53)

Registers one hotkey: a chord such as `'Mod+S'`, a sequence such as
`['G', 'G']`, or an app hotkey from `defineAppHotkeys`. The callback and
options are refreshed after every commit.

### Type Parameters

#### T

`T` *extends* `RegisterableHotkey`

### Parameters

#### hotkey

`T`

#### callback

`HotkeyCallback`\<`HotkeyCallbackContextFor`\<`T`\>\>

#### options?

`AdapterOptionsFor`\<`T`, [`UseHotkeyTarget`](../type-aliases/UseHotkeyTarget.md)\>

### Returns

`void`
