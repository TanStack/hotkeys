---
id: HotkeyCallback
title: HotkeyCallback
---

# Type Alias: HotkeyCallback()

```ts
type HotkeyCallback = (event, context) => void;
```

Defined in: [types.ts:387](https://github.com/TanStack/keys/blob/main/packages/keys/src/types.ts#L387)

Callback function type for hotkey handlers.

## Parameters

### event

`KeyboardEvent`

The keyboard event that triggered the hotkey

### context

[`HotkeyCallbackContext`](../interfaces/HotkeyCallbackContext.md)

Additional context including the hotkey and parsed hotkey

## Returns

`void`

## Example

```ts
const handler: HotkeyCallback = (event, { hotkey, parsedHotkey }) => {
  console.log(`Hotkey ${hotkey} was pressed`)
  console.log(`Modifiers:`, parsedHotkey.modifiers)
}
```
