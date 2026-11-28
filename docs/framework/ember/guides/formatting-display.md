---
title: Displaying Hotkeys in Your Ember UI
id: formatting-display
description: Format Ember hotkeys as platform-appropriate labels and keycaps, such as ⌘ S on macOS and Ctrl+S on Windows, for menus, buttons, and cheat sheets.
---

Format a hotkey as a label whenever it appears in a menu, button, tooltip, cheat sheet, or shortcut settings panel. `useFormatForDisplay` returns a function that formats chord strings, including physical ones such as `'Mod+[KeyS]'`, chord objects, parsed chords, and sequences. Store the hotkey itself, and format it at render time. A label is for reading, not for registering.

A label depends on the user's platform: `Mod+S` is `⌘ S` on macOS and `Ctrl+S` elsewhere. In the browser, `useFormatForDisplay` detects the platform. With FastBoot, set a scope's `platform` from the request. See [SSR & Hydration](./ssr).

## Format a hotkey

Call `useFormatForDisplay` in a class field of a component. It returns the function that formats a hotkey, and the template can call it as a helper:

```gts
import Component from '@glimmer/component'
import { useFormatForDisplay } from '@tanstack/ember-hotkeys'

export default class SaveButton extends Component {
  formatForDisplay = useFormatForDisplay()

  <template>
    <button type="button">
      Save <kbd>{{this.formatForDisplay 'Mod+S'}}</kbd>
    </button>
  </template>
}
```

The label is `⌘ S` on macOS and `Ctrl+S` on Windows and Linux. The utility fills in the following for you:

- **The platform** from the `createHotkeysScope` scope you pass it, or the detected platform without one.
- **The user's keyboard layout**, for physical keys, in Chromium browsers. See [Label physical keys for the user's keyboard](#label-physical-keys-for-the-users-keyboard).

Call the utility once, then call the function anywhere in the component: in the template, in a getter, or in a method. Options go in its second argument. In a template, build them with the `hash` helper from `@ember/helper`, such as `{{this.formatForDisplay 'Mod+S' (hash platform='mac')}}`. The examples in this guide pass `platform`, so each one has a single result:

```ts
formatForDisplay('Mod+S', { platform: 'mac' }) // '⌘ S'
formatForDisplay('Mod+[KeyS]', { platform: 'mac' }) // '⌘ S'
formatForDisplay({ code: 'KeyS', mod: true }, { platform: 'windows' }) // 'Ctrl+S'
formatForDisplay('Mod+[Digit2]', { platform: 'windows' }) // 'Ctrl+2'
```

The same label can stand for different hotkeys. `Mod+S` follows the character S, and `Mod+[KeyS]` follows the key in the S position. See [Match a key's position instead](../../../guides/sensible-defaults.md#match-a-keys-position-instead). Labels for positions shorten `KeyS` to `S` and `Digit2` to `2`, keep readable numpad labels, and reuse punctuation and special-key symbols. The extra ISO and JIS keys, which have no US key, use their keycap legends: `[IntlBackslash]` shows `\`, `[IntlRo]` shows `\`, and `[IntlYen]` shows `¥`. Formatting doesn't change the stored hotkey or guess the user's keyboard layout.

A `platform` you pass wins over the scope's. On macOS, the label joins modifier symbols with spaces. Windows and Linux use names joined with `+`. macOS orders modifiers as Control, Option, Shift, Command, so `Mod+Shift+S` displays as `⇧ ⌘ S`, while the hotkey itself stays `Mod+Shift+S`.

The function accepts hotkeys only, including single keys such as `'Escape'` and modifiers on their own such as `'Shift'`. A key from a `KeyboardEvent`, such as a held key, can be outside the key types: pass it as `{ key }`.

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

A position, such as `[KeyQ]`, has a fallback label for a US keyboard: `Q`. On a French AZERTY keyboard, that key is labeled A. Labels from `useFormatForDisplay` follow the user's keyboard where the browser reports its layout:

```gts
import Component from '@glimmer/component'
import { useFormatForDisplay } from '@tanstack/ember-hotkeys'

export default class MoveUp extends Component {
  formatForDisplay = useFormatForDisplay()

  <template>
    {{! 'W' on QWERTY, 'Z' on AZERTY }}
    <kbd>{{this.formatForDisplay "[KeyW]"}}</kbd>
  </template>
}
```

> [!IMPORTANT]
> **Layout labels work only in Chromium browsers**, such as Chrome and Edge. Firefox and Safari don't report the keyboard layout, so labels there keep the fallback. For `[KeyQ]`, a French AZERTY user sees `A` in Chrome and `Q` in Firefox. In a cross-origin iframe, Chromium browsers also refuse unless the frame has `allow="keyboard-map"`.

- **The layout loads after the first label renders.** The first render shows the fallback label, and so does FastBoot HTML. The label updates when the layout arrives, and later labels have it at once.
- **Only positions change.** Hotkeys that follow characters, such as `Mod+Q`, already show the right key. Matching and recording never use the layout.
- **Each function from `useFormatForDisplay` reads the layout once**, after the render in which it first labels a position. The function has no owner, so it doesn't follow the layout after that. A label that renders later reads the layout again, and every label then updates.

`useKeyboardLayout(this)` returns the loaded layout through `value`, or `null`, for labels you draw yourself, such as an on-screen keyboard. It maps each code to the character the key types without modifiers, such as `KeyQ` to `a`. While its owner lives, the layout is also read again when the window regains focus, because browsers send no event when the user switches layouts. To keep every label current, call it in a component that stays rendered, such as the one your application template renders:

```gts
import Component from '@glimmer/component'
import { useKeyboardLayout } from '@tanstack/ember-hotkeys'

export default class AppShell extends Component {
  layout = useKeyboardLayout(this)

  <template>{{yield}}</template>
}
```

The layout comes from `navigator.keyboard.getLayoutMap()`. To never call it, set `keyboardLayout: false` in the default options of `createHotkeysScope`, and pass the scope to `useFormatForDisplay` and `useKeyboardLayout`:

```ts
hotkeys = createHotkeysScope({ keyboardLayout: false })
formatForDisplay = useFormatForDisplay(this.hotkeys)
```

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

`keyLabels` wins over a layout entry, which wins over the fallback label. Layout entries get normal letter casing and key symbols, and missing or empty entries fall back. All of these options affect display only. `keyLabels` works anywhere, including in FastBoot.

## Format for `aria-keyshortcuts`

`useFormatForAria()` returns a function that formats a hotkey for the [`aria-keyshortcuts`](https://w3c.github.io/aria/#aria-keyshortcuts) attribute so screen readers can announce it. It uses the same platform and keyboard layout as the display formatter. See [Accessibility](./accessibility#announce-shortcuts-to-screen-readers) for where to place the attribute.

```gts
import Component from '@glimmer/component'
import { useFormatForAria, useFormatForDisplay } from '@tanstack/ember-hotkeys'
import type { EmberHotkeysScope } from '@tanstack/ember-hotkeys'

class SearchButton extends Component<{ Args: { hotkeys: EmberHotkeysScope } }> {
  formatForAria = useFormatForAria(this.args.hotkeys)
  formatForDisplay = useFormatForDisplay(this.args.hotkeys)

  <template>
    <button aria-keyshortcuts={{this.formatForAria "Mod+K"}}>
      Search <kbd>{{this.formatForDisplay "Mod+K"}}</kbd>
    </button>
  </template>
}
```

The output uses the key names from the ARIA specification:

- **Modifiers.** `Mod` becomes `Meta` on macOS and `Control` elsewhere. Modifiers use `Control`, `Alt`, `Shift`, and `Meta` in that order before the key, so `Mod+Shift+P` formats as `Shift+Meta+P` on macOS.
- **Keys.** Keys use `KeyboardEvent.key` values (`K`, `/`, `Escape`, `ArrowUp`), with `Space` for the space bar and `Plus` for the plus key. A physical binding names the key at that position from the user's keyboard layout where the browser reports it, so `[KeyQ]` formats as `Q`, or `A` on a French AZERTY keyboard. A logical hotkey's punctuation stays as written, so `'?'` formats as `?` rather than the `Shift+/` you press on a US keyboard. The key that types `?` depends on the layout. To name the key, bind it physically, such as `Shift+[Slash]`.
- **No value.** Returns `undefined` for a multi-step sequence, a standalone modifier, an empty or `null` hotkey, or a physical code with no key name such as `[NumpadMemoryAdd]`, so Glimmer omits the attribute. ARIA has no syntax for multi-step sequences.

For a control with two shortcuts, join both formatted values with a space, such as `Control+K /`.

## Server-side rendering

The server doesn't know the user's platform, so labels rendered in FastBoot use `'linux'` unless a scope sets `platform`. Pass a `createHotkeysScope` scope with `platform: detectPlatform(userAgent)` to `useFormatForDisplay`, or render labels only in the browser. See [SSR & Hydration](./ssr) for the FastBoot, Prember, and caching details.

## Format outside a component

`useFormatForDisplay` is made for components: its function reads tracked state, and loads the keyboard layout after a render. Some code that builds labels isn't a component, such as a test or a plain module. There, call the plain `formatForDisplay` function and pass the platform yourself:

```ts
import { formatForDisplay } from '@tanstack/ember-hotkeys'

formatForDisplay('Mod+S', { platform }) // '⌘ S' when platform is 'mac'
```

The plain function takes the same options as the function from the utility. It doesn't read a scope, and it uses only the `layoutMap` you pass. Without a `platform`, it detects one in the browser and uses `'linux'` on a server. To give it the user's layout, call `loadKeyboardLayout()` in the browser, and read the layout from `getKeyboardLayoutStore()`.

The export is marked deprecated so that your editor points component code to the utility. Outside a component, it is the function to use.

For `aria-keyshortcuts` outside a component, call `formatForAria` directly with `platform` and an optional `layoutMap`. For example, `formatForAria('Mod+S', { platform: 'mac' })` returns `'Meta+S'`. Like `formatForDisplay`, the plain export is marked `@deprecated`, so editors point component code to the adapter's formatter.

## Parse, compare, and store hotkeys

`parseHotkey` returns each chord's key, as either a logical `key` or a physical `code`, plus its modifiers with `Mod` resolved. Check which one you have before reading it:

```ts
import { normalizeHotkey, parseHotkey } from '@tanstack/ember-hotkeys'

const parsed = parseHotkey('Mod+[KeyS]', 'mac')
if (parsed.code !== undefined) {
  console.log(parsed.code) // 'KeyS'; parsed.key is undefined
}
const stored = normalizeHotkey(parsed, 'mac') // 'Mod+[KeyS]'
```

- **Normalize before saving.** A parsed chord's modifiers are already resolved for one platform. To store it as a hotkey that works on every platform, normalize it with that same platform, as above. `normalizeHotkey` also accepts chord strings, chord objects, and sequences. Store hotkeys, never display labels. [Write a chord as a string or an object](./hotkeys#write-a-chord-as-a-string-or-an-object) covers the forms a hotkey can take. Because normalizing on macOS turns `Meta+S` into `Mod+S`, keep the original registerable binding string if an explicit modifier must stay platform-specific.
- **Compare bindings.** `areHotkeysEqual(a, b)` compares chords or sequences after resolving modifiers, so `Mod+S` equals `Meta+S` on macOS. Sequences compare step by step. `isHotkeySequence` narrows a `Hotkey` to a sequence, and `simplifyHotkey` turns a one-step sequence into its chord.
- **Validate untrusted strings.** Pass a hotkey from a settings file or user input to `validateHotkey`. It returns `{ valid, errors, warnings }`, and each issue includes:
  - `reason`, a machine-readable code such as `'unknown-modifier'`
  - `part`, the token the issue is about
  - `step`, the zero-based step index for a sequence

`validateHotkey` checks syntax only. It can't promise that the browser or operating system delivers the shortcut. The library sends no text, so map each `reason` code to your own messages. The devtools describe each problem in the details of a hotkey. To check hotkeys as users record them, see [Validate and check conflicts](./custom-hotkey-recording#validate-and-check-conflicts).

For a full list of your app's shortcuts, see [Cheat Sheets](./cheat-sheet-ui-helpers).
