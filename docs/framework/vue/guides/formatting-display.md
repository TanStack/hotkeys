---
title: Displaying Hotkeys in Your Vue UI
id: formatting-display
description: Format Vue hotkeys as platform-appropriate labels and keycaps, such as ⌘ S on macOS and Ctrl+S on Windows, for menus, buttons, and cheat sheets.
---

Format hotkeys for display whenever they appear in buttons, menus, tooltips, cheat sheets, or settings screens. Store the raw hotkey (such as `'Mod+S'`) and format it at render time. Labels are for humans, never for registering or storing.

`useFormatForDisplay` returns a formatter that adapts to the user's operating system (`⌘ S` on macOS, `Ctrl+S` elsewhere) and keyboard layout. It formats chord strings, physical chords such as `'Mod+[KeyS]'`, chord objects, parsed chords, and sequences:

| Where labels render | Extra setup |
| --- | --- |
| Browser-only (Vite SPA, client apps) | None |
| Server-rendered then hydrated | Set `platform` on `HotkeysProvider` from the request ([SSR & Hydration](./ssr#format-labels-in-server-rendered-apps)) |
| Static or prerendered pages | Wrap labels in a client-only component ([Static pages](./ssr#static-and-prerendered-pages)) |

## Format a hotkey

Call `useFormatForDisplay` in `setup` or `<script setup>`. It returns the function that formats a hotkey:

```vue
<script setup lang="ts">
import { useFormatForDisplay } from '@tanstack/vue-hotkeys'

const formatForDisplay = useFormatForDisplay()
</script>

<template>
  <button>
    Save <kbd>{{ formatForDisplay('Mod+S') }}</kbd>
  </button>
</template>
```

The label is `⌘ S` on macOS and `Ctrl+S` on Windows and Linux. The composable fills in the following for you:

- **Platform.** Reads the nearest `HotkeysProvider`, or detects it from `navigator` when there is none.
- **Keyboard layout.** For physical codes such as `[KeyW]`, reads the user's keyboard layout in Chromium browsers. See [Label physical keys for the user's keyboard](#label-physical-keys-for-the-users-keyboard).

Call the composable once, then call the function anywhere, including in templates, loops, and computed properties. Options go in its second argument. The examples in this guide pass `platform`, so each one has a single result:

```ts
formatForDisplay('Mod+S', { platform: 'mac' }) // '⌘ S'
formatForDisplay('Mod+[KeyS]', { platform: 'mac' }) // '⌘ S'
formatForDisplay({ code: 'KeyS', mod: true }, { platform: 'windows' }) // 'Ctrl+S'
formatForDisplay('Mod+[Digit2]', { platform: 'windows' }) // 'Ctrl+2'
```

How chords format:

- **macOS.** Uses symbols joined with spaces in Control, Option, Shift, Command order, so `Mod+Shift+S` displays as `⇧ ⌘ S` while the hotkey itself stays `Mod+Shift+S`.
- **Windows and Linux.** Uses modifier names joined with `+`, such as `Ctrl+Shift+S`.
- **Physical codes.** Strips brackets and shortens prefixes (`KeyS` to `S`, `Digit2` to `2`), keeping readable numpad, punctuation, and ISO or JIS keycap legends (`[IntlBackslash]` shows `\`, `[IntlRo]` shows `\`, `[IntlYen]` shows `¥`).
- **Accepted inputs.** Accepts any chord, sequence, single key such as `'Escape'`, or standalone modifier such as `'Shift'`. For a raw key string from a `KeyboardEvent`, such as a held key outside the strict `Key` union, wrap it as `{ key }`.

A `platform` you pass wins over the provider's. `Mod+S` follows the character S, while `Mod+[KeyS]` follows the key in the S position. See [Match a key's position instead](../../../guides/sensible-defaults.md#match-a-keys-position-instead). Formatting never changes the stored hotkey or guesses the user's keyboard layout.

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

```vue
<script setup lang="ts">
import { useFormatForDisplay } from '@tanstack/vue-hotkeys'

const formatForDisplay = useFormatForDisplay()
</script>

<template>
  <!-- 'W' on QWERTY, 'Z' on AZERTY -->
  <kbd>{{ formatForDisplay('[KeyW]') }}</kbd>
</template>
```

> [!IMPORTANT]
> **Layout labels work only in Chromium browsers**, such as Chrome and Edge. Firefox and Safari don't report the keyboard layout, so labels there keep the fallback. For `[KeyQ]`, a French AZERTY user sees `A` in Chrome and `Q` in Firefox. In a cross-origin iframe, Chromium browsers also refuse unless the frame has `allow="keyboard-map"`.

- **The layout loads after the first label mounts.** The first render shows the fallback label, and so does server HTML. The label updates when the layout arrives, and later labels have it at once.
- **Only positions change.** Hotkeys that follow characters, such as `Mod+Q`, already show the right key. Matching and recording never use the layout.
- **The layout is read again when the window regains focus**, because browsers send no event when the user switches layouts.

`useKeyboardLayout()` returns a ref of the loaded layout, or `null`, for labels you draw yourself, such as an on-screen keyboard. The layout maps each code to the character the key types without modifiers, such as `KeyQ` to `a`.

The layout comes from `navigator.keyboard.getLayoutMap()`. To never call it, set `keyboardLayout: false` in the provider's `defaultOptions`:

```vue
<HotkeysProvider :default-options="{ keyboardLayout: false }">
  <App />
</HotkeysProvider>
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

`keyLabels` wins over a layout entry, which wins over the fallback label. Layout entries get normal letter casing and key symbols, and missing or empty entries fall back. All of these options affect display only. `keyLabels` works anywhere, including on the server.

## Format for `aria-keyshortcuts`

`useFormatForAria()` returns a function that formats a hotkey for the [`aria-keyshortcuts`](https://w3c.github.io/aria/#aria-keyshortcuts) attribute so screen readers can announce it. It uses the same platform and keyboard layout as the display formatter. See [Accessibility](./accessibility#announce-shortcuts-to-screen-readers) for where to place the attribute.

```vue
<script setup lang="ts">
import { useFormatForAria, useFormatForDisplay } from '@tanstack/vue-hotkeys'

const formatForAria = useFormatForAria()
const formatForDisplay = useFormatForDisplay()
</script>

<template>
  <button :aria-keyshortcuts="formatForAria('Mod+K')">
    Search <kbd>{{ formatForDisplay('Mod+K') }}</kbd>
  </button>
</template>
```

The output uses the key names from the ARIA specification:

- **Modifiers.** `Mod` becomes `Meta` on macOS and `Control` elsewhere. Modifiers use `Control`, `Alt`, `Shift`, and `Meta` in that order before the key, so `Mod+Shift+P` formats as `Shift+Meta+P` on macOS.
- **Keys.** Keys use `KeyboardEvent.key` values (`K`, `/`, `Escape`, `ArrowUp`), with `Space` for the space bar and `Plus` for the plus key. A physical binding names the key at that position from the user's keyboard layout where the browser reports it, so `[KeyQ]` formats as `Q`, or `A` on a French AZERTY keyboard. A logical hotkey's punctuation stays as written, so `'?'` formats as `?` rather than the `Shift+/` you press on a US keyboard. The key that types `?` depends on the layout. To name the key, bind it physically, such as `Shift+[Slash]`.
- **No value.** Returns `undefined` for a multi-step sequence, a standalone modifier, an empty or `null` hotkey, or a physical code with no key name such as `[NumpadMemoryAdd]`, so Vue omits the attribute. ARIA has no syntax for multi-step sequences.

For a control with two shortcuts, join both formatted values with a space, such as `Control+K /`.

## Server-side rendering

Pass `platform` to `HotkeysProvider` from the incoming request so the server renders the right labels, or wrap labels in a client-only guard on static pages. See [SSR & Hydration](./ssr) for Nuxt, Vite SSR, Astro, and static page examples.

## Format outside a component

`useFormatForDisplay` is a composable, so call it in a component's `setup`. Some code that builds labels isn't a component, such as a test or a plain module. There, call the plain `formatForDisplay` function and pass the platform yourself:

```ts
import { formatForDisplay } from '@tanstack/vue-hotkeys'

formatForDisplay('Mod+S', { platform }) // '⌘ S' when platform is 'mac'
```

The plain function takes the same options as the function from the composable. It doesn't read the provider, and it uses only the `layoutMap` you pass. Without a `platform`, it detects one in the browser and uses `'linux'` on a server. To give it the user's layout, call `loadKeyboardLayout()` in the browser, and read the layout from `getKeyboardLayoutStore()`.

> [!NOTE]
> `formatForDisplay` is marked `@deprecated` so editor autocomplete nudges component code toward `useFormatForDisplay`. Outside components, calling it directly is expected.

For `aria-keyshortcuts` outside a component, call `formatForAria` directly with `platform` and an optional `layoutMap`. For example, `formatForAria('Mod+S', { platform: 'mac' })` returns `'Meta+S'`. Like `formatForDisplay`, the plain export is marked `@deprecated`, so editors point component code to the adapter's formatter.

## Parse, compare, and store hotkeys

`parseHotkey` returns each chord's key, as either a logical `key` or a physical `code`, plus its modifiers with `Mod` resolved. Check which one is present before reading it:

```ts
import { normalizeHotkey, parseHotkey } from '@tanstack/vue-hotkeys'

const parsed = parseHotkey('Mod+[KeyS]', 'mac')
if (parsed.code !== undefined) {
  console.log(parsed.code) // 'KeyS'; parsed.key is undefined
}
const stored = normalizeHotkey(parsed, 'mac') // 'Mod+[KeyS]'
```

- **Normalize before saving.** `parseHotkey` resolves `Mod` for a specific platform (`meta: true` on macOS). Pass that same platform to `normalizeHotkey` to restore `'Mod+...'` before saving bindings intended to use `Mod`. Store registerable hotkey strings, never formatted labels. See [Write a chord as a string or an object](./hotkeys#write-a-chord-as-a-string-or-an-object) for the forms a hotkey can take. Because normalizing on macOS turns `Meta+S` into `Mod+S`, keep the original registerable binding string if an explicit modifier must stay platform-specific.
- **Compare bindings.** `areHotkeysEqual(a, b)` checks semantic equality after resolving modifiers, so `'Mod+S'` equals `'Meta+S'` on macOS. `isHotkeySequence` narrows a `Hotkey` to a sequence, and `simplifyHotkey` unwraps a one-step sequence into a chord.
- **Validate untrusted strings.** Pass hotkeys loaded from storage or user input to `validateHotkey`. It returns `{ valid, errors, warnings }`, where each issue includes:
  - `reason`, a machine-readable code such as `'unknown-modifier'`
  - `part`, the offending token
  - `step`, the zero-based step index for sequences

`validateHotkey` checks syntax only and can't promise that the browser or operating system delivers the shortcut, so map `reason` codes to your own UI strings. To validate as users press keys, see [Validate and check conflicts](./custom-hotkey-recording#validate-and-check-conflicts).

Try these options together with the format toggles in the [server-rendered cheat sheet example](../examples/useFormatForDisplay-nuxt). For a full list of your app's shortcuts, see [Cheat Sheets](./cheat-sheet-ui-helpers).
