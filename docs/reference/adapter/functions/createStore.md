---
id: createStore
title: createStore
---

```ts
function createStore<T>(initialState): Store<T>;
```

Defined in: \_store.ts:33

Creates a store. Listeners run synchronously after each change, and an
update to an equal value (by `Object.is`) notifies no one.

## Type Parameters

### T

`T`

## Parameters

### initialState

`T`

## Returns

[`Store`](../type-aliases/Store.md)\<`T`\>
