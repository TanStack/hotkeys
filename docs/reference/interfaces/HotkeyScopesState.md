---
id: HotkeyScopesState
title: HotkeyScopesState
---

Defined in: [hotkey-manager.ts:376](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L376)

Active hotkey scopes, published on `HotkeyManager.scopes`.

## Properties

### active

```ts
active: readonly string[];
```

Defined in: [hotkey-manager.ts:381](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L381)

Activated scopes, lowest precedence first. `'global'` is always active
and not listed.

***

### allowed

```ts
allowed: readonly string[];
```

Defined in: [hotkey-manager.ts:388](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L388)

Scopes the exclusive scope allows that are active, possibly including
`'global'`. Empty when no scope is exclusive.

***

### exclusive

```ts
exclusive: string | null;
```

Defined in: [hotkey-manager.ts:383](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L383)

The exclusive scope that owns the keyboard, or `null` when none is active.

***

### suspended

```ts
suspended: readonly string[];
```

Defined in: [hotkey-manager.ts:393](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L393)

Scopes that are active but cannot fire because another scope is
exclusive, possibly including `'global'`.
