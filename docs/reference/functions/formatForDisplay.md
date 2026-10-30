---
id: formatForDisplay
title: formatForDisplay
---

## Call Signature

```ts
function formatForDisplay(hotkey, options): string[][];
```

Defined in: [format.ts:111](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/format.ts#L111)

Formats a hotkey for display in a user interface.

On macOS, uses symbols (⇧⌘S) in Control, Option, Shift, Command order.
Display ordering does not change the normalized hotkey used for registration.
On Windows/Linux, uses text (Ctrl+Shift+S) with `+` separators.
The separator can be customized with `separatorToken`.
Physical codes use conventional display labels: `[KeyS]` becomes `S` and
`[Digit2]` becomes `2`. These labels do not infer the active keyboard layout
or change matching. Supply a resolved `layoutMap` for layout-aware labels;
`keyLabels` overrides both layout entries and fallback labels.
Sequence steps are formatted individually and joined with `sequenceSeparator`
(a space by default).

To display a single key that is not a hotkey, such as a held key from
`KeyStateTracker`, use `formatKeyForDisplay`.

### Parameters

#### hotkey

readonly [`DisplayHotkeyChord`](../type-aliases/DisplayHotkeyChord.md)[]

A logical or physical hotkey string, raw object, ParsedHotkeyChord, or sequence

#### options

[`FormatDisplayOptions`](../interfaces/FormatDisplayOptions.md) & `object`

Formatting options

### Returns

`string`[][]

Display text, or individual key labels when parts is true (one array per step for sequences)

### Example

```ts
formatForDisplay('Mod+Shift+S', { platform: 'mac' })
// Returns: '⇧ ⌘ S' (symbols separated by spaces on macOS)

formatForDisplay('Mod+Shift+S', { platform: 'windows' })
// Returns: 'Ctrl+Shift+S'

formatForDisplay('Escape')
// Returns: 'Esc' (on all platforms)

formatForDisplay(['G', 'H'])
// Returns: 'G H'
```

## Call Signature

```ts
function formatForDisplay(hotkey, options): string[];
```

Defined in: [format.ts:115](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/format.ts#L115)

Formats a hotkey for display in a user interface.

On macOS, uses symbols (⇧⌘S) in Control, Option, Shift, Command order.
Display ordering does not change the normalized hotkey used for registration.
On Windows/Linux, uses text (Ctrl+Shift+S) with `+` separators.
The separator can be customized with `separatorToken`.
Physical codes use conventional display labels: `[KeyS]` becomes `S` and
`[Digit2]` becomes `2`. These labels do not infer the active keyboard layout
or change matching. Supply a resolved `layoutMap` for layout-aware labels;
`keyLabels` overrides both layout entries and fallback labels.
Sequence steps are formatted individually and joined with `sequenceSeparator`
(a space by default).

To display a single key that is not a hotkey, such as a held key from
`KeyStateTracker`, use `formatKeyForDisplay`.

### Parameters

#### hotkey

[`DisplayHotkeyChord`](../type-aliases/DisplayHotkeyChord.md)

A logical or physical hotkey string, raw object, ParsedHotkeyChord, or sequence

#### options

[`FormatDisplayOptions`](../interfaces/FormatDisplayOptions.md) & `object`

Formatting options

### Returns

`string`[]

Display text, or individual key labels when parts is true (one array per step for sequences)

### Example

```ts
formatForDisplay('Mod+Shift+S', { platform: 'mac' })
// Returns: '⇧ ⌘ S' (symbols separated by spaces on macOS)

formatForDisplay('Mod+Shift+S', { platform: 'windows' })
// Returns: 'Ctrl+Shift+S'

formatForDisplay('Escape')
// Returns: 'Esc' (on all platforms)

formatForDisplay(['G', 'H'])
// Returns: 'G H'
```

## Call Signature

```ts
function formatForDisplay(hotkey, options?): string;
```

Defined in: [format.ts:119](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/format.ts#L119)

Formats a hotkey for display in a user interface.

On macOS, uses symbols (⇧⌘S) in Control, Option, Shift, Command order.
Display ordering does not change the normalized hotkey used for registration.
On Windows/Linux, uses text (Ctrl+Shift+S) with `+` separators.
The separator can be customized with `separatorToken`.
Physical codes use conventional display labels: `[KeyS]` becomes `S` and
`[Digit2]` becomes `2`. These labels do not infer the active keyboard layout
or change matching. Supply a resolved `layoutMap` for layout-aware labels;
`keyLabels` overrides both layout entries and fallback labels.
Sequence steps are formatted individually and joined with `sequenceSeparator`
(a space by default).

To display a single key that is not a hotkey, such as a held key from
`KeyStateTracker`, use `formatKeyForDisplay`.

### Parameters

#### hotkey

[`DisplayHotkey`](../type-aliases/DisplayHotkey.md)

A logical or physical hotkey string, raw object, ParsedHotkeyChord, or sequence

#### options?

[`FormatDisplayOptions`](../interfaces/FormatDisplayOptions.md) & `object`

Formatting options

### Returns

`string`

Display text, or individual key labels when parts is true (one array per step for sequences)

### Example

```ts
formatForDisplay('Mod+Shift+S', { platform: 'mac' })
// Returns: '⇧ ⌘ S' (symbols separated by spaces on macOS)

formatForDisplay('Mod+Shift+S', { platform: 'windows' })
// Returns: 'Ctrl+Shift+S'

formatForDisplay('Escape')
// Returns: 'Esc' (on all platforms)

formatForDisplay(['G', 'H'])
// Returns: 'G H'
```

## Call Signature

```ts
function formatForDisplay(hotkey, options): string | string[] | string[][];
```

Defined in: [format.ts:123](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/format.ts#L123)

Formats a hotkey for display in a user interface.

On macOS, uses symbols (⇧⌘S) in Control, Option, Shift, Command order.
Display ordering does not change the normalized hotkey used for registration.
On Windows/Linux, uses text (Ctrl+Shift+S) with `+` separators.
The separator can be customized with `separatorToken`.
Physical codes use conventional display labels: `[KeyS]` becomes `S` and
`[Digit2]` becomes `2`. These labels do not infer the active keyboard layout
or change matching. Supply a resolved `layoutMap` for layout-aware labels;
`keyLabels` overrides both layout entries and fallback labels.
Sequence steps are formatted individually and joined with `sequenceSeparator`
(a space by default).

To display a single key that is not a hotkey, such as a held key from
`KeyStateTracker`, use `formatKeyForDisplay`.

### Parameters

#### hotkey

[`DisplayHotkey`](../type-aliases/DisplayHotkey.md)

A logical or physical hotkey string, raw object, ParsedHotkeyChord, or sequence

#### options

[`FormatDisplayOptions`](../interfaces/FormatDisplayOptions.md)

Formatting options

### Returns

`string` \| `string`[] \| `string`[][]

Display text, or individual key labels when parts is true (one array per step for sequences)

### Example

```ts
formatForDisplay('Mod+Shift+S', { platform: 'mac' })
// Returns: '⇧ ⌘ S' (symbols separated by spaces on macOS)

formatForDisplay('Mod+Shift+S', { platform: 'windows' })
// Returns: 'Ctrl+Shift+S'

formatForDisplay('Escape')
// Returns: 'Esc' (on all platforms)

formatForDisplay(['G', 'H'])
// Returns: 'G H'
```
