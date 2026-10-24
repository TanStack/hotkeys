---
id: createHotkeysScope
title: createHotkeysScope
---

```ts
function createHotkeysScope(defaultOptions?): AlpineHotkeys;
```

Defined in: [createHotkeysScope.ts:30](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/createHotkeysScope.ts#L30)

Owns Alpine effects and Store subscriptions, with optional shared defaults.
App hotkeys come from `provideAppHotkeys`. Call destroy from x-data's
destroy hook.

## Parameters

### defaultOptions?

[`MaybeGetter`](../type-aliases/MaybeGetter.md)\<[`DefaultHotkeysOptions`](../interfaces/DefaultHotkeysOptions.md)\> = `{}`

## Returns

[`AlpineHotkeys`](../interfaces/AlpineHotkeys.md)
