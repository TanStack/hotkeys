---
id: AppHotkeysState
title: AppHotkeysState
---

Defined in: app-hotkeys.ts:317

State of an `AppHotkeysStore`.

## Type Parameters

### T

`T` *extends* [`AppHotkeys`](../type-aliases/AppHotkeys.md) = [`AppHotkeys`](../type-aliases/AppHotkeys.md)

## Properties

### appHotkeys

```ts
appHotkeys: T;
```

Defined in: app-hotkeys.ts:319

Effective app hotkeys: declarations with custom hotkeys applied.

***

### customHotkeys

```ts
customHotkeys: CustomHotkeys<T>;
```

Defined in: app-hotkeys.ts:321

The user's hotkeys that differ from the defaults.
