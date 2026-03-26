---
id: isModifierKey
title: isModifierKey
---

# Function: isModifierKey()

```ts
function isModifierKey(key): key is string;
```

Defined in: [parse.ts:242](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/parse.ts#L242)

Checks if a string is a recognized modifier token (including aliases).

For a `KeyboardEvent`, use `isModifier(normalizeKeyName(event.key))` so DOM
spellings like `OS` / `Win` match the same alias table.

## Parameters

### key

Key name or alias (e.g. from a hotkey string or `event.key`)

[`Key`](../type-aliases/Key.md) | `string` & `object`

## Returns

`key is string`

True if the string is a recognized modifier
