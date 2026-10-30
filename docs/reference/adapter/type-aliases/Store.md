---
id: Store
title: Store
---

```ts
type Store<T> = Pick<TanStackStore<T>, "state" | "get" | "setState" | "subscribe">;
```

Defined in: [\_store.ts:8](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/_store.ts#L8)

The part of TanStack Store's `Store` that TanStack Hotkeys uses. Its stores
work with TanStack Store's framework adapters, such as `useSelector` from
`@tanstack/react-store`.

## Type Parameters

### T

`T`
