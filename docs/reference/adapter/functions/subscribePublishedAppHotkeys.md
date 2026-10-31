---
id: subscribePublishedAppHotkeys
title: subscribePublishedAppHotkeys
---

```ts
function subscribePublishedAppHotkeys(onChange): () => void;
```

Defined in: [adapter.ts:336](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/adapter.ts#L336)

Calls `onChange` when the store published with `publishAppHotkeysStore` or
`provideAppHotkeys` changes, or when its app hotkeys or custom hotkeys
change. For adapters that resolve app hotkeys without a provider. Returns an
unsubscribe function.

## Parameters

### onChange

() => `void`

## Returns

() => `void`
