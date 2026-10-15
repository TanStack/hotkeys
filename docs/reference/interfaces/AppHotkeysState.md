---
id: AppHotkeysState
title: AppHotkeysState
---

Defined in: [app-hotkeys.ts:318](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L318)

State of an `AppHotkeysStore`.

## Type Parameters

### T

`T` *extends* [`AppHotkeys`](../type-aliases/AppHotkeys.md) = [`AppHotkeys`](../type-aliases/AppHotkeys.md)

## Properties

### appHotkeys

```ts
appHotkeys: T;
```

Defined in: [app-hotkeys.ts:320](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L320)

Effective app hotkeys: declarations with custom hotkeys applied.

***

### customHotkeys

```ts
customHotkeys: CustomHotkeys<T>;
```

Defined in: [app-hotkeys.ts:322](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L322)

The user's hotkeys that differ from the defaults.
