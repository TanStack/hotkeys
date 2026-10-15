---
id: validateHotkey
title: validateHotkey
---

```ts
function validateHotkey(hotkey): ValidationResult;
```

Defined in: [validate.ts:32](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/validate.ts#L32)

Validates a hotkey and returns any warnings or errors.
Sequences are validated step by step, and messages name the failing step.

Checks for:
- Valid syntax (modifier+...+key format)
- Known modifiers
- Known keys

## Parameters

### hotkey

[`ValidatableHotkey`](../type-aliases/ValidatableHotkey.md)

The hotkey string to validate

## Returns

[`ValidationResult`](../interfaces/ValidationResult.md)

A ValidationResult with validity status, warnings, and errors

## Example

```ts
validateHotkey('Mod+S')
// { valid: true, warnings: [], errors: [] }

validateHotkey('')
// { valid: false, warnings: [], errors: ['Hotkey cannot be empty'] }

validateHotkey(['G', 'Foo+H'])
// { valid: false, warnings: [], errors: ["Step 2: Unknown modifier: 'Foo'"] }
```
