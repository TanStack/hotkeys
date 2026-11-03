---
id: withDefaults
title: withDefaults
---

```ts
function withDefaults<T>(defaults, options): T;
```

Defined in: [\_registration.ts:45](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/_registration.ts#L45)

Merges options over defaults for an API whose `setOptions` treats
`undefined` as "clear". An unset option takes its default, or stays
`undefined` to clear an earlier value when it has no default.

## Type Parameters

### T

`T` *extends* `object`

## Parameters

### defaults

`object` \| `undefined`

### options

`T` \| `undefined`

## Returns

`T`
