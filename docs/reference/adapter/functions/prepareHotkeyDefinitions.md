---
id: prepareHotkeyDefinitions
title: prepareHotkeyDefinitions
---

```ts
function prepareHotkeyDefinitions<TTarget>(definitions, options?): HotkeyDefinition[];
```

Defined in: [adapter.ts:280](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/adapter.ts#L280)

Converts adapter definitions into `createHotkeyBindings` definitions.
Options merge in this order: defaults, app hotkey declaration, common
options, per-definition options. App hotkeys resolve their effective hotkey
from the store, and an unbound app hotkey keeps its position but registers
nothing.

## Type Parameters

### TTarget

`TTarget`

## Parameters

### definitions

readonly [`AdapterHotkeyDefinition`](../type-aliases/AdapterHotkeyDefinition.md)\<`TTarget`\>[]

### options?

[`PrepareHotkeyDefinitionsOptions`](../interfaces/PrepareHotkeyDefinitionsOptions.md)\<`TTarget`\> = `{}`

## Returns

[`HotkeyDefinition`](../type-aliases/HotkeyDefinition.md)[]
