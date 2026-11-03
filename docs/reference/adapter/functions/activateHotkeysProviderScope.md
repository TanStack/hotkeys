---
id: activateHotkeysProviderScope
title: activateHotkeysProviderScope
---

```ts
function activateHotkeysProviderScope(key): () => void;
```

Defined in: [adapter.ts:462](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/adapter.ts#L462)

Activates the scope described by a key from `getHotkeysProviderScopeKey`.
Returns a function that releases the activation.

## Parameters

### key

`string`

## Returns

() => `void`
