---
id: PrepareHotkeyDefinitionsOptions
title: PrepareHotkeyDefinitionsOptions
---

Defined in: [adapter.ts:279](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/adapter.ts#L279)

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

Defined in: [adapter.ts:281](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/adapter.ts#L281)

The provider's app hotkeys store, so app hotkeys use custom hotkeys.

***

### commonOptions?

```ts
optional commonOptions?: AdapterCommonOptions<TTarget>;
```

Defined in: [adapter.ts:285](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/adapter.ts#L285)

Options for every definition, applied after app hotkey declarations.

***

### defaults?

```ts
optional defaults?: AdapterCommonOptions<TTarget>;
```

Defined in: [adapter.ts:283](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/adapter.ts#L283)

Provider defaults, applied first.

***

### resolveTarget?

```ts
optional resolveTarget?: (target) => Target | null | undefined;
```

Defined in: [adapter.ts:291](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/adapter.ts#L291)

Resolves a framework target, such as a ref. Return `undefined` for the
document or `null` to skip registration until the target exists.
Without it, targets pass through, so `null` skips registration.

#### Parameters

##### target

`TTarget`

#### Returns

`Target` \| `null` \| `undefined`
