---
title: Displaying Hotkeys in Your Ember UI
id: formatting-display
description: Format Ember hotkeys as platform-appropriate labels and keycaps, such as ⌘ S on macOS and Ctrl+S on Windows, for menus, buttons, and cheat sheets.
---

Format a hotkey as a label whenever it appears in a menu, button, tooltip, cheat sheet, or shortcut settings panel. `useFormatForDisplay` returns a function that formats chord strings, including physical ones such as `'Mod+[KeyS]'`, chord objects, parsed chords, and sequences. Store the hotkey itself, and format it when you render. A label is for reading, not for registering.

A label depends on the user's platform: `Mod+S` is `⌘ S` on macOS and `Ctrl+S` elsewhere. `useFormatForDisplay` works wherever your labels render:

| Where labels render | What to set up |
| --- | --- |
| Only in the browser | Nothing |
| On the server with FastBoot | A scope's `platform`, set from the request. See [Format labels in server-rendered apps](#format-labels-in-server-rendered-apps) |
| In a page prerendered with Prember | Nothing, or a block that skips FastBoot. See [Static and prerendered pages](#static-and-prerendered-pages) |

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

The label is `⌘ S` on macOS and `Ctrl+S` on Windows and Linux. The utility fills in two things for you:

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

## Format labels in server-rendered apps

The server doesn't know the user's platform. Without one, a label rendered in FastBoot uses `'linux'`, so a Mac user gets `Ctrl+S` in the server's HTML and `⌘ S` once the app boots in the browser. To render the right label from the start:

1. Read the request's `User-Agent` header from the `fastboot` service, and pass `detectPlatform(userAgent)` as the `platform` of a `createHotkeysScope` scope.
2. Format labels with `useFormatForDisplay(scope)`. It reads the scope, so it uses the platform from step 1.

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
      this.fastboot.request?.headers.get('user-agent'),
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
  formatForDisplay = useFormatForDisplay(this.args.hotkeys)

  <template>
    <ul>
      {{#each commands as |command|}}
        <li>{{command.name}} <kbd>{{this.formatForDisplay command.hotkey}}</kbd></li>
      {{/each}}
    </ul>
  </template>
}
```

Call the utility once in a class field, then call the function anywhere, including in the template's loops and conditions. It reads the scope's `platform` each time it formats, so labels update when the scope's defaults change. A `platform` passed to the function wins over the scope's.

In the browser, `fastboot.request` is `null`, so `detectPlatform()` reads the browser's `navigator`. The server and the browser get the same platform for practically every user. The scope's `platform` is also the default platform for the hotkeys and recorders that use the scope. Pass the scope to child components, such as `@hotkeys={{this.hotkeys}}`, so their labels use the same platform.

Without a scope `platform`, `useFormatForDisplay` renders `'linux'` labels in FastBoot. By default, the app replaces the server's HTML when it boots in the browser, so the labels then switch to the browser's platform. Mac users see `Ctrl+S` until the app boots. Set the scope's `platform` to avoid that.

Pages rendered this way depend on the request's `User-Agent` header. If a CDN or another shared cache stores them, it can serve one user's labels, and the platform that `Mod` resolves to, to other users. Keep these pages out of shared caches, or add the platform to the cache key. `Vary: User-Agent` also works, but it splits the cache into many small entries.

### Render a label only in the browser

To leave a label out of the server's HTML instead, check the `fastboot` service's `isFastBoot`. A label that first renders in the browser gets the browser's platform from `useFormatForDisplay` at once:

```gts
import Component from '@glimmer/component'
import { service } from '@ember/service'
import { useFormatForDisplay } from '@tanstack/ember-hotkeys'

interface FastBootService {
  isFastBoot: boolean
}

export default class SaveShortcut extends Component {
  @service declare fastboot: FastBootService

  formatForDisplay = useFormatForDisplay()

  <template>
    {{#if this.fastboot.isFastBoot}}
      <kbd>&nbsp;</kbd>
    {{else}}
      <kbd>{{this.formatForDisplay 'Mod+S'}}</kbd>
    {{/if}}
  </template>
}
```

`isFastBoot` is `true` only while the app renders in FastBoot. A placeholder with the label's width keeps the layout from shifting.

### Static and prerendered pages

Prember renders pages with FastBoot at build time. A page rendered at build time has no request and no user, so `useFormatForDisplay` can't know the platform. The scope recipe above gets `'linux'` there, because the build sends no `User-Agent` header. Without a scope `platform`, `useFormatForDisplay` shows `'linux'` labels until the app boots, then switches. To show nothing until then, render the labels only in the browser, as above.

### Development warning

In development, formatting a label in FastBoot without a platform logs a warning once. Without a platform, FastBoot renders `'linux'` labels, so users on macOS and Windows get a different label once the app boots. If you develop on Linux, you won't see the problem yourself. The warning isn't included in production builds.

## Format outside a component

`useFormatForDisplay` is made for components: its function reads tracked state, and loads the keyboard layout after a render. Some code that builds labels isn't a component, such as a test or a plain module. There, call the plain `formatForDisplay` function and pass the platform yourself:

```ts
import { formatForDisplay } from '@tanstack/ember-hotkeys'

formatForDisplay('Mod+S', { platform }) // '⌘ S' when platform is 'mac'
```

The plain function takes the same options as the function from the utility. It doesn't read a scope, and it uses only the `layoutMap` you pass. Without a `platform`, it detects one in the browser and uses `'linux'` on a server. To give it the user's layout, call `loadKeyboardLayout()` in the browser, and read the layout from `getKeyboardLayoutStore()`.

The export is marked deprecated so that your editor points component code to the utility. Outside a component, it is the function to use.

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

A parsed chord's modifiers are already resolved for one platform. To store it as a hotkey that works on every platform, normalize it with that same platform, as above. `normalizeHotkey` also accepts chord strings, chord objects, and sequences. Store hotkeys, never display labels. [Write a chord as a string or an object](./hotkeys#write-a-chord-as-a-string-or-an-object) covers the forms a hotkey can take.

`areHotkeysEqual(a, b)` compares chords or sequences after resolving modifiers, so `Mod+S` equals `Meta+S` on macOS. Sequences compare step by step. `isHotkeySequence` narrows a `Hotkey` to a sequence, and `simplifyHotkey` turns a one-step sequence into its chord.

Use `validateHotkey` when you accept a hotkey from somewhere else, such as a settings file. It returns `valid`, `errors`, and `warnings`. Each error or warning has a `reason` code, such as `'unknown-modifier'`, the `part` it's about, and for a sequence, the index of the `step`. The library sends no text, so write your own messages for users. The devtools describe each problem in the details of a hotkey. It can't promise that the browser or operating system delivers the shortcut. To check hotkeys as users record them, see [Validate and check conflicts](./custom-hotkey-recording#validate-and-check-conflicts).

For a full list of your app's shortcuts, see [Cheat Sheet UI Helpers](./cheat-sheet-ui-helpers).
