---
id: keyboardEventToHotkey
title: keyboardEventToHotkey
---

# Function: keyboardEventToHotkey()

```ts
function keyboardEventToHotkey(event): Hotkey;
```

Defined in: [parse.ts:248](https://github.com/TanStack/keys/blob/main/packages/hotkeys/src/parse.ts#L248)

Converts a KeyboardEvent directly to a hotkey string.

This is a convenience function that combines `parseKeyboardEvent()` and formatting.
The resulting hotkey string uses canonical modifier names (Control, Alt, Shift, Meta)
and is suitable for use with `useHotkey()` and other hotkey functions.

## Parameters

### event

`KeyboardEvent`

The KeyboardEvent to convert

## Returns

[`Hotkey`](../type-aliases/Hotkey.md)

A hotkey string in canonical form (e.g., 'Control+Shift+S')

## Example

```ts
document.addEventListener('keydown', (event) => {
  const hotkey = keyboardEventToHotkey(event)
  console.log(hotkey) // 'Control+Shift+S'
  useHotkey(hotkey, () => console.log('Shortcut triggered'))
})
```
