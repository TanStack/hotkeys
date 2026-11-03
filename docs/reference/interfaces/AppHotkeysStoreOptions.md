---
id: AppHotkeysStoreOptions
title: AppHotkeysStoreOptions
---

Defined in: [app-hotkeys.ts:402](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L402)

Options for `AppHotkeysStore`.

## Type Parameters

### T

`T` *extends* [`AppHotkeys`](../type-aliases/AppHotkeys.md) = [`AppHotkeys`](../type-aliases/AppHotkeys.md)

## Properties

### customHotkeys?

```ts
optional customHotkeys?: CustomHotkeys<T> | null;
```

Defined in: [app-hotkeys.ts:410](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L410)

The user's saved custom hotkeys. Invalid entries are ignored with a
warning. Passing a different value to `setOptions` later, such as data
that finished loading or another user's data, replaces the current
custom hotkeys. `undefined` leaves them unchanged; a change to `null`
clears them.

***

### onCustomHotkeysChange?

```ts
optional onCustomHotkeysChange?: (customHotkeys) => void;
```

Defined in: [app-hotkeys.ts:412](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L412)

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

Defined in: [app-hotkeys.ts:414](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L414)

Platform used to compare hotkeys. Defaults to detection.
