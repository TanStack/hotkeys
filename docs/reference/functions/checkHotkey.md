---
id: checkHotkey
title: checkHotkey
---

```ts
function checkHotkey(hotkey): boolean;
```

Defined in: [validate.ts:155](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/validate.ts#L155)

Validates a hotkey and logs errors and warnings to the console.
Useful for development-time feedback. Logs nothing in production builds.

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
