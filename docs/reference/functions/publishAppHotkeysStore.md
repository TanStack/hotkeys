---
id: publishAppHotkeysStore
title: publishAppHotkeysStore
---

```ts
function publishAppHotkeysStore(store): () => void;
```

Defined in: app-hotkeys.ts:543

Publishes a provider's store on the HotkeyManager so devtools can list
declared hotkeys. Returns a cleanup function that unpublishes it if it is
still the published store.

## Parameters

### store

[`AppHotkeysStore`](../classes/AppHotkeysStore.md)

## Returns

() => `void`
