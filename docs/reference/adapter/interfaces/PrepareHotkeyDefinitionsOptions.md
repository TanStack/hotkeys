---
id: PrepareHotkeyDefinitionsOptions
title: PrepareHotkeyDefinitionsOptions
---

Defined in: [adapter.ts:250](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/adapter.ts#L250)

Context for `prepareHotkeyDefinitions`.

## Type Parameters

### TTarget

`TTarget`

## Properties

### appHotkeysStore?

```ts
optional appHotkeysStore?: 
  | AppHotkeysStore<Readonly<Record<string, AppHotkey<string, HotkeyChord | HotkeySequence | null>>>>
  | null;
```

Defined in: [adapter.ts:252](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/adapter.ts#L252)

The provider's app hotkeys store, so app hotkeys use custom hotkeys.

***

### commonOptions?

```ts
optional commonOptions?: AdapterCommonOptions<TTarget>;
```

Defined in: [adapter.ts:256](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/adapter.ts#L256)

Options for every definition, applied after app hotkey declarations.

***

### defaults?

```ts
optional defaults?: AdapterCommonOptions<TTarget>;
```

Defined in: [adapter.ts:254](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/adapter.ts#L254)

Provider defaults, applied first.

***

### resolveTarget?

```ts
optional resolveTarget?: (target) => Target | null | undefined;
```

Defined in: [adapter.ts:262](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/adapter.ts#L262)

Resolves a framework target, such as a ref. Return `undefined` for the
document or `null` to skip registration until the target exists.
Without it, targets pass through and `null` means document.

#### Parameters

##### target

`TTarget`

#### Returns

`Target` \| `null` \| `undefined`
