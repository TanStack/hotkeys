---
id: assertValidHotkey
title: assertValidHotkey
---

# Function: assertValidHotkey()

```ts
function assertValidHotkey(hotkey): void;
```

Defined in: [validate.ts:138](https://github.com/TanStack/keys/blob/main/packages/hotkeys/src/validate.ts#L138)

Validates a hotkey and throws an error if invalid.
Useful for development-time validation.

## Parameters

### hotkey

The hotkey string to validate

[`Hotkey`](../type-aliases/Hotkey.md) | `string` & `object`

## Returns

`void`

## Throws

Error if the hotkey is invalid

## Example

```ts
assertValidHotkey('Mod+S') // OK
assertValidHotkey('') // Throws Error: Invalid hotkey: Hotkey cannot be empty
```
