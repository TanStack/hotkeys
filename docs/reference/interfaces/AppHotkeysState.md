---
id: AppHotkeysState
title: AppHotkeysState
---

Defined in: [app-hotkeys.ts:394](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L394)

State of an `AppHotkeysStore`.

## Type Parameters

### T

`T` *extends* [`AppHotkeys`](../type-aliases/AppHotkeys.md) = [`AppHotkeys`](../type-aliases/AppHotkeys.md)

## Properties

### appHotkeys

```ts
appHotkeys: T;
```

Defined in: [app-hotkeys.ts:396](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L396)

Effective app hotkeys: declarations with custom hotkeys applied.

***

### customHotkeys

```ts
customHotkeys: CustomHotkeys<T>;
```

Defined in: [app-hotkeys.ts:398](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L398)

The user's hotkeys that differ from the defaults.
