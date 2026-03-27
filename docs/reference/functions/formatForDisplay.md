---
id: formatForDisplay
title: formatForDisplay
---

# Function: formatForDisplay()

```ts
function formatForDisplay(hotkey, options): string;
```

Defined in: [format.ts:92](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/format.ts#L92)

Formats a hotkey for display in a user interface.

On macOS, uses symbols (⌘⇧S) in the same modifier order as [normalizeHotkeyFromParsed](normalizeHotkeyFromParsed.md).
On Windows/Linux, uses text (Ctrl+Shift+S) with `+` separators.
The separator can be customized with `separatorToken`.

## Parameters

### hotkey

The hotkey string or ParsedHotkey to format

`string` & `object` | [`RegisterableHotkey`](../type-aliases/RegisterableHotkey.md)

### options

[`FormatDisplayOptions`](../interfaces/FormatDisplayOptions.md) = `{}`

Formatting options

## Returns

`string`

A formatted string suitable for display

## Example

```ts
formatForDisplay('Mod+Shift+S', { platform: 'mac' })
// Returns: '⌘ ⇧ S' (symbols separated by spaces on macOS)

formatForDisplay('Mod+Shift+S', { platform: 'windows' })
// Returns: 'Ctrl+Shift+S'

formatForDisplay('Escape')
// Returns: 'Esc' (on all platforms)
```
