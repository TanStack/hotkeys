---
id: MaybeGetter
title: MaybeGetter
---

```ts
type MaybeGetter<T> = T | (() => T);
```

Defined in: types.ts:64

A value or a getter evaluated within an Alpine effect or reactive read.

## Type Parameters

### T

`T`
