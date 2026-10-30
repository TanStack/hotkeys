---
id: AppHotkeysState
title: AppHotkeysState
---

Defined in: [app-hotkeys.ts:331](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L331)

State of an `AppHotkeysStore`.

## Type Parameters

### T

`T` *extends* [`AppHotkeys`](../type-aliases/AppHotkeys.md) = [`AppHotkeys`](../type-aliases/AppHotkeys.md)

## Properties

### appHotkeys

```ts
appHotkeys: T;
```

Defined in: [app-hotkeys.ts:333](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L333)

Effective app hotkeys: declarations with custom hotkeys applied.

***

### customHotkeys

```ts
customHotkeys: CustomHotkeys<T>;
```

Defined in: [app-hotkeys.ts:335](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L335)

The user's hotkeys that differ from the defaults.
