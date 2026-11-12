---
title: Displaying Hotkeys in Your Angular UI
id: formatting-display
description: Format Angular hotkeys as platform-appropriate labels and keycaps, such as ⌘ S on macOS and Ctrl+S on Windows, for menus, buttons, and cheat sheets.
---

Format a hotkey as a label whenever it appears in a menu, button, tooltip, cheat sheet, or shortcut settings panel. `injectFormatForDisplay` returns a function that formats chord strings, including physical ones such as `'Mod+[KeyS]'`, chord objects, parsed chords, and sequences. Store the hotkey itself, and format it when you render. A label is for reading, not for registering.

A label depends on the user's platform: `Mod+S` is `⌘ S` on macOS and `Ctrl+S` elsewhere. `injectFormatForDisplay` works wherever your labels render:

| Where labels render | What to set up |
| --- | --- |
| Only in the browser, such as an app without server rendering | Nothing |
| On the server, then hydrated | The provider's `platform`, set from the request. See [Format labels in server-rendered apps](#format-labels-in-server-rendered-apps) |
| In a static or prerendered page | Nothing, or a block that renders only in the browser. See [Static and prerendered pages](#static-and-prerendered-pages) |

## Format a hotkey

Call `injectFormatForDisplay` in an injection context, such as a field initializer. It returns the function that formats a hotkey:

```ts
import { Component } from '@angular/core'
import { injectFormatForDisplay } from '@tanstack/angular-hotkeys'

@Component({
  selector: 'app-save-button',
  template: `
    <button>
      Save <kbd>{{ formatForDisplay('Mod+S') }}</kbd>
    </button>
  `,
})
export class SaveButtonComponent {
  readonly formatForDisplay = injectFormatForDisplay()
}
```

The label is `⌘ S` on macOS and `Ctrl+S` on Windows and Linux. `injectFormatForDisplay` fills in two things for you:

- **The platform** from the nearest `provideHotkeys`, or the detected platform without one.
- **The user's keyboard layout**, for physical keys, in Chromium browsers. See [Label physical keys for the user's keyboard](#label-physical-keys-for-the-users-keyboard).

Inject it once, then call the function anywhere in the component, including in templates and in `computed`. Options go in its second argument. The examples in this guide pass `platform`, so each one has a single result:

```ts
formatForDisplay('Mod+S', { platform: 'mac' }) // '⌘ S'
formatForDisplay('Mod+[KeyS]', { platform: 'mac' }) // '⌘ S'
formatForDisplay({ code: 'KeyS', mod: true }, { platform: 'windows' }) // 'Ctrl+S'
formatForDisplay('Mod+[Digit2]', { platform: 'windows' }) // 'Ctrl+2'
```

The same label can stand for different hotkeys. `Mod+S` follows the character S, and `Mod+[KeyS]` follows the key in the S position. See [Match a key's position instead](../../../guides/sensible-defaults.md#match-a-keys-position-instead). Labels for positions shorten `KeyS` to `S` and `Digit2` to `2`, keep readable numpad labels, and reuse punctuation and special-key symbols. The extra ISO and JIS keys, which have no US key, use their keycap legends: `[IntlBackslash]` shows `\`, `[IntlRo]` shows `\`, and `[IntlYen]` shows `¥`. Formatting doesn't change the stored hotkey or guess the user's keyboard layout.

A `platform` you pass wins over the provider's. On macOS, the label joins modifier symbols with spaces. Windows and Linux use names joined with `+`. macOS orders modifiers as Control, Option, Shift, Command, so `Mod+Shift+S` displays as `⇧ ⌘ S`, while the hotkey itself stays `Mod+Shift+S`.

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

A position, such as `[KeyQ]`, has a fallback label for a US keyboard: `Q`. On a French AZERTY keyboard, that key is labeled A. Labels from `injectFormatForDisplay` follow the user's keyboard where the browser reports its layout:

```ts
import { Component } from '@angular/core'
import { injectFormatForDisplay } from '@tanstack/angular-hotkeys'

@Component({
  selector: 'app-move-up',
  // 'W' on QWERTY, 'Z' on AZERTY
  template: `<kbd>{{ formatForDisplay('[KeyW]') }}</kbd>`,
})
export class MoveUpComponent {
  readonly formatForDisplay = injectFormatForDisplay()
}
```

> [!IMPORTANT]
> **Layout labels work only in Chromium browsers**, such as Chrome and Edge. Firefox and Safari don't report the keyboard layout, so labels there keep the fallback. For `[KeyQ]`, a French AZERTY user sees `A` in Chrome and `Q` in Firefox. In a cross-origin iframe, Chromium browsers also refuse unless the frame has `allow="keyboard-map"`.

- **The layout loads after the first label renders.** The first render shows the fallback label, and so does server HTML. The label updates when the layout arrives, and later labels have it at once.
- **Only positions change.** Hotkeys that follow characters, such as `Mod+Q`, already show the right key. Matching and recording never use the layout.
- **The layout is read again when the window regains focus**, because browsers send no event when the user switches layouts.

`injectKeyboardLayout()` returns a signal of the loaded layout, or `null`, for labels you draw yourself, such as an on-screen keyboard. The layout maps each code to the character the key types without modifiers, such as `KeyQ` to `a`.

The layout comes from `navigator.keyboard.getLayoutMap()`. To never call it, set `keyboardLayout: false` in the provider's `defaultOptions`:

```ts
provideHotkeys({ defaultOptions: { keyboardLayout: false } })
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

## Format labels in server-rendered apps

The server doesn't know the user's platform. Without one, a label rendered on the server uses `'linux'`, so a Mac user gets `Ctrl+S` in the server's HTML and `⌘ S` once Angular hydrates the component. To render the right label from the start:

1. Read the request's `User-Agent` header on the server, and pass `detectPlatform(userAgent)` as the provider's `platform`.
2. Format labels with `injectFormatForDisplay()`. It reads the provider, so it uses the platform from step 1.

```ts
import { REQUEST, inject } from '@angular/core'
import { detectPlatform, provideHotkeys } from '@tanstack/angular-hotkeys'

provideHotkeys({
  defaultOptions: () => ({
    platform: detectPlatform(
      inject(REQUEST)?.headers.get('user-agent'),
    ),
  }),
})
```

```ts
import { Component } from '@angular/core'
import { injectFormatForDisplay } from '@tanstack/angular-hotkeys'

@Component({
  selector: 'app-toolbar',
  template: `
    <ul>
      @for (command of commands; track command.id) {
        <li>{{ command.name }} <kbd>{{ formatForDisplay(command.hotkey) }}</kbd></li>
      }
    </ul>
  `,
})
export class ToolbarComponent {
  // Call it in an injection context, such as a field initializer
  readonly formatForDisplay = injectFormatForDisplay()
}
```

Inject it once, then call the function anywhere, including in templates. The function reads the provider's `platform` each time it runs, so a template updates when the platform changes. A `platform` passed to the function wins over the provider's.

In the browser, `detectPlatform()` reads the browser's own `navigator`, so the server and the browser get the same platform for practically every user. The provider's `platform` is also the default platform for hotkeys and recorders inside it. The provider that holds `appHotkeys` also compares app hotkeys on its platform, such as for conflicts. An inner provider inherits it.

Without a provider `platform`, `injectFormatForDisplay` renders `'linux'` labels on the server. Mac users see `Ctrl+S` until Angular hydrates the component. Set the provider's `platform` to avoid that.

The provider must run on the server too, so provide it where the request is available, as shown for each framework below.

Pages rendered this way depend on the request's `User-Agent` header. If a CDN or another shared cache stores them, it can serve one user's labels, and the platform that `Mod` resolves to, to other users. Keep these pages out of shared caches, or add the platform to the cache key. `Vary: User-Agent` also works, but it splits the cache into many small entries.

### Angular SSR

The `REQUEST` token from `@angular/core` is the current request on the server and `null` in the browser. Without a user agent, `detectPlatform` reads the browser's `navigator`, so the same provider works on both sides. Add it to the application config that the browser and server configs share:

```ts
// src/app/app.config.ts
import { REQUEST, inject } from '@angular/core'
import type { ApplicationConfig } from '@angular/core'
import { provideClientHydration } from '@angular/platform-browser'
import { detectPlatform, provideHotkeys } from '@tanstack/angular-hotkeys'

export const appConfig: ApplicationConfig = {
  providers: [
    provideClientHydration(),
    provideHotkeys({
      defaultOptions: () => ({
        platform: detectPlatform(
          inject(REQUEST)?.headers.get('user-agent'),
        ),
      }),
    }),
  ],
}
```

`REQUEST` is also `null` when a route is prerendered. See [Static and prerendered pages](#static-and-prerendered-pages).

The [Angular SSR example](../examples/injectFormatForDisplay-angular-ssr) shows this setup.

### Analog

`injectRequest()` from `@analogjs/router/tokens` returns the server's request on the server and `null` in the browser. The request is a Node.js request, so read the header from `headers`:

```ts
// src/app/app.config.ts
import type { ApplicationConfig } from '@angular/core'
import { injectRequest } from '@analogjs/router/tokens'
import { detectPlatform, provideHotkeys } from '@tanstack/angular-hotkeys'

export const appConfig: ApplicationConfig = {
  providers: [
    // ...your other providers
    provideHotkeys({
      defaultOptions: () => ({
        platform: detectPlatform(injectRequest()?.headers['user-agent']),
      }),
    }),
  ],
}
```

The [Analog example](../examples/injectFormatForDisplay-analog) shows this setup.

### Render a label only in the browser

To skip server rendering for a label instead, render it in a `@defer` block. On the server, Angular renders only the block's `@placeholder`. Without a provider `platform`, the function from `injectFormatForDisplay` detects the platform in the browser:

```ts
import { Component } from '@angular/core'
import { injectFormatForDisplay } from '@tanstack/angular-hotkeys'

@Component({
  selector: 'app-save-button',
  template: `
    <button (click)="save()">
      Save
      @defer (on immediate) {
        <kbd>{{ formatForDisplay('Mod+S') }}</kbd>
      } @placeholder {
        <kbd>&nbsp;</kbd>
      }
    </button>
  `,
})
export class SaveButtonComponent {
  readonly formatForDisplay = injectFormatForDisplay()

  save() {
    // ...
  }
}
```

To set a label from code instead, store it in a signal and set it in `afterNextRender`, which runs only in the browser. Don't switch templates with `isPlatformBrowser`: the server and the browser then render different content, which breaks hydration. A placeholder with the label's width keeps the layout from shifting.

### Static and prerendered pages

A page rendered at build time has no request and no user, so `injectFormatForDisplay` can't know the platform. This includes routes with `RenderMode.Prerender` in `app.routes.server.ts`, and Analog's prerendered routes. Without a provider `platform`, `injectFormatForDisplay` shows `'linux'` labels until Angular hydrates the component, then switches. To show nothing until then, render the labels only in the browser, as above. To render labels for each user instead, set the route's render mode to `RenderMode.Server`.

### Development warning

In development, formatting a label on the server without a platform logs a warning once, because users on macOS and Windows would get a `'linux'` label first. The warning names the missing setting. It isn't included in production builds.

## Format outside an injection context

`injectFormatForDisplay` calls `inject`, so it needs an injection context, such as a field initializer or a constructor. Some code that builds labels has none, such as code at the top level of a module, or a test without `TestBed`. There, call the plain `formatForDisplay` function and pass the platform yourself:

```ts
import { formatForDisplay } from '@tanstack/angular-hotkeys'

formatForDisplay('Mod+S', { platform }) // '⌘ S' when platform is 'mac'
```

The plain function takes the same options as the function from `injectFormatForDisplay`. It doesn't read the provider, and it uses only the `layoutMap` you pass. Without a `platform`, it detects one in the browser and uses `'linux'` on a server. To give it the user's layout, call `loadKeyboardLayout()` in the browser, and read the layout from `getKeyboardLayoutStore()`.

The export is marked deprecated so that your editor points component code to `injectFormatForDisplay`. Outside an injection context, it is the function to use.

## Parse, compare, and store hotkeys

`parseHotkey` returns each chord's key, as either a logical `key` or a physical `code`, plus its modifiers with `Mod` resolved. Check which one you have before reading it:

```ts
import { normalizeHotkey, parseHotkey } from '@tanstack/angular-hotkeys'

const parsed = parseHotkey('Mod+[KeyS]', 'mac')
if (parsed.code !== undefined) {
  console.log(parsed.code) // 'KeyS'; parsed.key is undefined
}
const stored = normalizeHotkey(parsed, 'mac') // 'Mod+[KeyS]'
```

A parsed chord's modifiers are already resolved for one platform. To store it as a hotkey that works on every platform, normalize it with that same platform, as above. `normalizeHotkey` also accepts chord strings, chord objects, and sequences. Store hotkeys, never display labels. [Write a chord as a string or an object](./hotkeys#write-a-chord-as-a-string-or-an-object) covers the forms a hotkey can take.

`areHotkeysEqual(a, b)` compares chords or sequences after resolving modifiers, so `Mod+S` equals `Meta+S` on macOS. Sequences compare step by step. `isHotkeySequence` narrows a `Hotkey` to a sequence, and `simplifyHotkey` turns a one-step sequence into its chord.

Use `validateHotkey` when you accept a hotkey from somewhere else, such as a settings file. It returns `valid`, `errors`, and `warnings`. Each error or warning has a `reason` code, such as `'unknown-modifier'`, the `part` it's about, and for a sequence, the index of the `step`. The library sends no text, so write your own messages for users. The devtools describe each problem in the details of a hotkey. It can't promise that the browser or operating system delivers the shortcut. To check hotkeys as users record them, see [Validate and check conflicts](./custom-hotkey-recording#validate-and-check-conflicts).

Try these options together with the format toggles in the [server-rendered cheat sheet example](../examples/injectFormatForDisplay-angular-ssr). For a full list of your app's shortcuts, see [Cheat Sheet UI Helpers](./cheat-sheet-ui-helpers).
