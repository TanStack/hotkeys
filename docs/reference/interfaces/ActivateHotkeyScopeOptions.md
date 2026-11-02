---
id: ActivateHotkeyScopeOptions
title: ActivateHotkeyScopeOptions
---

Defined in: [hotkey-manager.ts:491](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L491)

Options for `HotkeyManager.activateScope`.

## Properties

### exclusive?

```ts
optional exclusive?: 
  | boolean
  | {
  allow: readonly string[];
};
```

Defined in: [hotkey-manager.ts:498](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L498)

Suspend every other scope, including `'global'`, until this activation is
released. Scopes nested in this one stay active. Pass `{ allow }` to keep
other scopes active too, such as `{ allow: ['global'] }`. An allowed scope
still has to be activated, except `'global'`.

***

### parent?

```ts
optional parent?: string;
```

Defined in: [hotkey-manager.ts:504](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L504)

The scope this one is nested in. A nested scope takes precedence over its
ancestors even when it was activated first, as nested providers are when
their effects run child-first. Defaults to `'global'`.
