---
id: PrepareHotkeyDefinitionsOptions
title: PrepareHotkeyDefinitionsOptions
---

Defined in: [adapter.ts:289](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/adapter.ts#L289)

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

Defined in: [adapter.ts:291](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/adapter.ts#L291)

The provider's app hotkeys store, so app hotkeys use custom hotkeys.

***

### commonOptions?

```ts
optional commonOptions?: AdapterCommonOptions<TTarget>;
```

Defined in: [adapter.ts:295](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/adapter.ts#L295)

Options for every definition, applied after app hotkey declarations.

***

### defaults?

```ts
optional defaults?: AdapterCommonOptions<TTarget>;
```

Defined in: [adapter.ts:293](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/adapter.ts#L293)

Provider defaults, applied first.

***

### resolveTarget?

```ts
optional resolveTarget?: (target) => Target | null | undefined;
```

Defined in: [adapter.ts:301](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/adapter.ts#L301)

Resolves a framework target, such as a ref. Return `undefined` for the
document or `null` to skip registration until the target exists.
Without it, targets pass through, so `null` skips registration.

#### Parameters

##### target

`TTarget`

#### Returns

`Target` \| `null` \| `undefined`
