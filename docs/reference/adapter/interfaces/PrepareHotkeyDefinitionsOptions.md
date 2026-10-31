---
id: PrepareHotkeyDefinitionsOptions
title: PrepareHotkeyDefinitionsOptions
---

Defined in: [adapter.ts:274](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/adapter.ts#L274)

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

Defined in: [adapter.ts:276](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/adapter.ts#L276)

The provider's app hotkeys store, so app hotkeys use custom hotkeys.

***

### commonOptions?

```ts
optional commonOptions?: AdapterCommonOptions<TTarget>;
```

Defined in: [adapter.ts:280](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/adapter.ts#L280)

Options for every definition, applied after app hotkey declarations.

***

### defaults?

```ts
optional defaults?: AdapterCommonOptions<TTarget>;
```

Defined in: [adapter.ts:278](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/adapter.ts#L278)

Provider defaults, applied first.

***

### resolveTarget?

```ts
optional resolveTarget?: (target) => Target | null | undefined;
```

Defined in: [adapter.ts:286](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/adapter.ts#L286)

Resolves a framework target, such as a ref. Return `undefined` for the
document or `null` to skip registration until the target exists.
Without it, targets pass through, so `null` skips registration.

#### Parameters

##### target

`TTarget`

#### Returns

`Target` \| `null` \| `undefined`
