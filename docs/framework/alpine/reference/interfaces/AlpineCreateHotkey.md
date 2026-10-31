---
id: AlpineCreateHotkey
title: AlpineCreateHotkey
---

Defined in: [types.ts:101](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L101)

Registers a hotkey: a chord, a sequence, or an app hotkey.

## Call Signature

```ts
AlpineCreateHotkey<T>(
   hotkey, 
   callback, 
   options?): void;
```

Defined in: [types.ts:102](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L102)

Registers a hotkey: a chord, a sequence, or an app hotkey.

### Type Parameters

#### T

`T` *extends* `AppHotkey`\<`string`, `HotkeyChord` \| `HotkeySequence` \| `null`\>

### Parameters

#### hotkey

[`MaybeGetter`](../type-aliases/MaybeGetter.md)\<`T` \| `null` \| `undefined`\>

#### callback

`HotkeyCallback`

#### options?

[`MaybeGetter`](../type-aliases/MaybeGetter.md)\<[`AlpineAppHotkeyOptions`](../type-aliases/AlpineAppHotkeyOptions.md)\<`T`\>\>

### Returns

`void`

## Call Signature

```ts
AlpineCreateHotkey<T>(
   hotkey, 
   callback, 
   options?): void;
```

Defined in: [types.ts:107](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L107)

Registers a hotkey: a chord, a sequence, or an app hotkey.

### Type Parameters

#### T

`T` *extends* `RegisterableHotkey`

### Parameters

#### hotkey

[`MaybeGetter`](../type-aliases/MaybeGetter.md)\<`T` \| `null` \| `undefined`\>

#### callback

`HotkeyCallback`\<`HotkeyCallbackContextFor`\<`T`\>\>

#### options?

[`MaybeGetter`](../type-aliases/MaybeGetter.md)\<`AdapterOptionsFor`\<`T`, [`AlpineHotkeyTarget`](../type-aliases/AlpineHotkeyTarget.md)\>\>

### Returns

`void`
