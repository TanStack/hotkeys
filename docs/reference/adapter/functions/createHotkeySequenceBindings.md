---
id: createHotkeySequenceBindings
title: createHotkeySequenceBindings
---

```ts
function createHotkeySequenceBindings(): object;
```

Defined in: [adapter.ts:143](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/adapter.ts#L143)

Reconciles sequence bindings; empty sequences and explicit null targets are skipped.

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

[`HotkeySequenceDefinition`](../interfaces/HotkeySequenceDefinition.md)[]

##### commonOptions?

`SequenceOptions` = `{}`

#### Returns

`void`
