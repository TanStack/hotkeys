---
title: Displaying Hotkeys in Your React UI
id: formatting-display
description: Format React hotkeys as platform-appropriate labels and keycaps, such as ⌘ S on macOS and Ctrl+S on Windows, for menus, buttons, and cheat sheets.
---

> [!NOTE]
> Showing hotkey labels on the page is one of the few parts of TanStack Hotkeys that needs extra care in server-rendered apps. The server doesn't know the user's operating system, so a label it renders can differ from the label the browser renders, which causes a hydration error. The library has helpers that prevent this. See [Format labels in server-rendered apps](#format-labels-in-server-rendered-apps).

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
import { formatForDisplay } from '@tanstack/react-hotkeys'

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

The server doesn't know the user's platform. Without one, a label rendered on the server uses `'linux'`, so a Mac user gets `Ctrl+S` in the server's HTML and `⌘ S` once React hydrates, with a hydration mismatch. To render the right label from the start:

1. Read the request's `User-Agent` header on the server, and pass `detectPlatform(userAgent)` as the provider's `platform`.
2. Format labels with `useFormatForDisplay()` instead of `formatForDisplay`.

```tsx
import { HotkeysProvider, detectPlatform } from '@tanstack/react-hotkeys'

<HotkeysProvider defaultOptions={{ platform: detectPlatform(userAgent) }}>
  <App />
</HotkeysProvider>
```

```tsx
import { useFormatForDisplay } from '@tanstack/react-hotkeys'

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

Without a provider `platform`, `useFormatForDisplay` renders `'linux'` labels on the server and during hydration, then switches to the browser's platform without a hydration error. Mac users see `Ctrl+S` until React hydrates. Set the provider's `platform` to avoid that.

The provider must render on the server too, so wrap your app in it where the request is available, as shown for each framework below.

Pages rendered this way depend on the request's `User-Agent` header. If a CDN or another shared cache stores them, it can serve one user's labels, and the platform that `Mod` resolves to, to other users. Keep these pages out of shared caches, or add the platform to the cache key. `Vary: User-Agent` also works, but it splits the cache into many small entries.

### TanStack Start

`createIsomorphicFn` reads the request header on the server and the browser's `navigator` in the browser, so no loader is needed:

```tsx
// src/routes/__root.tsx
import { Outlet } from '@tanstack/react-router'
import { createIsomorphicFn } from '@tanstack/react-start'
import { getRequestHeader } from '@tanstack/react-start/server'
import { HotkeysProvider, detectPlatform } from '@tanstack/react-hotkeys'

const getPlatform = createIsomorphicFn()
  .server(() => detectPlatform(getRequestHeader('user-agent')))
  .client(() => detectPlatform())

function RootComponent() {
  return (
    <HotkeysProvider defaultOptions={{ platform: getPlatform() }}>
      <Outlet />
    </HotkeysProvider>
  )
}
```

The [TanStack Start example](../examples/useFormatForDisplay-tanstack-start) shows this setup.

### Next.js (App Router)

Read the header in a server component, such as the root layout, and pass the platform to the provider. The provider is a client component, so Next sends the value to the browser with the page:

```tsx
// app/layout.tsx
import { headers } from 'next/headers'
import { HotkeysProvider, detectPlatform } from '@tanstack/react-hotkeys'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const userAgent = (await headers()).get('user-agent')

  return (
    <html lang="en">
      <body>
        <HotkeysProvider defaultOptions={{ platform: detectPlatform(userAgent) }}>
          {children}
        </HotkeysProvider>
      </body>
    </html>
  )
}
```

Reading `headers()` renders the layout on each request. For a page that should stay static, see [Static and prerendered pages](#static-and-prerendered-pages).

The [Next.js example](../examples/useFormatForDisplay-nextjs) shows this setup.

### React Router (framework mode)

Detect the platform in the root route's loader, and read it in the root component. React Router sends loader data to the browser with the page:

```tsx
// app/root.tsx
import { Outlet } from 'react-router'
import { HotkeysProvider, detectPlatform } from '@tanstack/react-hotkeys'
import type { Route } from './+types/root'

export function loader({ request }: Route.LoaderArgs) {
  return { platform: detectPlatform(request.headers.get('user-agent')) }
}

export default function App({ loaderData }: Route.ComponentProps) {
  return (
    <HotkeysProvider defaultOptions={{ platform: loaderData.platform }}>
      <Outlet />
    </HotkeysProvider>
  )
}
```

The [React Router example](../examples/useFormatForDisplay-react-router) shows this setup.

### Astro

Each React island is its own React app, so render the provider inside the island and pass the platform from the page. The page must render on demand to have a request: add `export const prerender = false`, or use `output: 'server'`.

```astro
---
// src/pages/index.astro
import { detectPlatform } from '@tanstack/react-hotkeys'
import Shortcuts from '../components/Shortcuts'

export const prerender = false
const platform = detectPlatform(Astro.request.headers.get('user-agent'))
---

<Shortcuts client:load platform={platform} />
```

```tsx
// src/components/Shortcuts.tsx
import { HotkeysProvider } from '@tanstack/react-hotkeys'
import type { HotkeyPlatform } from '@tanstack/react-hotkeys'

export default function Shortcuts({ platform }: { platform: HotkeyPlatform }) {
  return (
    <HotkeysProvider defaultOptions={{ platform }}>
      <CheatSheet />
    </HotkeysProvider>
  )
}
```

The [Astro example](../examples/useFormatForDisplay-astro) shows this setup.

### Render a label only in the browser

To skip server rendering for a label instead, render it after hydration. In the browser, plain `formatForDisplay` detects the platform:

```tsx
import { useSyncExternalStore } from 'react'
import { formatForDisplay } from '@tanstack/react-hotkeys'

const subscribe = () => () => {}

function ClientOnly({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false)
  return hydrated ? children : fallback
}

<ClientOnly fallback={<kbd>&nbsp;</kbd>}>
  <kbd>{formatForDisplay('Mod+S')}</kbd>
</ClientOnly>
```

Framework wrappers do the same: TanStack Router's `<ClientOnly>`, `next/dynamic` with `ssr: false`, or `client:only="react"` on an Astro island. A fallback with the label's width keeps the layout from shifting.

### Static and prerendered pages

A page rendered at build time has no request and no user, so neither `formatForDisplay` nor `useFormatForDisplay` can know the platform. This includes prerendered routes in TanStack Start and React Router, static pages and `output: 'export'` in Next.js, and Astro's default static output. Render platform-specific labels in a client-only wrapper, as above. `useFormatForDisplay` without a provider `platform` also works there: it shows `'linux'` labels until hydration, then switches.

### Development warning

In development, formatting a label on the server without a platform logs a warning once. Without a platform, the server renders `'linux'` labels, so users on macOS and Windows get a different label after hydration. If you develop on Linux, you won't see the problem yourself. The warning names the missing setting. It isn't included in production builds.

## Parse, compare, and store hotkeys

`parseHotkey` returns each chord's key, as either a logical `key` or a physical `code`, plus its modifiers with `Mod` resolved. Check which one you have before reading it:

```ts
import { formatForDisplay, normalizeHotkey, parseHotkey } from '@tanstack/react-hotkeys'

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

Try these options together with the format toggles in the [server-rendered cheat sheet example](../examples/useFormatForDisplay-tanstack-start). For a full list of your app's shortcuts, see [Cheat Sheet UI Helpers](./cheat-sheet-ui-helpers).
