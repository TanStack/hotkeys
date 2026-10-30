---
id: assertValidHotkey
title: assertValidHotkey
---

```ts
function assertValidHotkey(hotkey): void;
```

Defined in: [validate.ts:132](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/validate.ts#L132)

Validates a hotkey and throws an error if invalid.
Useful for development-time validation.

## Parameters

### hotkey

[`ValidatableHotkey`](../type-aliases/ValidatableHotkey.md)

The hotkey string to validate

## Returns

`void`

## Throws

Error if the hotkey is invalid

## Example

```ts
assertValidHotkey('Mod+S') // OK
assertValidHotkey('') // Throws Error: Invalid hotkey: Hotkey cannot be empty
```
