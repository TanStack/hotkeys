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

Defined in: [match.ts:41](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/match.ts#L41)

Checks if a KeyboardEvent matches a hotkey.

Uses the `key` property from KeyboardEvent for matching, with a fallback to `code`
for letter keys and digit keys (0-9) when `key` produces special characters
(e.g., macOS Option+letter or Shift+number). Letter keys are matched case-insensitively.

Also handles "dead key" events where `event.key` is `'Dead'` instead of the expected
character. This commonly occurs on macOS with Option+letter combinations (e.g., Option+E,
Option+I, Option+U, Option+N) and on Windows/Linux with international keyboard layouts.
In these cases, `event.code` is used to determine the physical key.

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
