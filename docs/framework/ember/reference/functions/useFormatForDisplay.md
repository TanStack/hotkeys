---
id: useFormatForDisplay
title: useFormatForDisplay
---

```ts
function useFormatForDisplay(scope?): {
  (hotkey, options): string[][];
  (hotkey, options): string[];
  (hotkey, options?): string;
  (hotkey, options): string | string[] | string[][];
};
```

Defined in: [packages/ember-hotkeys/src/useFormatForDisplay.ts:26](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/useFormatForDisplay.ts#L26)

Returns `formatForDisplay` with the scope's `platform` as the default, so
labels match the user's platform. The returned function works anywhere,
including templates, and reads the scope's defaults when called, so
templates update when they change. An explicit `platform` option wins.

Server-rendered apps should set the scope's default `platform` from the
request user agent, such as
`detectPlatform(fastboot.request.headers.get('user-agent'))` with the
FastBoot service.

## Parameters

### scope?

[`EmberHotkeysScope`](../interfaces/EmberHotkeysScope.md)

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

```gts
class SaveButton extends Component<{ Args: { hotkeys: EmberHotkeysScope } }> {
  format = useFormatForDisplay(this.args.hotkeys)

  <template><kbd>{{this.format "Mod+S"}}</kbd></template>
}
```
