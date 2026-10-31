---
id: createHotkeyBindings
title: createHotkeyBindings
---

```ts
function createHotkeyBindings(): object;
```

Defined in: [adapter.ts:66](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/adapter.ts#L66)

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
stale ones. Definitions with no hotkey (undefined, null, empty string, or
empty sequence) or a null target are skipped.

#### Parameters

##### definitions

readonly [`HotkeyDefinition`](../type-aliases/HotkeyDefinition.md)[]

##### commonOptions?

[`HotkeyBindingsCommonOptions`](../type-aliases/HotkeyBindingsCommonOptions.md) = `{}`

#### Returns

`void`
