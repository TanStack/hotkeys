---
id: HotkeyScopesState
title: HotkeyScopesState
---

Defined in: [hotkey-manager.ts:459](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L459)

Active hotkey scopes, published on `HotkeyManager.scopes`.

## Properties

### active

```ts
active: readonly string[];
```

Defined in: [hotkey-manager.ts:464](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L464)

Activated scopes, lowest precedence first. `'global'` is always active
and not listed.

***

### allowed

```ts
allowed: readonly string[];
```

Defined in: [hotkey-manager.ts:471](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L471)

Scopes the exclusive scope allows that are active, possibly including
`'global'`. Empty when no scope is exclusive.

***

### exclusive

```ts
exclusive: string | null;
```

Defined in: [hotkey-manager.ts:466](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L466)

The exclusive scope that owns the keyboard, or `null` when none is active.

***

### suspended

```ts
suspended: readonly string[];
```

Defined in: [hotkey-manager.ts:476](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L476)

Scopes that are active but cannot fire because another scope is
exclusive, possibly including `'global'`.
