---
id: AlpineCreateHotkey
title: AlpineCreateHotkey
---

Defined in: [types.ts:99](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L99)

Registers a hotkey: a chord, a sequence, or an app hotkey.

## Call Signature

```ts
AlpineCreateHotkey<T>(
   hotkey, 
   callback, 
   options?): void;
```

Defined in: [types.ts:100](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L100)

Registers a hotkey: a chord, a sequence, or an app hotkey.

### Type Parameters

#### T

`T` *extends* `AppHotkey`\<`string`, `HotkeyChord` \| `HotkeySequence` \| `null`\>

### Parameters

#### hotkey

[`MaybeGetter`](../type-aliases/MaybeGetter.md)\<`T`\>

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

Defined in: [types.ts:105](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L105)

Registers a hotkey: a chord, a sequence, or an app hotkey.

### Type Parameters

#### T

`T` *extends* `RegisterableHotkey`

### Parameters

#### hotkey

[`MaybeGetter`](../type-aliases/MaybeGetter.md)\<`T`\>

#### callback

`HotkeyCallback`

#### options?

[`MaybeGetter`](../type-aliases/MaybeGetter.md)\<`AdapterOptionsFor`\<`T`, [`AlpineHotkeyTarget`](../type-aliases/AlpineHotkeyTarget.md)\>\>

### Returns

`void`
