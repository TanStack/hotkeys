---
id: getHotkeysProviderScopeKey
title: getHotkeysProviderScopeKey
---

```ts
function getHotkeysProviderScopeKey(options): string | null;
```

Defined in: [adapter.ts:434](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/adapter.ts#L434)

A key for a provider's scope activation, or `null` when the scope should not
be active. Equal keys mean the same activation, so adapters reactivate only
when the key changes, not when an inline `exclusive` object is recreated.

## Parameters

### options

#### active

`boolean`

Whether this provider and every ancestor are enabled.

#### exclusive

  \| `boolean`
  \| \{
  `allow`: readonly `string`[];
\}
  \| `undefined`

#### parent

`string` \| `undefined`

The parent provider's scope.

#### scope

`string` \| `undefined`

## Returns

`string` \| `null`
