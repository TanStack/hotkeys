---
id: createFormatForDisplay
title: createFormatForDisplay
---

```ts
function createFormatForDisplay(): {
  (hotkey, options): string[][];
  (hotkey, options): string[];
  (hotkey, options?): string;
  (hotkey, options): string | string[] | string[][];
};
```

Defined in: [createFormatForDisplay.ts:21](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/createFormatForDisplay.ts#L21)

Returns `formatForDisplay` with the provider's `platform` as the default,
so labels match the user's platform. Call in a component; the returned
function works anywhere, and JSX updates when the provider's platform
changes. An explicit `platform` option wins.

Server-rendered apps should set the provider's `defaultOptions.platform`
from the request user agent with `detectPlatform(userAgent)`.

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
  const format = createFormatForDisplay()
  return <kbd>{format('Mod+S')}</kbd>
}
```
