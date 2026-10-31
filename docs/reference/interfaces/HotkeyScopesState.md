---
id: HotkeyScopesState
title: HotkeyScopesState
---

Defined in: [hotkey-manager.ts:416](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L416)

Active hotkey scopes, published on `HotkeyManager.scopes`.

## Properties

### active

```ts
active: readonly string[];
```

Defined in: [hotkey-manager.ts:421](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L421)

Activated scopes, lowest precedence first. `'global'` is always active
and not listed.

***

### allowed

```ts
allowed: readonly string[];
```

Defined in: [hotkey-manager.ts:428](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L428)

Scopes the exclusive scope allows that are active, possibly including
`'global'`. Empty when no scope is exclusive.

***

### exclusive

```ts
exclusive: string | null;
```

Defined in: [hotkey-manager.ts:423](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L423)

The exclusive scope that owns the keyboard, or `null` when none is active.

***

### suspended

```ts
suspended: readonly string[];
```

Defined in: [hotkey-manager.ts:433](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L433)

Scopes that are active but cannot fire because another scope is
exclusive, possibly including `'global'`.
