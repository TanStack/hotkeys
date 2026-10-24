---
id: AppHotkeysStoreOptions
title: AppHotkeysStoreOptions
---

Defined in: [app-hotkeys.ts:329](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L329)

Options for `AppHotkeysStore`.

## Type Parameters

### T

`T` *extends* [`AppHotkeys`](../type-aliases/AppHotkeys.md) = [`AppHotkeys`](../type-aliases/AppHotkeys.md)

## Properties

### customHotkeys?

```ts
optional customHotkeys?: CustomHotkeys<T> | null;
```

Defined in: [app-hotkeys.ts:331](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L331)

Starting custom hotkeys, such as saved data. Invalid entries are ignored with a warning.

***

### onCustomHotkeysChange?

```ts
optional onCustomHotkeysChange?: (customHotkeys) => void;
```

Defined in: [app-hotkeys.ts:333](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L333)

Called with the custom hotkeys after every change, ready to save.

#### Parameters

##### customHotkeys

[`CustomHotkeys`](../type-aliases/CustomHotkeys.md)\<`T`\>

#### Returns

`void`

***

### platform?

```ts
optional platform?: Platform;
```

Defined in: [app-hotkeys.ts:335](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L335)

Platform used to compare hotkeys. Defaults to detection.
