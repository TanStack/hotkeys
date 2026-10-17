---
id: HotkeyScopesState
title: HotkeyScopesState
---

Defined in: [hotkey-manager.ts:349](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L349)

Active hotkey scopes, published on `HotkeyManager.scopes`.

## Properties

### active

```ts
active: readonly string[];
```

Defined in: [hotkey-manager.ts:354](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L354)

Activated scopes, lowest precedence first. `'global'` is always active
and not listed.

***

### allowed

```ts
allowed: readonly string[];
```

Defined in: [hotkey-manager.ts:361](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L361)

Scopes the exclusive scope allows that are active, possibly including
`'global'`. Empty when no scope is exclusive.

***

### exclusive

```ts
exclusive: string | null;
```

Defined in: [hotkey-manager.ts:356](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L356)

The exclusive scope that owns the keyboard, or `null` when none is active.

***

### suspended

```ts
suspended: readonly string[];
```

Defined in: [hotkey-manager.ts:366](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L366)

Scopes that are active but cannot fire because another scope is
exclusive, possibly including `'global'`.
