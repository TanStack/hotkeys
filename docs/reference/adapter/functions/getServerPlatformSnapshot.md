---
id: getServerPlatformSnapshot
title: getServerPlatformSnapshot
---

```ts
function getServerPlatformSnapshot(): Platform;
```

Defined in: [adapter.ts:425](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/adapter.ts#L425)

The platform to render with during server rendering and hydration when no
provider sets one, for a `useSyncExternalStore` server snapshot. Warns once
in development on the server.

## Returns

`Platform`
