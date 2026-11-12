---
title: Displaying Hotkeys in Your Alpine UI
id: formatting-display
description: Format Alpine hotkeys as platform-appropriate labels and keycaps, such as ⌘ S on macOS and Ctrl+S on Windows, for menus, buttons, and cheat sheets.
---

Format a hotkey as a label whenever it appears in a menu, button, tooltip, cheat sheet, or shortcut settings panel. `createFormatForDisplay` returns a function that formats chord strings, including physical ones such as `'Mod+[KeyS]'`, chord objects, parsed chords, and sequences. Store the hotkey itself, and format it when you render. A label is for reading, not for registering.

## Format a hotkey

Call `createFormatForDisplay` on an owner from `createHotkeysScope`. It returns the function that formats a hotkey:

```ts
import Alpine from 'alpinejs'
import { createHotkeysScope } from '@tanstack/alpine-hotkeys'

Alpine.data('saveButton', () => {
  const hotkeys = createHotkeysScope()
  const formatForDisplay = hotkeys.createFormatForDisplay()

  return {
    get label() {
      return formatForDisplay('Mod+S')
    },
    destroy() {
      hotkeys.destroy()
    },
  }
})
```

```html
<button x-data="saveButton" type="button">
  Save <kbd x-text="label"></kbd>
</button>
```

The label is `⌘ S` on macOS and `Ctrl+S` on Windows and Linux. The function fills in two things for you:

- **The platform** from the default options of `createHotkeysScope`, or the detected platform without one.
- **The user's keyboard layout**, for physical keys, in Chromium browsers. See [Label physical keys for the user's keyboard](#label-physical-keys-for-the-users-keyboard).

Call `createFormatForDisplay` once, then call the function anywhere in the component, including in loops and conditions. To call it from markup, such as `x-text="formatForDisplay(hotkey)"`, return the function from the component. Don't call `createFormatForDisplay` itself in a reactive expression, where each evaluation adds a new subscription. Options go in the function's second argument. The examples in this guide pass `platform`, so each one has a single result:

```ts
formatForDisplay('Mod+S', { platform: 'mac' }) // '⌘ S'
formatForDisplay('Mod+[KeyS]', { platform: 'mac' }) // '⌘ S'
formatForDisplay({ code: 'KeyS', mod: true }, { platform: 'windows' }) // 'Ctrl+S'
formatForDisplay('Mod+[Digit2]', { platform: 'windows' }) // 'Ctrl+2'
```

The same label can stand for different hotkeys. `Mod+S` follows the character S, and `Mod+[KeyS]` follows the key in the S position. See [Match a key's position instead](../../../guides/sensible-defaults.md#match-a-keys-position-instead). Labels for positions shorten `KeyS` to `S` and `Digit2` to `2`, keep readable numpad labels, and reuse punctuation and special-key symbols. The extra ISO and JIS keys, which have no US key, use their keycap legends: `[IntlBackslash]` shows `\`, `[IntlRo]` shows `\`, and `[IntlYen]` shows `¥`. Formatting doesn't change the stored hotkey or guess the user's keyboard layout.

A `platform` you pass wins over the owner's. On macOS, the label joins modifier symbols with spaces. Windows and Linux use names joined with `+`. macOS orders modifiers as Control, Option, Shift, Command, so `Mod+Shift+S` displays as `⇧ ⌘ S`, while the hotkey itself stays `Mod+Shift+S`.

The function accepts hotkeys only, including single keys such as `'Escape'` and modifiers on their own such as `'Shift'`. A key from a `KeyboardEvent`, such as a held key, can be outside the key types: pass it as `{ key }`.

To set the platform yourself, such as in a test, pass `platform` in the default options of `createHotkeysScope`. It is also the default platform for the owner's hotkeys and recorders:

```ts
const hotkeys = createHotkeysScope({ platform: 'mac' })
```

## Render individual keycaps

Set `parts: true` to get one label per key instead of a joined string:

```ts
const saveHotkey = 'Mod+[KeyS]'
const parts = formatForDisplay(saveHotkey, { platform: 'mac', parts: true })
// ['⌘', 'S'], one label per <kbd>
```

With `parts` omitted or false, the result is a string. A runtime boolean returns `string | string[]`. Parts keep literal plus keys and ignore `separatorToken`.

## Format sequences

Pass a sequence to format each step and join the steps with `sequenceSeparator`, a space by default:

```ts
formatForDisplay(['Mod+[KeyK]', 'C'], { platform: 'mac' }) // '⌘ K C'
formatForDisplay(['G', 'G'], { sequenceSeparator: ' → ' }) // 'G → G'
formatForDisplay(['Mod+[KeyK]', 'C'], { platform: 'mac', parts: true })
// [['⌘', 'K'], ['C']], one array of keycaps per step
```

With `parts: true`, a sequence returns one array per step, so you can render each step as a group of keycaps. To show the steps a user has pressed so far, see [Show sequences in your UI](./sequences#show-sequences-in-your-ui).

## Choose symbols and separators

`useSymbols` accepts a boolean or separate `modifiers` and `keys` settings. Omitted fields default to true. Modifier symbols apply on macOS. Windows and Linux keep modifier names.

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

An empty separator joins labels directly. `undefined` or `null` uses the platform default. `separatorToken` applies within a chord, and `sequenceSeparator` applies between steps.

## Label physical keys for the user's keyboard

A position, such as `[KeyQ]`, has a fallback label for a US keyboard: `Q`. On a French AZERTY keyboard, that key is labeled A. Labels from `createFormatForDisplay` follow the user's keyboard where the browser reports its layout:

```ts
import Alpine from 'alpinejs'
import { createHotkeysScope } from '@tanstack/alpine-hotkeys'

Alpine.data('moveUp', () => {
  const hotkeys = createHotkeysScope()
  const formatForDisplay = hotkeys.createFormatForDisplay()

  return {
    get label() {
      // 'W' on QWERTY, 'Z' on AZERTY
      return formatForDisplay('[KeyW]')
    },
    destroy() {
      hotkeys.destroy()
    },
  }
})
```

```html
<kbd x-data="moveUp" x-text="label"></kbd>
```

> [!IMPORTANT]
> **Layout labels work only in Chromium browsers**, such as Chrome and Edge. Firefox and Safari don't report the keyboard layout, so labels there keep the fallback. For `[KeyQ]`, a French AZERTY user sees `A` in Chrome and `Q` in Firefox. In a cross-origin iframe, Chromium browsers also refuse unless the frame has `allow="keyboard-map"`.

- **The layout loads when the first `createFormatForDisplay` runs.** The label shows the fallback until the layout arrives, and later components have it at once.
- **Format in a getter or a template expression**, as `label` does above. Alpine runs it again when the layout arrives. A label stored as a plain property, such as `label: formatForDisplay('[KeyW]')`, keeps its first value.
- **Only positions change.** Hotkeys that follow characters, such as `Mod+Q`, already show the right key. Matching and recording never use the layout.
- **The layout is read again when the window regains focus**, because browsers send no event when the user switches layouts. This stops when every owner that created the function is destroyed.

`createKeyboardLayout` returns the loaded layout, or `null`, as a reactive `value`, for labels you draw yourself, such as an on-screen keyboard. It maps each code to the character the key types without modifiers, such as `KeyQ` to `a`.

The layout comes from `navigator.keyboard.getLayoutMap()`. To never call it, set `keyboardLayout: false` in the default options of `createHotkeysScope`:

```ts
const hotkeys = createHotkeysScope({ keyboardLayout: false })
```

Alpine has no provider, so the option applies to that owner. Share one options object between components to set it for all of them.

### Supply your own layout

Pass the same kind of map as `layoutMap`, for a layout your app already knows, such as one the user picked in settings:

```ts
const layoutMap = new Map([['KeyQ', 'a']])

formatForDisplay('Mod+[KeyQ]', { platform: 'mac', layoutMap }) // '⌘ A'
formatForDisplay('Mod+Q', { platform: 'mac', layoutMap }) // '⌘ Q'
```

Any object with `get(code): string | undefined` works. A `layoutMap` you pass wins over the loaded layout.

Use `keyLabels` for your own labels, keyed by physical code or by key name:

```ts
formatForDisplay('Mod+[KeyQ]', {
  platform: 'mac', layoutMap, keyLabels: { KeyQ: 'Action' },
}) // '⌘ Action'
```

`keyLabels` wins over a layout entry, which wins over the fallback label. Layout entries get normal letter casing and key symbols, and missing or empty entries fall back. All of these options affect display only.

## Labels in server templates

Alpine runs only in the browser, so labels from `createFormatForDisplay` use the platform detected there. If your server templates, such as Laravel Blade or Rails views, also print shortcut labels, the server doesn't know the platform. Either let Alpine render those labels, such as with `x-text`, or detect the platform from the request's `User-Agent` header with the rules `detectPlatform` uses: `'mac'` if it contains `mac`, `'windows'` if it contains `win`, and `'linux'` otherwise, ignoring case.

## Format outside a component

`createFormatForDisplay` needs an owner from `createHotkeysScope`. Some code that builds labels has none, such as a helper function, a test, or a plain module. There, call the plain `formatForDisplay` function and pass the platform yourself:

```ts
import { formatForDisplay } from '@tanstack/alpine-hotkeys'

formatForDisplay('Mod+S', { platform }) // '⌘ S' when platform is 'mac'
```

The plain function takes the same options as the function from `createFormatForDisplay`. It doesn't read an owner's default options, and it uses only the `layoutMap` you pass. Without a `platform`, it detects one in the browser and uses `'linux'` on a server. To give it the user's layout, call `loadKeyboardLayout()` in the browser, and read the layout from `getKeyboardLayoutStore()`.

The export is marked deprecated so that your editor points component code to `createFormatForDisplay`. Outside a component, it is the function to use.

## Parse, compare, and store hotkeys

`parseHotkey` returns each chord's key, as either a logical `key` or a physical `code`, plus its modifiers with `Mod` resolved. Check which one you have before reading it:

```ts
import { normalizeHotkey, parseHotkey } from '@tanstack/alpine-hotkeys'

const parsed = parseHotkey('Mod+[KeyS]', 'mac')
if (parsed.code !== undefined) {
  console.log(parsed.code) // 'KeyS'; parsed.key is undefined
}
const stored = normalizeHotkey(parsed, 'mac') // 'Mod+[KeyS]'
```

A parsed chord's modifiers are already resolved for one platform. To store it as a hotkey that works on every platform, normalize it with that same platform, as above. `normalizeHotkey` also accepts chord strings, chord objects, and sequences. Store hotkeys, never display labels. [Write a chord as a string or an object](./hotkeys#write-a-chord-as-a-string-or-an-object) covers the forms a hotkey can take.

`areHotkeysEqual(a, b)` compares chords or sequences after resolving modifiers, so `Mod+S` equals `Meta+S` on macOS. Sequences compare step by step. `isHotkeySequence` narrows a `Hotkey` to a sequence, and `simplifyHotkey` turns a one-step sequence into its chord.

Use `validateHotkey` when you accept a hotkey from somewhere else, such as a settings file. It returns `valid`, `errors`, and `warnings`. Each error or warning has a `reason` code, such as `'unknown-modifier'`, the `part` it's about, and for a sequence, the index of the `step`. The library sends no text, so write your own messages for users. The devtools describe each problem in the details of a hotkey. It can't promise that the browser or operating system delivers the shortcut. To check hotkeys as users record them, see [Validate and check conflicts](./custom-hotkey-recording#validate-and-check-conflicts).

For a full list of your app's shortcuts, see [Cheat Sheet UI Helpers](./cheat-sheet-ui-helpers).
