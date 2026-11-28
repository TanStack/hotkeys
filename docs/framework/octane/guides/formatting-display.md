---
title: Displaying Hotkeys in Your Octane UI
id: formatting-display
description: Format Octane hotkeys as platform-appropriate labels and keycaps, such as ⌘ S on macOS and Ctrl+S on Windows, for menus, buttons, and cheat sheets.
---

Format hotkeys for display whenever they appear in buttons, menus, tooltips, cheat sheets, or settings screens. Store the raw hotkey string (such as `'Mod+S'`) and format it at render time. Labels are for humans, never for registering or storing.

`useFormatForDisplay` returns a formatter that adapts to the user's operating system (`⌘ S` on macOS, `Ctrl+S` elsewhere) and keyboard layout:

| Where labels render | Extra setup |
| --- | --- |
| Browser-only (Vite SPA, client apps) | None |
| Server-rendered then hydrated | Set `platform` on `HotkeysProvider` from the request ([SSR & Hydration](./ssr#format-labels-in-server-rendered-apps)) |
| Static or prerendered pages | None, or wrap in a client-only component ([Static pages](./ssr#static-and-prerendered-pages)) |

## Format a hotkey

Call `useFormatForDisplay()` at the top level of a component, then call the returned function wherever shortcuts render:

```tsx
import { useFormatForDisplay } from '@tanstack/octane-hotkeys'

function SaveButton() @{
  const formatForDisplay = useFormatForDisplay()

  <button>
    Save <kbd>{formatForDisplay('Mod+S')}</kbd>
  </button>
}
```

The hook wires up the following automatically:

- **Platform.** Reads the nearest `HotkeysProvider`, or detects from `navigator` if there isn't one.
- **Keyboard layout.** For physical codes like `[KeyW]`, reads the user's keyboard layout in Chromium browsers.

Call the returned `formatForDisplay` function anywhere in the component, including inside `.map()` loops and conditionals. Pass a second argument to override the platform or formatting for one call:

```ts
formatForDisplay('Mod+S', { platform: 'mac' }) // '⌘ S'
formatForDisplay('Mod+[KeyS]', { platform: 'mac' }) // '⌘ S'
formatForDisplay({ code: 'KeyS', mod: true }, { platform: 'windows' }) // 'Ctrl+S'
formatForDisplay('Mod+[Digit2]', { platform: 'windows' }) // 'Ctrl+2'
```

How chords format:

- **macOS.** Uses symbols joined with spaces in Control, Option, Shift, Command order (`Mod+Shift+S` displays as `⇧ ⌘ S`, while the underlying hotkey stays `Mod+Shift+S`).
- **Windows and Linux.** Uses modifier names joined with `+` (`Ctrl+Shift+S`).
- **Physical codes.** Strips brackets and shortens prefixes (`KeyS` to `S`, `Digit2` to `2`), keeping readable numpad, punctuation, and ISO or JIS keycap legends (`[IntlBackslash]` shows `\`, `[IntlRo]` shows `\`, `[IntlYen]` shows `¥`).
- **Accepted inputs.** Accepts any chord, sequence, single key (`'Escape'`), or standalone modifier (`'Shift'`). For a raw key string from a `KeyboardEvent`, such as a held key outside the strict `Key` union, wrap it as `{ key }`.

## Render individual keycaps

Pass `parts: true` to receive an array of key strings instead of a joined label, which works well for styling individual `<kbd>` tags:

```ts
const saveHotkey = 'Mod+[KeyS]'
const parts = formatForDisplay(saveHotkey, { platform: 'mac', parts: true })
// ['⌘', 'S']
```

`parts: true` keeps literal `+` keys intact and ignores `separatorToken`. Note that passing a dynamic boolean for `parts` widens the return type to `string | string[]`.

## Format sequences

Pass a sequence array to format every step, separated by `sequenceSeparator` (a space by default):

```ts
formatForDisplay(['Mod+[KeyK]', 'C'], { platform: 'mac' }) // '⌘ K C'
formatForDisplay(['G', 'G'], { sequenceSeparator: ' → ' }) // 'G → G'
formatForDisplay(['Mod+[KeyK]', 'C'], { platform: 'mac', parts: true })
// [['⌘', 'K'], ['C']], one array of keycaps per step
```

To display in-progress steps as the user types a sequence, see [Show sequences in your UI](./sequences#show-sequences-in-your-ui).

## Choose symbols and separators

Customize modifier and key symbols (`useSymbols`) and separators (`separatorToken`, `sequenceSeparator`):

```ts
formatForDisplay('Shift+[ArrowUp]', {
  platform: 'mac',
  useSymbols: { modifiers: false, keys: true },
  parts: true,
}) // ['Shift', '↑']

formatForDisplay('Mod+[KeyS]', {
  platform: 'mac',
  useSymbols: false,
}) // 'Cmd+S'

formatForDisplay('Control++', {
  platform: 'windows',
  separatorToken: ' · ',
}) // 'Ctrl · +'
```

`useSymbols` accepts a boolean or `{ modifiers?, keys? }`. Omitted fields default to `true`, and `modifiers` affects macOS only because Windows and Linux always use text modifier names. Pass `''` to join parts directly, or `undefined` or `null` for platform defaults.

## Label physical keys for the user's keyboard

Physical bindings follow key position (`[KeyW]` is always the US W slot), which sits at `Z` on a French AZERTY keyboard. `useFormatForDisplay()` automatically resolves physical codes to the character printed on the user's layout where supported:

```tsx
import { useFormatForDisplay } from '@tanstack/octane-hotkeys'

function MoveUp() @{
  const formatForDisplay = useFormatForDisplay()
  // 'W' on QWERTY, 'Z' on AZERTY
  <kbd>{formatForDisplay('[KeyW]')}</kbd>
}
```

> [!IMPORTANT]
> **Browser support.** Keyboard layout detection (`navigator.keyboard.getLayoutMap()`) works only in **Chromium browsers** (Chrome and Edge). Firefox and Safari don't expose layout maps and fall back to US QWERTY labels (`W` or `Q`). Inside cross-origin iframes, Chromium also requires `allow="keyboard-map"`.

Good to know:

- The layout loads asynchronously when the first label mounts, so the initial or server render shows the US fallback before updating. Later components get the resolved map immediately.
- Only physical bindings (`[KeyQ]`) change. Logical bindings (`Mod+Q`) always show their character, and key matching or recording never depend on the layout map.
- The layout refreshes whenever the window regains focus, since browsers emit no layout-change event.

To draw your own layout-aware UI, such as an on-screen keyboard, call `useKeyboardLayout()`, which returns the loaded map (`code` to character) or `null`. To turn off browser layout detection altogether, pass `keyboardLayout: false` on `HotkeysProvider`:

```tsx
<HotkeysProvider defaultOptions={{ keyboardLayout: false }}>
  <App />
</HotkeysProvider>
```

### Supply your own layout

If your app already tracks a user's layout preference, pass any `Map`-like `{ get(code): string | undefined }` object as `layoutMap`, which overrides the browser map:

```ts
const layoutMap = new Map([['KeyQ', 'a']])

formatForDisplay('Mod+[KeyQ]', { platform: 'mac', layoutMap }) // '⌘ A'
formatForDisplay('Mod+Q', { platform: 'mac', layoutMap }) // '⌘ Q' (logical key unchanged)
```

Use `keyLabels` to customize display names by physical code or logical key name. It works on the server too, and overrides both `layoutMap` and built-in fallbacks:

```ts
formatForDisplay('Mod+[KeyQ]', {
  platform: 'mac',
  layoutMap,
  keyLabels: { KeyQ: 'Action' },
}) // '⌘ Action'
```

`keyLabels` wins over a layout entry, which wins over the fallback label. Layout entries get normal letter casing and key symbols, and missing or empty entries fall back. All of these options affect display only.

## Format for `aria-keyshortcuts`

`useFormatForAria()` returns a function that formats a hotkey for the [`aria-keyshortcuts`](https://w3c.github.io/aria/#aria-keyshortcuts) attribute so screen readers can announce it. It uses the same platform and keyboard layout as the display formatter. See [Accessibility](./accessibility#announce-shortcuts-to-screen-readers) for where to place the attribute.

```tsx
import {
  useFormatForAria,
  useFormatForDisplay,
  useHotkey,
} from '@tanstack/octane-hotkeys'

function SearchButton({ onSearch }: { onSearch: () => void }) @{
  useHotkey('Mod+K', onSearch)
  const formatForAria = useFormatForAria()
  const formatForDisplay = useFormatForDisplay()

  <button aria-keyshortcuts={formatForAria('Mod+K')}>
    Search <kbd>{formatForDisplay('Mod+K')}</kbd>
  </button>
}
```

The output uses the key names from the ARIA specification:

- **Modifiers.** `Mod` becomes `Meta` on macOS and `Control` elsewhere. Modifiers use `Control`, `Alt`, `Shift`, and `Meta` in that order before the key, so `Mod+Shift+P` formats as `Shift+Meta+P` on macOS.
- **Keys.** Keys use `KeyboardEvent.key` values (`K`, `/`, `Escape`, `ArrowUp`), with `Space` for the space bar and `Plus` for the plus key. A physical binding names the key at that position from the user's keyboard layout where the browser reports it, so `[KeyQ]` formats as `Q`, or `A` on a French AZERTY keyboard. A logical hotkey's punctuation stays as written, so `'?'` formats as `?` rather than the `Shift+/` you press on a US keyboard. The key that types `?` depends on the layout. For punctuation that takes `Shift` to type, pass your own `aria-keyshortcuts` value for the layout, or use a physical binding such as `Shift+[Slash]`, which also changes which key the hotkey matches.
- **No value.** Returns `undefined` for a multi-step sequence, a standalone modifier, an empty or `null` hotkey, or a physical code with no key name such as `[NumpadMemoryAdd]`, so Octane omits the attribute. ARIA has no syntax for multi-step sequences. The adapter's formatter also returns `undefined` while the hotkey can't fire, such as when it is disabled, its scope is suspended, character keys are suspended, or nothing has registered it, so a screen reader never announces a shortcut that doesn't work. The plain `formatForAria` function only formats.

For a control with two shortcuts, join both formatted values with a space, such as `Control+K /`.

## Server-side rendering

To render platform-accurate labels on the server without hydration mismatches or a Linux-label flash on macOS and Windows, pass `platform` to `HotkeysProvider` from the incoming request, or wrap labels in a client-only guard on static pages. See [SSR & Hydration](./ssr) for TanStack Start, Astro, custom server, and static page examples.

## Format outside a component

`useFormatForDisplay` is a hook, so it can't run in a test or a plain module. Call `formatForDisplay` directly and pass `platform` yourself:

```ts
import { formatForDisplay } from '@tanstack/octane-hotkeys'

formatForDisplay('Mod+S', { platform }) // '⌘ S' when platform is 'mac'
```

`formatForDisplay` doesn't read `HotkeysProvider` and uses only the `layoutMap` you pass. To feed it the browser layout outside Octane, call `loadKeyboardLayout()` and read `getKeyboardLayoutStore()`.

> [!NOTE]
> `formatForDisplay` is marked `@deprecated` on the Octane package so editor autocomplete nudges component code toward `useFormatForDisplay()`. Outside components, calling it directly is expected.

For `aria-keyshortcuts` outside a component, call `formatForAria` directly with `platform` and an optional `layoutMap`. For example, `formatForAria('Mod+S', { platform: 'mac' })` returns `'Meta+S'`. Like `formatForDisplay`, the plain export is marked `@deprecated`, so editors point component code to the adapter's formatter.

## Parse, compare, and store hotkeys

Use the core helpers for persistence, comparison, and validation:

```ts
import { normalizeHotkey, parseHotkey } from '@tanstack/octane-hotkeys'

const parsed = parseHotkey('Mod+[KeyS]', 'mac')
if (parsed.code !== undefined) {
  console.log(parsed.code) // 'KeyS' (parsed.key is undefined)
}
const stored = normalizeHotkey(parsed, 'mac') // 'Mod+[KeyS]'
```

- **Normalize before saving.** `parseHotkey` resolves `Mod` for a specific platform (`meta: true` on Mac). Pass that same platform to `normalizeHotkey` to restore `'Mod+...'` before saving bindings intended to use `Mod`. Store registerable hotkey strings, never formatted labels. Because normalizing on macOS turns `Meta+S` into `Mod+S`, keep the original registerable binding string if an explicit modifier must stay platform-specific.
- **Compare bindings.** `areHotkeysEqual(a, b)` checks semantic equality after resolving modifiers, so `'Mod+S'` equals `'Meta+S'` on macOS. `isHotkeySequence` narrows a `Hotkey` to a sequence, and `simplifyHotkey` unwraps a 1-step sequence into a chord.
- **Validate untrusted strings.** Pass hotkeys loaded from storage or user input to `validateHotkey`. It returns `{ valid, errors, warnings }`, where each issue includes:
  - `reason`, a machine-readable code such as `'unknown-modifier'`
  - `part`, the offending token
  - `step`, the zero-based step index (for sequences)

`validateHotkey` checks syntax only, so map `reason` codes to your own UI strings. To validate as users press keys, see [Validate and check conflicts](./custom-hotkey-recording#validate-and-check-conflicts).

Try these formatting options interactively in the [Astro example](../examples/useFormatForDisplay-astro), or see [Cheat Sheets](./cheat-sheet-ui-helpers) for rendering full shortcut lists.
