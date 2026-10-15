---
id: provideHotkeys
title: provideHotkeys
---

```ts
function provideHotkeys(options?): Provider;
```

Defined in: [hotkeys-provider.ts:84](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/hotkeys-provider.ts#L84)

Provides default options, app hotkeys, and the user's custom hotkeys to an
injector, such as the application or a component.

## Parameters

### options?

[`ProvideHotkeysOptions`](../interfaces/ProvideHotkeysOptions.md) = `{}`

## Returns

`Provider`

## Example

```ts
bootstrapApplication(App, {
  providers: [
    provideHotkeys({
      appHotkeys,
      customHotkeys: JSON.parse(localStorage.getItem('hotkeys') ?? '{}'),
      onCustomHotkeysChange: (custom) =>
        localStorage.setItem('hotkeys', JSON.stringify(custom)),
    }),
  ],
})
```
