---
id: normalizeKeyName
title: normalizeKeyName
---

```ts
function normalizeKeyName(key): string;
```

Defined in: [constants.ts:248](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/constants.ts#L248)

Normalizes a key name from a `KeyboardEvent` or a hotkey: single letters
become uppercase, and the space character becomes `Space`. Other names are
returned as written, because key names are case-sensitive.

## Parameters

### key

`string`

The key name to normalize

## Returns

`string`

The canonical key name

## Example

```ts
normalizeKeyName('a') // 'A'
normalizeKeyName(' ') // 'Space'
normalizeKeyName('ArrowUp') // 'ArrowUp' (already canonical)
```
