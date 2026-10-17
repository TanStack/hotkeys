---
id: MaybeGetter
title: MaybeGetter
---

```ts
type MaybeGetter<T> = T | (() => T);
```

Defined in: [types.ts:97](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L97)

A value or a getter evaluated within an Alpine effect or reactive read.

## Type Parameters

### T

`T`
