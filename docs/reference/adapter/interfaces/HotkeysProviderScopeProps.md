---
id: HotkeysProviderScopeProps
title: HotkeysProviderScopeProps
---

Defined in: [adapter.ts:329](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/adapter.ts#L329)

Scope props shared by framework providers.

## Properties

### enabled?

```ts
optional enabled?: boolean;
```

Defined in: [adapter.ts:347](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/adapter.ts#L347)

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

Defined in: [adapter.ts:342](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/adapter.ts#L342)

While mounted and enabled, suspend hotkeys in every other scope,
including `'global'`, except scopes of nested providers. Pass
`{ allow: [...] }` to keep other scopes active, such as `'global'`. Use
with `scope`, for dialogs and other overlays.

***

### scope?

```ts
optional scope?: string;
```

Defined in: [adapter.ts:335](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/adapter.ts#L335)

Scope for hotkeys registered inside this provider, active while it is
mounted and enabled. Defaults to the parent provider's scope, or
`'global'` at the root. App hotkeys that declare a scope keep it.
