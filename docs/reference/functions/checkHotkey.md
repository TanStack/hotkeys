---
id: checkHotkey
title: checkHotkey
---

```ts
function checkHotkey(hotkey): boolean;
```

Defined in: [validate.ts:159](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/validate.ts#L159)

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
checkHotkey('Control+escape')
// Console: Hotkey 'Control+escape' warnings: Unknown key: 'escape'. Key names are case-sensitive, such as 'Escape' and 'F1'.
// Returns: true

checkHotkey('Ctl+K')
// Console: Hotkey 'Ctl+K' errors: Unknown modifier: 'Ctl'
// Returns: false
```
