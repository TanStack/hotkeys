---
id: getServerPlatformSnapshot
title: getServerPlatformSnapshot
---

```ts
function getServerPlatformSnapshot(): HotkeyPlatform;
```

Defined in: [adapter.ts:424](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/adapter.ts#L424)

The platform to render with during server rendering and hydration when no
provider sets one, for a `useSyncExternalStore` server snapshot. Warns once
in development on the server.

## Returns

`HotkeyPlatform`
