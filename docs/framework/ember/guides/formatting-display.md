---
title: Displaying Hotkeys in Your Ember UI
id: formatting-display
description: Format Ember hotkeys as platform-appropriate labels and keycaps, such as ⌘ S on macOS and Ctrl+S on Windows, for menus, buttons, and cheat sheets.
---

Use `formatForDisplay` whenever a hotkey appears in a menu, button, tooltip, cheat sheet, or shortcut settings panel. It accepts chord strings, including physical ones such as `'Mod+[KeyS]'`, chord objects, parsed chords, and sequences. Store the hotkey itself, and format it when you render. A label is for reading, not for registering.

A label depends on the user's platform: `Mod+S` is `⌘ S` on macOS and `Ctrl+S` elsewhere. Pick the API by where your labels render:

| Where labels render | Use |
| --- | --- |
| Only in the browser | `formatForDisplay(hotkey)` |
| On the server with FastBoot | `useFormatForDisplay(scope)`, with the scope's `platform` set from the request. See [Format labels in server-rendered apps](#format-labels-in-server-rendered-apps) |
| In a page prerendered with Prember | `formatForDisplay` in a block that skips FastBoot. See [Static and prerendered pages](#static-and-prerendered-pages) |
| Anywhere, for a platform you already know | `formatForDisplay(hotkey, { platform })` |

## Format a hotkey

```ts
import { formatForDisplay } from '@tanstack/ember-hotkeys'

formatForDisplay('Mod+S', { platform: 'mac' }) // '⌘ S'
formatForDisplay('Mod+[KeyS]', { platform: 'mac' }) // '⌘ S'
formatForDisplay({ code: 'KeyS', mod: true }, { platform: 'windows' }) // 'Ctrl+S'
formatForDisplay('Mod+[Digit2]', { platform: 'windows' }) // 'Ctrl+2'
```

The same label can stand for different hotkeys. `Mod+S` follows the character S, and `Mod+[KeyS]` follows the key in the S position. See [Match a key's position instead](../../../guides/sensible-defaults.md#match-a-keys-position-instead). Labels for positions shorten `KeyS` to `S` and `Digit2` to `2`, keep readable numpad labels, and reuse punctuation and special-key symbols. Formatting doesn't change the stored hotkey or guess the user's keyboard layout.

Omit `platform` to detect it in the browser. On macOS, the label joins modifier symbols with spaces. Windows and Linux use names joined with `+`. macOS orders modifiers as Control, Option, Shift, Command, so `Mod+Shift+S` displays as `⇧ ⌘ S`, while the hotkey itself stays `Mod+Shift+S`.

`formatForDisplay` accepts hotkeys only, including single keys such as `'Escape'` and modifiers on their own such as `'Shift'`. A key from a `KeyboardEvent`, such as a held key, can be outside the key types: pass it as `{ key }`.

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

## Supply layout labels

A position, such as `[KeyQ]`, gets a fallback label that may differ from the character printed on the user's keyboard. Pass an already-resolved `layoutMap` to label positions for a known layout:

```ts
const layoutMap = new Map([['KeyQ', 'a']])

formatForDisplay('Mod+[KeyQ]', { platform: 'mac', layoutMap }) // '⌘ A'
formatForDisplay('Mod+Q', { platform: 'mac', layoutMap }) // '⌘ Q'
```

Any object with `get(code): string | undefined` works, including a browser `KeyboardLayoutMap`. Formatting stays synchronous. Your app owns loading, errors, and refreshing the map: render fallback labels while it loads, then pass the resolved map on the next render. The library never requests it. Hotkeys that follow characters ignore `layoutMap`.

Use `keyLabels` for your own labels, keyed by physical code or by key name:

```ts
formatForDisplay('Mod+[KeyQ]', {
  platform: 'mac', layoutMap, keyLabels: { KeyQ: 'Action' },
}) // '⌘ Action'
```

`keyLabels` wins over a layout entry, which wins over the fallback label. Layout entries get normal letter casing and key symbols, and missing or empty entries fall back. All of these options affect display only.

The browser's `KeyboardLayoutMap` exists only in the browser, and it loads after the app boots. In a FastBoot app, render fallback labels first and pass the map once it loads, as above. `keyLabels` works anywhere, including in FastBoot.

## Format labels in server-rendered apps

The server doesn't know the user's platform. Without one, a label rendered in FastBoot uses `'linux'`, so a Mac user gets `Ctrl+S` in the server's HTML and `⌘ S` once the app boots in the browser. To render the right label from the start:

1. Read the request's `User-Agent` header from the `fastboot` service, and pass `detectPlatform(userAgent)` as the `platform` of a `createHotkeysScope` scope.
2. Format labels with `useFormatForDisplay(scope)` instead of `formatForDisplay`.

Create the scope in a component near the top of your app, such as the one your application template renders:

```gts
// app/components/app-shell.gts
import Component from '@glimmer/component'
import { service } from '@ember/service'
import { createHotkeysScope, detectPlatform } from '@tanstack/ember-hotkeys'
import Toolbar from './toolbar'

// ember-cli-fastboot doesn't ship types, so declare the part you use
interface FastBootService {
  request: { headers: { get(name: string): string | null } } | null
}

export default class AppShell extends Component {
  @service declare fastboot: FastBootService

  hotkeys = createHotkeysScope({
    platform: detectPlatform(
      this.fastboot.request?.headers.get('user-agent') ?? undefined,
    ),
  })

  <template>
    <Toolbar @hotkeys={{this.hotkeys}} />
  </template>
}
```

```gts
// app/components/toolbar.gts
import Component from '@glimmer/component'
import { useFormatForDisplay } from '@tanstack/ember-hotkeys'
import type { EmberHotkeysScope, Hotkey } from '@tanstack/ember-hotkeys'

const commands: Array<{ name: string; hotkey: Hotkey }> = [
  { name: 'Save', hotkey: 'Mod+S' },
  { name: 'Search', hotkey: 'Mod+K' },
]

interface ToolbarSignature {
  Args: { hotkeys: EmberHotkeysScope }
}

export default class Toolbar extends Component<ToolbarSignature> {
  format = useFormatForDisplay(this.args.hotkeys)

  <template>
    <ul>
      {{#each commands as |command|}}
        <li>{{command.name}} <kbd>{{this.format command.hotkey}}</kbd></li>
      {{/each}}
    </ul>
  </template>
}
```

`useFormatForDisplay` returns a function with the same options as `formatForDisplay`, and templates can call it as a helper. It reads the scope's `platform` each time it formats, so labels update when the scope's defaults change. A `platform` passed to the function wins over the scope's. Without a scope, it works like `formatForDisplay`.

In the browser, `fastboot.request` is `null`, so `detectPlatform()` reads the browser's `navigator`. The server and the browser get the same platform for practically every user. The scope's `platform` is also the default platform for the hotkeys and recorders that use the scope. Pass the scope to child components, such as `@hotkeys={{this.hotkeys}}`, so their labels use the same platform.

Without a scope `platform`, `useFormatForDisplay` renders `'linux'` labels in FastBoot. By default, the app replaces the server's HTML when it boots in the browser, so the labels then switch to the browser's platform. Mac users see `Ctrl+S` until the app boots. Set the scope's `platform` to avoid that.

### Render a label only in the browser

To leave a label out of the server's HTML instead, check the `fastboot` service's `isFastBoot`. In the browser, plain `formatForDisplay` detects the platform:

```gts
import Component from '@glimmer/component'
import { service } from '@ember/service'
import { formatForDisplay } from '@tanstack/ember-hotkeys'

interface FastBootService {
  isFastBoot: boolean
}

export default class SaveShortcut extends Component {
  @service declare fastboot: FastBootService

  <template>
    {{#if this.fastboot.isFastBoot}}
      <kbd>&nbsp;</kbd>
    {{else}}
      <kbd>{{formatForDisplay 'Mod+S'}}</kbd>
    {{/if}}
  </template>
}
```

`isFastBoot` is `true` only while the app renders in FastBoot. A placeholder with the label's width keeps the layout from shifting.

### Static and prerendered pages

Prember renders pages with FastBoot at build time. A page rendered at build time has no request and no user, so neither `formatForDisplay` nor `useFormatForDisplay` can know the platform. The scope recipe above gets `'linux'` there, because the build sends no `User-Agent` header. Render platform-specific labels only in the browser, as above. `useFormatForDisplay` without a scope `platform` also works: it shows `'linux'` labels until the app boots, then switches.

### Development warning

In development, formatting a label in FastBoot without a platform logs a warning once. Without a platform, FastBoot renders `'linux'` labels, so users on macOS and Windows get a different label once the app boots. If you develop on Linux, you won't see the problem yourself. The warning isn't included in production builds.

## Parse, compare, and store hotkeys

`parseHotkey` returns each chord's key, as either a logical `key` or a physical `code`, plus its modifiers with `Mod` resolved. Check which one you have before reading it:

```ts
import { formatForDisplay, normalizeHotkey, parseHotkey } from '@tanstack/ember-hotkeys'

const parsed = parseHotkey('Mod+[KeyS]', 'mac')
if (parsed.code !== undefined) {
  console.log(parsed.code) // 'KeyS'; parsed.key is undefined
}
const stored = normalizeHotkey(parsed, 'mac') // 'Mod+[KeyS]'
formatForDisplay(stored, { platform: 'windows' }) // 'Ctrl+S'
```

A parsed chord's modifiers are already resolved for one platform. To store it as a hotkey that works on every platform, normalize it with that same platform, as above. `normalizeHotkey` also accepts chord strings, chord objects, and sequences. Store hotkeys, never display labels. [Write a chord as a string or an object](./hotkeys#write-a-chord-as-a-string-or-an-object) covers the forms a hotkey can take.

`areHotkeysEqual(a, b)` compares chords or sequences after resolving modifiers, so `Mod+S` equals `Meta+S` on macOS. Sequences compare step by step. `isHotkeySequence` narrows a `Hotkey` to a sequence, and `simplifyHotkey` turns a one-step sequence into its chord.

Use `validateHotkey` when you accept a hotkey from somewhere else, such as a settings file. It returns `valid`, `errors`, and `warnings`, and names the failing step of a sequence. It can't promise that the browser or operating system delivers the shortcut. To check hotkeys as users record them, see [Validate and check conflicts](./custom-hotkey-recording#validate-and-check-conflicts).

Try these options together in the [vanilla formatter playground](../../../framework/vanilla/examples/formatForDisplay). For a full list of your app's shortcuts, see [Cheat Sheet UI Helpers](./cheat-sheet-ui-helpers).
