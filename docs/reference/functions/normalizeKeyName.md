---
id: normalizeKeyName
title: normalizeKeyName
---

# Function: normalizeKeyName()

```ts
function normalizeKeyName(key): string;
```

Defined in: [constants.ts:457](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/constants.ts#L457)

Normalizes a key name to its canonical form.

## Parameters

### key

`string`

The key name to normalize (can be an alias, lowercase, etc.)

## Returns

`string`

The canonical key name

## Example

```ts
normalizeKeyName('esc') // 'Escape'
normalizeKeyName('a') // 'A'
normalizeKeyName('f1') // 'F1'
normalizeKeyName('ArrowUp') // 'ArrowUp' (already canonical)
```
