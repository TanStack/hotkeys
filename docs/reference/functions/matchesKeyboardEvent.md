---
id: matchesKeyboardEvent
title: matchesKeyboardEvent
---

# Function: matchesKeyboardEvent()

```ts
function matchesKeyboardEvent(
   event, 
   hotkey, 
   platform): boolean;
```

Defined in: [match.ts:32](https://github.com/TanStack/keys/blob/main/packages/keys/src/match.ts#L32)

Checks if a KeyboardEvent matches a hotkey.

Uses the `key` property from KeyboardEvent for matching, with a fallback to `code`
for letter keys (A-Z) and digit keys (0-9) when `key` produces special characters
(e.g., macOS Option+letter or Shift+number). Letter keys are matched case-insensitively.

## Parameters

### event

`KeyboardEvent`

The KeyboardEvent to check

### hotkey

The hotkey string or ParsedHotkey to match against

[`Hotkey`](../type-aliases/Hotkey.md) | [`ParsedHotkey`](../interfaces/ParsedHotkey.md)

### platform

The target platform for resolving 'Mod' (defaults to auto-detection)

`"mac"` | `"windows"` | `"linux"`

## Returns

`boolean`

True if the event matches the hotkey

## Example

```ts
document.addEventListener('keydown', (event) => {
  if (matchesKeyboardEvent(event, 'Mod+S')) {
    event.preventDefault()
    handleSave()
  }
})
```
