---
title: Displaying Hotkeys in Your Solid UI
id: formatting-display
description: Format Solid hotkeys as platform-appropriate labels and keycaps, such as ⌘ S on macOS and Ctrl+S on Windows, for menus, buttons, and cheat sheets.
---

Format a hotkey as a label whenever it appears in a menu, button, tooltip, cheat sheet, or shortcut settings panel. `createFormatForDisplay` returns a function that formats chord strings, including physical ones such as `'Mod+[KeyS]'`, chord objects, parsed chords, and sequences. Store the hotkey itself, and format it when you render. A label is for reading, not for registering.

A label depends on the user's platform: `Mod+S` is `⌘ S` on macOS and `Ctrl+S` elsewhere. `createFormatForDisplay` works wherever your labels render:

| Where labels render | What to set up |
| --- | --- |
| Only in the browser, such as a Vite single-page app | Nothing |
| On the server, then hydrated | The provider's `platform`, set from the request. See [Format labels in server-rendered apps](#format-labels-in-server-rendered-apps) |
| In a static or prerendered page | A client-only wrapper. See [Static and prerendered pages](#static-and-prerendered-pages) |

## Format a hotkey

Call `createFormatForDisplay` in a component. It returns the function that formats a hotkey:

```tsx
import { createFormatForDisplay } from '@tanstack/solid-hotkeys'

function SaveButton() {
  const formatForDisplay = createFormatForDisplay()

  return (
    <button>
      Save <kbd>{formatForDisplay('Mod+S')}</kbd>
    </button>
  )
}
```

The label is `⌘ S` on macOS and `Ctrl+S` on Windows and Linux. The primitive fills in two things for you:

- **The platform** from the nearest `HotkeysProvider`, or the detected platform without one.
- **The user's keyboard layout**, for physical keys, in Chromium browsers. See [Label physical keys for the user's keyboard](#label-physical-keys-for-the-users-keyboard).

Call the primitive once, then call the function anywhere in the component's JSX. Options go in its second argument. The examples in this guide pass `platform`, so each one has a single result:

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

A position, such as `[KeyQ]`, has a fallback label for a US keyboard: `Q`. On a French AZERTY keyboard, that key is labeled A. Labels from `createFormatForDisplay` follow the user's keyboard where the browser reports its layout:

```tsx
import { createFormatForDisplay } from '@tanstack/solid-hotkeys'

function MoveUp() {
  const formatForDisplay = createFormatForDisplay()
  return <kbd>{formatForDisplay('[KeyW]')}</kbd> // 'W' on QWERTY, 'Z' on AZERTY
}
```

> [!IMPORTANT]
> **Layout labels work only in Chromium browsers**, such as Chrome and Edge. Firefox and Safari don't report the keyboard layout, so labels there keep the fallback. For `[KeyQ]`, a French AZERTY user sees `A` in Chrome and `Q` in Firefox. In a cross-origin iframe, Chromium browsers also refuse unless the frame has `allow="keyboard-map"`.

- **The layout loads after the first label mounts.** The first render shows the fallback label, and so does server HTML. A label in JSX updates when the layout arrives, and later labels have it at once.
- **Only positions change.** Hotkeys that follow characters, such as `Mod+Q`, already show the right key. Matching and recording never use the layout.
- **The layout is read again when the window regains focus**, because browsers send no event when the user switches layouts.

`createKeyboardLayout()` returns an accessor for the loaded layout, or `null`, for labels you draw yourself, such as an on-screen keyboard. It maps each code to the character the key types without modifiers, such as `KeyQ` to `a`.

The layout comes from `navigator.keyboard.getLayoutMap()`. To never call it, set `keyboardLayout: false` in the provider's `defaultOptions`:

```tsx
<HotkeysProvider defaultOptions={{ keyboardLayout: false }}>
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

## Format labels in server-rendered apps

The server doesn't know the user's platform. Without one, a label rendered on the server uses `'linux'`, so a Mac user gets `Ctrl+S` in the server's HTML. Solid keeps the server's text when it hydrates, so the label stays `Ctrl+S`, and Solid doesn't warn about it. To render the right label from the start:

1. Read the request's `User-Agent` header on the server, and pass `detectPlatform(userAgent)` as the provider's `platform`.
2. Format labels with `createFormatForDisplay()`. It reads the provider, so it uses the platform from step 1.

```tsx
import { HotkeysProvider, detectPlatform } from '@tanstack/solid-hotkeys'

<HotkeysProvider defaultOptions={{ platform: detectPlatform(userAgent) }}>
  <App />
</HotkeysProvider>
```

```tsx
import { For } from 'solid-js'
import { createFormatForDisplay } from '@tanstack/solid-hotkeys'

function Toolbar() {
  // Call it in the component, like other primitives
  const formatForDisplay = createFormatForDisplay()

  return (
    <ul>
      <For each={commands}>
        {(command) => (
          <li>
            {command.name} <kbd>{formatForDisplay(command.hotkey)}</kbd>
          </li>
        )}
      </For>
    </ul>
  )
}
```

Call `createFormatForDisplay` once in the component, then call the function anywhere in its JSX. The function reads the provider's `platform` each time it runs, so a label in JSX updates when the platform changes. A `platform` passed to the function wins over the provider's.

In the browser, `detectPlatform()` reads the browser's own `navigator`, so the server and the browser get the same platform for practically every user. The provider's `platform` is also the default platform for hotkeys and recorders inside it. The provider that holds `appHotkeys` also compares app hotkeys on its platform, such as for conflicts. An inner provider inherits it.

Without a provider `platform`, `createFormatForDisplay` renders `'linux'` labels on the server, and Mac users keep them after hydration. Set the provider's `platform` in every server-rendered app.

The provider must render on the server too, so wrap your app in it where the request is available, as shown for each framework below.

Pages rendered this way depend on the request's `User-Agent` header. If a CDN or another shared cache stores them, it can serve one user's labels, and the platform that `Mod` resolves to, to other users. Keep these pages out of shared caches, or add the platform to the cache key. `Vary: User-Agent` also works, but it splits the cache into many small entries.

### SolidStart

`getRequestEvent()` from `solid-js/web` returns the current request on the server and `undefined` in the browser. Without a user agent, `detectPlatform` reads the browser's `navigator`, so the same code works on both sides:

```tsx
// src/app.tsx
import { Suspense } from 'solid-js'
import { getRequestEvent } from 'solid-js/web'
import { Router } from '@solidjs/router'
import { FileRoutes } from '@solidjs/start/router'
import { HotkeysProvider, detectPlatform } from '@tanstack/solid-hotkeys'

export default function App() {
  const userAgent =
    getRequestEvent()?.request.headers.get('user-agent')

  return (
    <HotkeysProvider defaultOptions={{ platform: detectPlatform(userAgent) }}>
      <Router root={(props) => <Suspense>{props.children}</Suspense>}>
        <FileRoutes />
      </Router>
    </HotkeysProvider>
  )
}
```

The [SolidStart example](../examples/createFormatForDisplay-solid-start) shows this setup.

### TanStack Start

`createIsomorphicFn` reads the request header on the server and the browser's `navigator` in the browser, so no loader is needed:

```tsx
// src/routes/__root.tsx
import { Outlet } from '@tanstack/solid-router'
import { createIsomorphicFn } from '@tanstack/solid-start'
import { getRequestHeader } from '@tanstack/solid-start/server'
import { HotkeysProvider, detectPlatform } from '@tanstack/solid-hotkeys'

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

The [TanStack Start example](../examples/createFormatForDisplay-tanstack-start) shows this setup.

### Astro

Each Solid island is its own Solid app, so render the provider inside the island and pass the platform from the page. The page must render on demand to have a request: add `export const prerender = false`, or use `output: 'server'`.

```astro
---
// src/pages/index.astro
import { detectPlatform } from '@tanstack/solid-hotkeys'
import Shortcuts from '../components/Shortcuts'

export const prerender = false
const platform = detectPlatform(Astro.request.headers.get('user-agent'))
---

<Shortcuts client:load platform={platform} />
```

```tsx
// src/components/Shortcuts.tsx
import { HotkeysProvider } from '@tanstack/solid-hotkeys'
import type { HotkeyPlatform } from '@tanstack/solid-hotkeys'

export default function Shortcuts(props: { platform: HotkeyPlatform }) {
  return (
    <HotkeysProvider defaultOptions={{ platform: props.platform }}>
      <CheatSheet />
    </HotkeysProvider>
  )
}
```

The [Astro example](../examples/createFormatForDisplay-astro) shows this setup.

### Render a label only in the browser

To skip server rendering for a label instead, render it after hydration. A component that first renders in the browser gets the browser's platform from `createFormatForDisplay` at once:

```tsx
import { Show, createSignal, onMount } from 'solid-js'
import { createFormatForDisplay } from '@tanstack/solid-hotkeys'
import type { JSX } from 'solid-js'
import type { Hotkey } from '@tanstack/solid-hotkeys'

function ClientOnly(props: { children: JSX.Element; fallback?: JSX.Element }) {
  const [mounted, setMounted] = createSignal(false)
  onMount(() => setMounted(true))
  return (
    <Show when={mounted()} fallback={props.fallback}>
      {props.children}
    </Show>
  )
}

// Formats when it renders, which happens only in the browser
function ShortcutLabel(props: { hotkey: Hotkey }) {
  const formatForDisplay = createFormatForDisplay()
  return <kbd>{formatForDisplay(props.hotkey)}</kbd>
}

<ClientOnly fallback={<kbd>&nbsp;</kbd>}>
  <ShortcutLabel hotkey="Mod+S" />
</ClientOnly>
```

`onMount` runs only in the browser, after hydration, so the server and the first render in the browser both show the fallback. Framework wrappers do the same: TanStack Router's `<ClientOnly>` from `@tanstack/solid-router`, SolidStart's `clientOnly()`, or `client:only="solid-js"` on an Astro island. A fallback with the label's width keeps the layout from shifting.

Don't use `<NoHydration>` or an `isServer` check for labels. `<NoHydration>` keeps the server's label, and rendering different content on the server and in the browser breaks hydration.

### Static and prerendered pages

A page rendered at build time has no request and no user, so `createFormatForDisplay` can't know the platform. This includes prerendered routes in SolidStart and TanStack Start, and Astro's default static output. Render platform-specific labels in a client-only wrapper, as above. Without a wrapper, Solid keeps the `'linux'` labels from the build.

### Development warning

In development, formatting a label on the server without a platform logs a warning once, because the label uses `'linux'` and Solid keeps it after hydration. The warning names the missing setting. It isn't included in production builds.

## Format outside a component

`createFormatForDisplay` is a primitive, so call it in a component. Some code that builds labels isn't a component, such as a test or a plain module. There, call the plain `formatForDisplay` function and pass the platform yourself:

```ts
import { formatForDisplay } from '@tanstack/solid-hotkeys'

formatForDisplay('Mod+S', { platform }) // '⌘ S' when platform is 'mac'
```

The plain function takes the same options as the function from the primitive. It doesn't read the provider, and it uses only the `layoutMap` you pass. Without a `platform`, it detects one in the browser and uses `'linux'` on a server. To give it the user's layout, call `loadKeyboardLayout()` in the browser, and read the layout from `getKeyboardLayoutStore()`.

The export is marked deprecated so that your editor points component code to the primitive. Outside a component, it is the function to use.

## Parse, compare, and store hotkeys

`parseHotkey` returns each chord's key, as either a logical `key` or a physical `code`, plus its modifiers with `Mod` resolved. Check which one you have before reading it:

```ts
import { normalizeHotkey, parseHotkey } from '@tanstack/solid-hotkeys'

const parsed = parseHotkey('Mod+[KeyS]', 'mac')
if (parsed.code !== undefined) {
  console.log(parsed.code) // 'KeyS'; parsed.key is undefined
}
const stored = normalizeHotkey(parsed, 'mac') // 'Mod+[KeyS]'
```

A parsed chord's modifiers are already resolved for one platform. To store it as a hotkey that works on every platform, normalize it with that same platform, as above. `normalizeHotkey` also accepts chord strings, chord objects, and sequences. Store hotkeys, never display labels. [Write a chord as a string or an object](./hotkeys#write-a-chord-as-a-string-or-an-object) covers the forms a hotkey can take.

`areHotkeysEqual(a, b)` compares chords or sequences after resolving modifiers, so `Mod+S` equals `Meta+S` on macOS. Sequences compare step by step. `isHotkeySequence` narrows a `Hotkey` to a sequence, and `simplifyHotkey` turns a one-step sequence into its chord.

Use `validateHotkey` when you accept a hotkey from somewhere else, such as a settings file. It returns `valid`, `errors`, and `warnings`. Each error or warning has a `reason` code, such as `'unknown-modifier'`, the `part` it's about, and for a sequence, the index of the `step`. The library sends no text, so write your own messages for users. The devtools describe each problem in the details of a hotkey. It can't promise that the browser or operating system delivers the shortcut. To check hotkeys as users record them, see [Validate and check conflicts](./custom-hotkey-recording#validate-and-check-conflicts).

Try these options together with the format toggles in the [server-rendered cheat sheet example](../examples/createFormatForDisplay-solid-start). For a full list of your app's shortcuts, see [Cheat Sheet UI Helpers](./cheat-sheet-ui-helpers).
