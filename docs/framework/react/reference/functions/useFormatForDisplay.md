---
id: useFormatForDisplay
title: useFormatForDisplay
---

```ts
function useFormatForDisplay(): {
  (hotkey, options): string[][];
  (hotkey, options): string[];
  (hotkey, options?): string;
  (hotkey, options): string | string[] | string[][];
};
```

Defined in: [useFormatForDisplay.ts:31](https://github.com/TanStack/hotkeys/blob/main/packages/react-hotkeys/src/useFormatForDisplay.ts#L31)

Returns `formatForDisplay` with the platform from `HotkeysProvider`, or the
detected platform without one. A `platform` passed to the returned function
wins.

Call the hook once at the top of the component; the returned function can
be called anywhere, such as in a loop or a condition. Server-rendered apps
should set the provider's `defaultOptions.platform` from the request with
`detectPlatform(userAgent)`, so the server HTML matches the user's platform.

## Returns

```ts
(hotkey, options): string[][];
```

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

A key reported by a `KeyboardEvent`, such as a held key from
`KeyStateTracker`, can be outside the key types: pass it as `{ key }`.

### Parameters

#### hotkey

readonly `DisplayHotkeyChord`[]

A logical or physical hotkey string, raw object, ParsedHotkeyChord, or sequence

#### options

`FormatDisplayOptions` & `object`

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

formatForDisplay('Shift', { platform: 'mac' })
// Returns: '⇧'

formatForDisplay({ key: heldKey })
// A key from a KeyboardEvent, such as a held key

formatForDisplay(['G', 'H'])
// Returns: 'G H'
```

```ts
(hotkey, options): string[];
```

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

A key reported by a `KeyboardEvent`, such as a held key from
`KeyStateTracker`, can be outside the key types: pass it as `{ key }`.

### Parameters

#### hotkey

`DisplayHotkeyChord`

A logical or physical hotkey string, raw object, ParsedHotkeyChord, or sequence

#### options

`FormatDisplayOptions` & `object`

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

formatForDisplay('Shift', { platform: 'mac' })
// Returns: '⇧'

formatForDisplay({ key: heldKey })
// A key from a KeyboardEvent, such as a held key

formatForDisplay(['G', 'H'])
// Returns: 'G H'
```

```ts
(hotkey, options?): string;
```

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

A key reported by a `KeyboardEvent`, such as a held key from
`KeyStateTracker`, can be outside the key types: pass it as `{ key }`.

### Parameters

#### hotkey

`DisplayHotkey`

A logical or physical hotkey string, raw object, ParsedHotkeyChord, or sequence

#### options?

`FormatDisplayOptions` & `object`

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

formatForDisplay('Shift', { platform: 'mac' })
// Returns: '⇧'

formatForDisplay({ key: heldKey })
// A key from a KeyboardEvent, such as a held key

formatForDisplay(['G', 'H'])
// Returns: 'G H'
```

```ts
(hotkey, options): string | string[] | string[][];
```

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

A key reported by a `KeyboardEvent`, such as a held key from
`KeyStateTracker`, can be outside the key types: pass it as `{ key }`.

### Parameters

#### hotkey

`DisplayHotkey`

A logical or physical hotkey string, raw object, ParsedHotkeyChord, or sequence

#### options

`FormatDisplayOptions`

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

formatForDisplay('Shift', { platform: 'mac' })
// Returns: '⇧'

formatForDisplay({ key: heldKey })
// A key from a KeyboardEvent, such as a held key

formatForDisplay(['G', 'H'])
// Returns: 'G H'
```

## Example

```tsx
function SaveButton() {
  const format = useFormatForDisplay()

  return (
    <button>
      Save <kbd>{format('Mod+S')}</kbd>
    </button>
  )
}
```
