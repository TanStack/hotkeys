---
id: AppHotkeysState
title: AppHotkeysState
---

Defined in: [app-hotkeys.ts:321](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L321)

State of an `AppHotkeysStore`.

## Type Parameters

### T

`T` *extends* [`AppHotkeys`](../type-aliases/AppHotkeys.md) = [`AppHotkeys`](../type-aliases/AppHotkeys.md)

## Properties

### appHotkeys

```ts
appHotkeys: T;
```

Defined in: [app-hotkeys.ts:323](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L323)

Effective app hotkeys: declarations with custom hotkeys applied.

***

### customHotkeys

```ts
customHotkeys: CustomHotkeys<T>;
```

Defined in: [app-hotkeys.ts:325](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L325)

The user's hotkeys that differ from the defaults.
