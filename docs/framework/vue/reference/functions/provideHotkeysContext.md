---
id: provideHotkeysContext
title: provideHotkeysContext
---

```ts
function provideHotkeysContext(options?): void;
```

Defined in: [HotkeysProviderContext.ts:69](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/HotkeysProviderContext.ts#L69)

Provides default options, app hotkeys, and the user's custom hotkeys to
descendants. `HotkeysProvider` calls this; call it directly in a root
component's setup instead of rendering the provider.

## Parameters

### options?

[`ProvideHotkeysContextOptions`](../interfaces/ProvideHotkeysContextOptions.md) = `{}`

## Returns

`void`

## Example

```ts
provideHotkeysContext({
  appHotkeys,
  customHotkeys: JSON.parse(localStorage.getItem('hotkeys') ?? '{}'),
  onCustomHotkeysChange: (custom) =>
    localStorage.setItem('hotkeys', JSON.stringify(custom)),
})
```
