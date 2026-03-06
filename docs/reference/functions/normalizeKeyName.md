---
id: normalizeKeyName
title: normalizeKeyName
---

# Function: normalizeKeyName()

```ts
function normalizeKeyName(key): string;
```

Defined in: [constants.ts:471](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/constants.ts#L471)

Normalizes a key name to its canonical form.

Converts various key name formats (aliases, case variations) into the standard
canonical names used throughout the library. This enables a more forgiving API
where users can write keys in different ways and still get correct behavior.

Normalization rules:
1. Check aliases first (e.g., 'Esc' → 'Escape', 'Del' → 'Delete')
2. Single letters → uppercase (e.g., 'a' → 'A', 's' → 'S')
3. Function keys → uppercase (e.g., 'f1' → 'F1', 'F12' → 'F12')
4. Other keys → returned as-is (already canonical or unknown)

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
