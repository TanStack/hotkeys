---
title: Formatting & Display Guide
id: formatting-display
---

Use `formatForDisplay` whenever a hotkey appears in a menu, button, hint, cheat sheet, or shortcut settings panel. It accepts logical strings, bracketed physical strings, raw objects, parsed bindings, and sequences. Store the original binding and format it at render time: the display label is not a registration string.

## Format a binding

```ts
import { formatForDisplay } from '@tanstack/alpine-hotkeys'

formatForDisplay('Mod+S', { platform: 'mac' }) // '⌘ S'
formatForDisplay('Mod+[KeyS]', { platform: 'mac' }) // '⌘ S'
formatForDisplay({ code: 'KeyS', mod: true }, { platform: 'windows' }) // 'Ctrl+S'
formatForDisplay('Mod+[Digit2]', { platform: 'windows' }) // 'Ctrl+2'
```

The same label can represent different bindings. `Mod+S` follows a logical letter; `Mod+[KeyS]` follows a physical position. Physical labels shorten `KeyS` to `S` and `Digit2` to `2`, preserve readable numpad labels, and reuse punctuation and special-key symbols. This does not change the stored code or infer the user's layout.

Omit `platform` to use detection. On macOS the default joins modifier symbols with spaces; Windows and Linux use labels joined with `+`. macOS display orders modifiers as Control, Option, Shift, Command: `Mod+Shift+S` displays as `⇧ ⌘ S`. The normalized binding remains `Mod+Shift+S`.

## Render individual keycaps

Set `parts: true` to get one label per key instead of a joined string:

```ts
const binding = 'Mod+[KeyS]'
const parts = formatForDisplay(binding, { platform: 'mac', parts: true })
// ['⌘', 'S'] — render each part in its own <kbd>
```

With `parts` omitted or false, the result is a string. A runtime boolean returns `string | string[]`. Parts preserve literal plus keys and ignore `separatorToken`.

## Format sequences

Pass a sequence to format each step and join the steps with `sequenceSeparator`, a space by default:

```ts
formatForDisplay(['Mod+[KeyK]', 'C'], { platform: 'mac' }) // '⌘ K C'
formatForDisplay(['G', 'G'], { sequenceSeparator: ' → ' }) // 'G → G'
formatForDisplay(['Mod+[KeyK]', 'C'], { platform: 'mac', parts: true })
// [['⌘', 'K'], ['C']] — one array of keycaps per step
```

With `parts: true`, a sequence returns one array per step, so you can render each step as a group of keycaps.

## Choose symbols and separators

`useSymbols` accepts a boolean or independent `modifiers` and `keys` settings. Omitted fields default to true. Modifier symbols apply on macOS; Windows and Linux retain modifier labels.

```ts
formatForDisplay('Shift+[ArrowUp]', {
  platform: 'mac',
  useSymbols: { modifiers: false, keys: true },
  parts: true,
}) // ['Shift', '↑']

formatForDisplay('Mod+[KeyS]', {
  platform: 'mac', useSymbols: false,
}) // 'Cmd+S'

formatForDisplay('Control++', {
  platform: 'windows', separatorToken: ' · ',
}) // 'Ctrl · +'
```

An empty separator joins labels directly. `undefined` or `null` uses the platform default. `separatorToken` applies within a chord; `sequenceSeparator` applies between steps.

## Supply layout labels

Physical codes describe positions, so their fallback labels may differ from the characters printed on a user's keyboard. Pass an already-resolved `layoutMap` to label those positions for a known layout:

```ts
const layoutMap = new Map([['KeyQ', 'a']])

formatForDisplay('Mod+[KeyQ]', { platform: 'mac', layoutMap }) // '⌘ A'
formatForDisplay('Mod+Q', { platform: 'mac', layoutMap }) // '⌘ Q'
```

Any object with `get(code): string | undefined` works, including a browser `KeyboardLayoutMap`. Formatting stays synchronous. Your app owns loading, errors, and refreshing the map: render fallback labels while loading, then pass the resolved map on the next render. The library never requests it. Logical bindings ignore `layoutMap`.

Use `keyLabels` for explicit labels keyed by physical code or normalized logical key:

```ts
formatForDisplay('Mod+[KeyQ]', {
  platform: 'mac', layoutMap, keyLabels: { KeyQ: 'Action' },
}) // '⌘ Action'
```

The precedence is `keyLabels`, then a layout entry, then the fallback label. Layout entries receive normal letter casing and key symbols; missing or empty entries fall back. Explicit labels are final. All of these options affect display only.

## Compare hotkeys

`areHotkeysEqual(a, b)` compares chords or sequences after resolving modifiers, so `Mod+S` equals `Meta+S` on macOS. Sequences compare step by step. `isHotkeySequence` narrows a `Hotkey` to a sequence, and `simplifyHotkey` turns a one-step sequence into its chord.

## Parse and store bindings

`parseHotkey` returns either a logical `key` or a physical `code`, plus resolved modifier flags. Narrow the union before inspecting the identity:

```ts
import { parseHotkey, normalizeHotkeyFromParsed } from '@tanstack/alpine-hotkeys'

const parsed = parseHotkey('Mod+[KeyS]', 'mac')
if (parsed.code !== undefined) {
  console.log(parsed.code) // 'KeyS'; parsed.key is undefined
}
const stored = normalizeHotkeyFromParsed(parsed, 'mac') // 'Mod+[KeyS]'
formatForDisplay(stored, { platform: 'windows' }) // 'Ctrl+S'
```

Parsed modifiers are already resolved. To display a portable `Mod` binding on another platform, serialize with the original platform first, as above. `normalizeRegisterableHotkey` accepts strings or raw objects and preserves the logical/physical distinction. Do not store display labels or put a bracketed code in a logical `key` field.

Use `validateHotkey` when accepting a chord or sequence from an external source. It returns `valid`, `errors`, and `warnings`, and names the failing step of a sequence; it does not guarantee that a browser or operating system will deliver the shortcut. Recorder validation and live conflict checks are covered in the [recording guide](./hotkey-recording.md#validation-and-conflicts).

Try these options together in the [vanilla formatter playground](../../../framework/vanilla/examples/formatForDisplay).
