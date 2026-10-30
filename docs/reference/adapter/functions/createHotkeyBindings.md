---
id: createHotkeyBindings
title: createHotkeyBindings
---

```ts
function createHotkeyBindings(): object;
```

Defined in: [adapter.ts:55](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/adapter.ts#L55)

Reconciles adapter registrations while retaining handles for option updates.

## Returns

### destroy()

```ts
destroy(): void;
```

#### Returns

`void`

### update()

```ts
update(definitions, commonOptions?): void;
```

Registers new definitions, updates existing ones in place, and removes
stale ones. Definitions with an empty sequence or a null target are skipped.

#### Parameters

##### definitions

readonly [`HotkeyDefinition`](../type-aliases/HotkeyDefinition.md)[]

##### commonOptions?

[`HotkeyBindingsCommonOptions`](../type-aliases/HotkeyBindingsCommonOptions.md) = `{}`

#### Returns

`void`
