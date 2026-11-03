---
id: definedOptions
title: definedOptions
---

```ts
function definedOptions<T>(...layers): T;
```

Defined in: [\_registration.ts:26](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/_registration.ts#L26)

Merges option layers left to right. A key set to `undefined` keeps the
earlier layer's value, so an unset option keeps its default. Getters are
read once.

## Type Parameters

### T

`T` *extends* `object`

## Parameters

### layers

...readonly (`object` \| `undefined`)[]

## Returns

`T`
