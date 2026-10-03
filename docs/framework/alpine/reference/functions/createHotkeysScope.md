---
id: createHotkeysScope
title: createHotkeysScope
---

```ts
function createHotkeysScope(defaultOptions?): AlpineHotkeys;
```

Defined in: [createHotkeysScope.ts:18](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/createHotkeysScope.ts#L18)

Owns Alpine effects and Store subscriptions, with optional shared defaults. Call destroy from x-data's destroy hook.

## Parameters

### defaultOptions?

[`MaybeGetter`](../type-aliases/MaybeGetter.md)\<[`DefaultHotkeysOptions`](../interfaces/DefaultHotkeysOptions.md)\> = `{}`

## Returns

[`AlpineHotkeys`](../interfaces/AlpineHotkeys.md)
