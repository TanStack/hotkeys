---
id: checkHotkey
title: checkHotkey
---

```ts
function checkHotkey(hotkey): boolean;
```

Defined in: [validate.ts:164](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/validate.ts#L164)

Validates a hotkey and logs warnings to the console.
Useful for development-time feedback.

## Parameters

### hotkey

[`ValidatableHotkey`](../type-aliases/ValidatableHotkey.md)

The hotkey string to validate

## Returns

`boolean`

True if the hotkey is valid (may still have warnings)

## Example

```ts
checkHotkey('Alt+C')
// Console: Warning: Alt+C may not work reliably on macOS...
// Returns: true
```
