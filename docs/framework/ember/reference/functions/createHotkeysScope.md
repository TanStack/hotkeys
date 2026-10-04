---
id: createHotkeysScope
title: createHotkeysScope
---

```ts
function createHotkeysScope(defaultOptions?): EmberHotkeysScope;
```

Defined in: [packages/ember-hotkeys/src/createHotkeysScope.ts:29](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/createHotkeysScope.ts#L29)

Creates contextual helpers, modifiers, and recorders with shared, optionally reactive defaults.
Pass the scope to child components through arguments to share configuration.

## Parameters

### defaultOptions?

[`MaybeGetter`](../type-aliases/MaybeGetter.md)\<[`DefaultHotkeysOptions`](../interfaces/DefaultHotkeysOptions.md)\> = `{}`

## Returns

[`EmberHotkeysScope`](../interfaces/EmberHotkeysScope.md)
