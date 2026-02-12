---
id: checkHotkey
title: checkHotkey
---

# Function: checkHotkey()

```ts
function checkHotkey(hotkey): boolean;
```

Defined in: [validate.ts:159](https://github.com/TanStack/keys/blob/main/packages/hotkeys/src/validate.ts#L159)

Validates a hotkey and logs warnings to the console.
Useful for development-time feedback.

## Parameters

### hotkey

The hotkey string to validate

[`Hotkey`](../type-aliases/Hotkey.md) | `string` & `object`

## Returns

`boolean`

True if the hotkey is valid (may still have warnings)

## Example

```ts
checkHotkey('Alt+C')
// Console: Warning: Alt+C may not work reliably on macOS...
// Returns: true
```
