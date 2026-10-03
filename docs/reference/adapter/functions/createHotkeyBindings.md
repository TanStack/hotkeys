---
id: createHotkeyBindings
title: createHotkeyBindings
---

```ts
function createHotkeyBindings(): object;
```

Defined in: adapter.ts:107

Reconciles adapter registrations while retaining handles for option updates.

## Returns

`object`

### destroy

```ts
destroy: () => void = bindings.destroy;
```

#### Returns

`void`

### update()

```ts
update(definitions, commonOptions?): void;
```

#### Parameters

##### definitions

[`HotkeyDefinition`](../interfaces/HotkeyDefinition.md)[]

##### commonOptions?

`HotkeyOptions` = `{}`

#### Returns

`void`
