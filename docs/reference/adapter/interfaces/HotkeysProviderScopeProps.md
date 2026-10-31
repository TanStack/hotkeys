---
id: HotkeysProviderScopeProps
title: HotkeysProviderScopeProps
---

Defined in: [adapter.ts:360](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/adapter.ts#L360)

Scope props shared by framework providers.

## Properties

### enabled?

```ts
optional enabled?: boolean;
```

Defined in: [adapter.ts:378](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/adapter.ts#L378)

Set false to deactivate this provider's scope, and the scopes of
providers nested in it, without unmounting. Defaults to true.

***

### exclusive?

```ts
optional exclusive?: 
  | boolean
  | {
  allow: readonly string[];
};
```

Defined in: [adapter.ts:373](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/adapter.ts#L373)

While mounted and enabled, suspend hotkeys in every other scope,
including `'global'`, except scopes of nested providers. Pass
`{ allow: [...] }` to keep other scopes active, such as `'global'`. Use
with `scope`, for dialogs and other overlays.

***

### scope?

```ts
optional scope?: string;
```

Defined in: [adapter.ts:366](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/adapter.ts#L366)

Scope for hotkeys registered inside this provider, active while it is
mounted and enabled. Defaults to the parent provider's scope, or
`'global'` at the root. App hotkeys that declare a scope keep it.
