---
id: publishAppHotkeysStore
title: publishAppHotkeysStore
---

```ts
function publishAppHotkeysStore(store): () => void;
```

Defined in: [app-hotkeys.ts:671](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L671)

Publishes a provider's store on the HotkeyManager so devtools can list
declared hotkeys. Returns a cleanup function that unpublishes it if it is
still the published store.

## Parameters

### store

[`AppHotkeysStore`](../classes/AppHotkeysStore.md)

## Returns

() => `void`
