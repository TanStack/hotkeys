---
id: createAppHotkeysStore
title: createAppHotkeysStore
---

```ts
function createAppHotkeysStore<T>(appHotkeys, options): AppHotkeysStore<T>;
```

Defined in: [\_app-hotkeys-factory.ts:21](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/_app-hotkeys-factory.ts#L21)

Creates the store for app hotkeys from `defineAppHotkeys`.

## Type Parameters

### T

`T` *extends* `Readonly`\<`Record`\<`string`, [`AppHotkey`](../interfaces/AppHotkey.md)\<`string`, 
  \| [`HotkeyChord`](../type-aliases/HotkeyChord.md)
  \| [`HotkeySequence`](../type-aliases/HotkeySequence.md)
  \| `null`\>\>\>

## Parameters

### appHotkeys

`T`

### options

[`AppHotkeysStoreOptions`](../interfaces/AppHotkeysStoreOptions.md)\<`T`\>

## Returns

[`AppHotkeysStore`](../classes/AppHotkeysStore.md)\<`T`\>
