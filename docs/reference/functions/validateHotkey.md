---
id: validateHotkey
title: validateHotkey
---

# Function: validateHotkey()

```ts
function validateHotkey(hotkey): ValidationResult;
```

Defined in: [validate.ts:24](https://github.com/TanStack/keys/blob/main/packages/hotkeys/src/validate.ts#L24)

Validates a hotkey string and returns any warnings or errors.

Checks for:
- Valid syntax (modifier+...+key format)
- Known modifiers
- Known keys

## Parameters

### hotkey

The hotkey string to validate

[`Hotkey`](../type-aliases/Hotkey.md) | `string` & `object`

## Returns

[`ValidationResult`](../interfaces/ValidationResult.md)

A ValidationResult with validity status, warnings, and errors

## Example

```ts
validateHotkey('Mod+S')
// { valid: true, warnings: [], errors: [] }

validateHotkey('')
// { valid: false, warnings: [], errors: ['Hotkey cannot be empty'] }
```
