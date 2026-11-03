---
id: provideHotkeysContext
title: provideHotkeysContext
---

```ts
function provideHotkeysContext(options?): void;
```

Defined in: [HotkeysProviderContext.ts:111](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/HotkeysProviderContext.ts#L111)

Provides default options, app hotkeys, and the user's custom hotkeys to
descendants. `HotkeysProvider` calls this; call it directly in a component's
setup instead of rendering the provider.

Nest contexts to create hotkey scopes. A nested context inherits app
hotkeys and merges default options. With `scope`, its hotkeys fire only
while the component is mounted, enabled, and not hidden by `<KeepAlive>`;
with `exclusive`, only its hotkeys fire.

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
