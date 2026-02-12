---
id: formatKeyForDebuggingDisplay
title: formatKeyForDebuggingDisplay
---

# Function: formatKeyForDebuggingDisplay()

```ts
function formatKeyForDebuggingDisplay(key, options): string;
```

Defined in: [format.ts:227](https://github.com/TanStack/keys/blob/main/packages/hotkeys/src/format.ts#L227)

Formats a single key name for debugging/devtools display.

Unlike `formatForDisplay` which formats full hotkey strings for end-user UIs,
this function formats individual key names (from `event.key`) with rich
platform-aware labels suitable for debugging tools and developer-facing displays.

Features:
- Modifier keys show their platform role (e.g., "Mod (Cmd)" for Meta on Mac)
- On macOS, modifier keys are prefixed with their symbol (e.g., "⌘ Mod (Cmd)")
- Special keys use display symbols (ArrowUp -> "↑", Escape -> "Esc")
- Regular keys pass through unchanged

## Parameters

### key

`string`

A single key name (e.g., "Meta", "Shift", "ArrowUp", "A")

### options

[`FormatKeyDebuggingOptions`](../interfaces/FormatKeyDebuggingOptions.md) = `{}`

Formatting options

## Returns

`string`

A formatted label suitable for debugging display

## Example

```ts
// On macOS:
formatKeyForDebuggingDisplay('Meta')    // '⌘ Mod (Cmd)'
formatKeyForDebuggingDisplay('Control') // '⌃ Ctrl'
formatKeyForDebuggingDisplay('Alt')     // '⌥ Opt'
formatKeyForDebuggingDisplay('Shift')   // '⇧ Shift'

// On Windows:
formatKeyForDebuggingDisplay('Control') // 'Mod (Ctrl)'
formatKeyForDebuggingDisplay('Meta')    // 'Win'

// Special keys (all platforms):
formatKeyForDebuggingDisplay('ArrowUp') // '↑'
formatKeyForDebuggingDisplay('Escape')  // 'Esc'
formatKeyForDebuggingDisplay('Space')   // '␣'

// Regular keys pass through:
formatKeyForDebuggingDisplay('A')       // 'A'

// With source: 'code', values pass through unchanged:
formatKeyForDebuggingDisplay('MetaLeft', { source: 'code' })  // 'MetaLeft'
formatKeyForDebuggingDisplay('KeyA', { source: 'code' })      // 'KeyA'
```
