---
title: Displaying Hotkeys in Your Preact UI
id: formatting-display
description: Format Preact hotkeys as platform-appropriate labels and keycaps, such as ⌘ S on macOS and Ctrl+S on Windows, for menus, buttons, and cheat sheets.
---

Use `formatForDisplay` whenever a hotkey appears in a menu, button, tooltip, cheat sheet, or shortcut settings panel. It accepts chord strings, including physical ones such as `'Mod+[KeyS]'`, chord objects, parsed chords, and sequences. Store the hotkey itself, and format it when you render. A label is for reading, not for registering.

A label depends on the user's platform: `Mod+S` is `⌘ S` on macOS and `Ctrl+S` elsewhere. Pick the API by where your labels render:

| Where labels render | Use |
| --- | --- |
| Only in the browser, such as a Vite single-page app | `formatForDisplay(hotkey)` |
| On the server, then hydrated | `useFormatForDisplay()`, with the provider's `platform` set from the request. See [Format labels in server-rendered apps](#format-labels-in-server-rendered-apps) |
| In a static or prerendered page | `formatForDisplay` inside a client-only wrapper. See [Static and prerendered pages](#static-and-prerendered-pages) |
| Anywhere, for a platform you already know | `formatForDisplay(hotkey, { platform })` |

## Format a hotkey

```ts
import { formatForDisplay } from '@tanstack/preact-hotkeys'

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

The browser's `KeyboardLayoutMap` exists only in the browser, and it loads after the page renders. In a server-rendered app, render fallback labels first and pass the map once it loads, as above. The first render then matches the server's HTML. `keyLabels` works anywhere, including on the server.

## Format labels in server-rendered apps

The server doesn't know the user's platform. Without one, a label rendered on the server uses `'linux'`, so a Mac user gets `Ctrl+S` in the server's HTML. When Preact hydrates, it replaces the label's text with `⌘ S`, so the label changes in front of the user. Preact doesn't update attributes during hydration, so a label in an attribute, such as a `title`, keeps `Ctrl+S`. To render the right label from the start:

1. Read the request's `User-Agent` header on the server, and pass `detectPlatform(userAgent)` as the provider's `platform`.
2. Format labels with `useFormatForDisplay()` instead of `formatForDisplay`.

```tsx
import { HotkeysProvider, detectPlatform } from '@tanstack/preact-hotkeys'

<HotkeysProvider defaultOptions={{ platform: detectPlatform(userAgent) }}>
  <App />
</HotkeysProvider>
```

```tsx
import { useFormatForDisplay } from '@tanstack/preact-hotkeys'

function Toolbar() {
  // Call it at the top of the component, like any hook
  const format = useFormatForDisplay()

  return (
    <ul>
      {commands.map((command) => (
        <li key={command.id}>
          {command.name} <kbd>{format(command.hotkey)}</kbd>
        </li>
      ))}
    </ul>
  )
}
```

`useFormatForDisplay` returns a function with the same options as `formatForDisplay`. Call the hook once at the top of the component, then call the function anywhere, including in loops and conditions. A `platform` passed to the function wins over the provider's.

In the browser, `detectPlatform()` reads the browser's own `navigator`, so the server and the browser get the same platform for practically every user. The provider's `platform` is also the default platform for hotkeys and recorders inside it. An inner provider inherits it.

Without a provider `platform`, `useFormatForDisplay` detects the platform the same way `formatForDisplay` does: `'linux'` on the server and the user's platform in the browser. It doesn't hold the server's label until hydration finishes, so the label changes as described above. Set the provider's `platform` in every server-rendered Preact app.

The provider must render on the server too, so wrap your app in it where the request is available, as shown for each framework below.

### Fresh

Each island hydrates as its own Preact app, so a provider outside the island exists only on the server. Render the provider inside the island, and pass the platform from the route. A route component receives the request as `req`:

```tsx
// routes/index.tsx
import { detectPlatform } from '@tanstack/preact-hotkeys'
import { define } from '../utils.ts'
import Shortcuts from '../islands/Shortcuts.tsx'

export default define.page(({ req }) => {
  const platform = detectPlatform(req.headers.get('user-agent'))

  return <Shortcuts platform={platform} />
})
```

```tsx
// islands/Shortcuts.tsx
import { HotkeysProvider } from '@tanstack/preact-hotkeys'
import type { HotkeyPlatform } from '@tanstack/preact-hotkeys'

export default function Shortcuts({ platform }: { platform: HotkeyPlatform }) {
  return (
    <HotkeysProvider defaultOptions={{ platform }}>
      <CheatSheet />
    </HotkeysProvider>
  )
}
```

Fresh serializes island props, so the platform reaches the browser with the page.

### Astro

Each Preact island is its own Preact app, so render the provider inside the island and pass the platform from the page. The page must render on demand to have a request: add `export const prerender = false`, or use `output: 'server'`.

```astro
---
// src/pages/index.astro
import { detectPlatform } from '@tanstack/preact-hotkeys'
import Shortcuts from '../components/Shortcuts'

export const prerender = false
const platform = detectPlatform(Astro.request.headers.get('user-agent'))
---

<Shortcuts client:load platform={platform} />
```

```tsx
// src/components/Shortcuts.tsx
import { HotkeysProvider } from '@tanstack/preact-hotkeys'
import type { HotkeyPlatform } from '@tanstack/preact-hotkeys'

export default function Shortcuts({ platform }: { platform: HotkeyPlatform }) {
  return (
    <HotkeysProvider defaultOptions={{ platform }}>
      <CheatSheet />
    </HotkeysProvider>
  )
}
```

The [Astro example](../examples/useFormatForDisplay-astro) shows this setup.

### Vite server rendering

Render your app with `preact-render-to-string` on the server, and pass the platform as a prop. In the browser, `detectPlatform()` returns the same platform, so `hydrate` gets the same props:

```tsx
// src/App.tsx
import { HotkeysProvider } from '@tanstack/preact-hotkeys'
import type { HotkeyPlatform } from '@tanstack/preact-hotkeys'

export function App({ platform }: { platform: HotkeyPlatform }) {
  return (
    <HotkeysProvider defaultOptions={{ platform }}>
      <Toolbar />
    </HotkeysProvider>
  )
}
```

```tsx
// src/entry-server.tsx
import { renderToString } from 'preact-render-to-string'
import { detectPlatform } from '@tanstack/preact-hotkeys'
import { App } from './App'

export function render(userAgent: string | undefined) {
  return renderToString(<App platform={detectPlatform(userAgent)} />)
}
```

```tsx
// src/entry-client.tsx
import { hydrate } from 'preact'
import { detectPlatform } from '@tanstack/preact-hotkeys'
import { App } from './App'

hydrate(<App platform={detectPlatform()} />, document.getElementById('app')!)
```

Your server calls `render` with the request's `User-Agent` header: `request.headers.get('user-agent')` for a Fetch API `Request`, or `req.headers['user-agent']` in Express.

The [Vite SSR example](../examples/useFormatForDisplay-vite-ssr) shows this setup.

### Render a label only in the browser

To skip server rendering for a label instead, render it after hydration. In the browser, plain `formatForDisplay` detects the platform:

```tsx
import { useEffect, useState } from 'preact/hooks'
import type { ComponentChildren } from 'preact'
import { formatForDisplay } from '@tanstack/preact-hotkeys'

function ClientOnly({ children, fallback = null }: { children: ComponentChildren; fallback?: ComponentChildren }) {
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => setHydrated(true), [])
  return <>{hydrated ? children : fallback}</>
}

<ClientOnly fallback={<kbd>&nbsp;</kbd>}>
  <kbd>{formatForDisplay('Mod+S')}</kbd>
</ClientOnly>
```

The server and the first browser render both show the fallback, so hydration matches. On an Astro island, `client:only="preact"` does the same for the whole island. Fresh's `IS_BROWSER` is already `true` while an island hydrates, so use the check above for labels instead. A fallback with the label's width keeps the layout from shifting.

### Static and prerendered pages

A page rendered at build time has no request and no user, so neither `formatForDisplay` nor `useFormatForDisplay` can know the platform. This includes Astro's default static output and any page you prerender with `preact-render-to-string`. Render platform-specific labels in a client-only wrapper, as above.

### Development warning

In development, formatting a label on the server without a platform logs a warning once. Without a platform, the server renders `'linux'` labels, so users on macOS and Windows get a different label after hydration. If you develop on Linux, you won't see the problem yourself. The warning names the missing setting. It isn't included in production builds.

## Parse, compare, and store hotkeys

`parseHotkey` returns each chord's key, as either a logical `key` or a physical `code`, plus its modifiers with `Mod` resolved. Check which one you have before reading it:

```ts
import { formatForDisplay, normalizeHotkey, parseHotkey } from '@tanstack/preact-hotkeys'

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

Try these options together with the format toggles in the [server-rendered cheat sheet example](../examples/useFormatForDisplay-astro). For a full list of your app's shortcuts, see [Cheat Sheet UI Helpers](./cheat-sheet-ui-helpers).
