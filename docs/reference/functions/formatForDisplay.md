---
id: formatForDisplay
title: formatForDisplay
---

## Call Signature

```ts
function formatForDisplay(hotkey, options): string[];
```

Defined in: [format.ts:100](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/format.ts#L100)

Formats a hotkey for display in a user interface.

On macOS, uses symbols (⌘⇧S) in the same modifier order as [normalizeHotkeyFromParsed](normalizeHotkeyFromParsed.md).
On Windows/Linux, uses text (Ctrl+Shift+S) with `+` separators.
The separator can be customized with `separatorToken`.
Physical codes use conventional display labels: `[KeyS]` becomes `S` and
`[Digit2]` becomes `2`. These labels do not infer the active keyboard layout
or change matching. Supply a resolved `layoutMap` for layout-aware labels;
`keyLabels` overrides both layout entries and fallback labels.

### Parameters

#### hotkey

[`DisplayHotkey`](../type-aliases/DisplayHotkey.md)

A logical or physical string, raw binding, or ParsedHotkey

#### options

[`FormatDisplayOptions`](../interfaces/FormatDisplayOptions.md) & `object`

Formatting options

### Returns

`string`[]

Display text, or individual key labels when parts is true

### Example

```ts
formatForDisplay('Mod+Shift+S', { platform: 'mac' })
// Returns: '⌘ ⇧ S' (symbols separated by spaces on macOS)

formatForDisplay('Mod+Shift+S', { platform: 'windows' })
// Returns: 'Ctrl+Shift+S'

formatForDisplay('Escape')
// Returns: 'Esc' (on all platforms)
```

## Call Signature

```ts
function formatForDisplay(hotkey, options?): string;
```

Defined in: [format.ts:104](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/format.ts#L104)

Formats a hotkey for display in a user interface.

On macOS, uses symbols (⌘⇧S) in the same modifier order as [normalizeHotkeyFromParsed](normalizeHotkeyFromParsed.md).
On Windows/Linux, uses text (Ctrl+Shift+S) with `+` separators.
The separator can be customized with `separatorToken`.
Physical codes use conventional display labels: `[KeyS]` becomes `S` and
`[Digit2]` becomes `2`. These labels do not infer the active keyboard layout
or change matching. Supply a resolved `layoutMap` for layout-aware labels;
`keyLabels` overrides both layout entries and fallback labels.

### Parameters

#### hotkey

[`DisplayHotkey`](../type-aliases/DisplayHotkey.md)

A logical or physical string, raw binding, or ParsedHotkey

#### options?

[`FormatDisplayOptions`](../interfaces/FormatDisplayOptions.md) & `object`

Formatting options

### Returns

`string`

Display text, or individual key labels when parts is true

### Example

```ts
formatForDisplay('Mod+Shift+S', { platform: 'mac' })
// Returns: '⌘ ⇧ S' (symbols separated by spaces on macOS)

formatForDisplay('Mod+Shift+S', { platform: 'windows' })
// Returns: 'Ctrl+Shift+S'

formatForDisplay('Escape')
// Returns: 'Esc' (on all platforms)
```

## Call Signature

```ts
function formatForDisplay(hotkey, options): string | string[];
```

Defined in: [format.ts:108](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/format.ts#L108)

Formats a hotkey for display in a user interface.

On macOS, uses symbols (⌘⇧S) in the same modifier order as [normalizeHotkeyFromParsed](normalizeHotkeyFromParsed.md).
On Windows/Linux, uses text (Ctrl+Shift+S) with `+` separators.
The separator can be customized with `separatorToken`.
Physical codes use conventional display labels: `[KeyS]` becomes `S` and
`[Digit2]` becomes `2`. These labels do not infer the active keyboard layout
or change matching. Supply a resolved `layoutMap` for layout-aware labels;
`keyLabels` overrides both layout entries and fallback labels.

### Parameters

#### hotkey

[`DisplayHotkey`](../type-aliases/DisplayHotkey.md)

A logical or physical string, raw binding, or ParsedHotkey

#### options

[`FormatDisplayOptions`](../interfaces/FormatDisplayOptions.md)

Formatting options

### Returns

`string` \| `string`[]

Display text, or individual key labels when parts is true

### Example

```ts
formatForDisplay('Mod+Shift+S', { platform: 'mac' })
// Returns: '⌘ ⇧ S' (symbols separated by spaces on macOS)

formatForDisplay('Mod+Shift+S', { platform: 'windows' })
// Returns: 'Ctrl+Shift+S'

formatForDisplay('Escape')
// Returns: 'Esc' (on all platforms)
```
