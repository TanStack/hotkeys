---
title: Server-Side Rendering and Hydration in Preact
id: ssr
description: Render platform-accurate shortcut labels without hydration mismatches in Fresh, Astro, and Vite server rendering.
---

Configure platform detection for server-rendered and static Preact apps so shortcut labels match the user's operating system without hydration issues. Use the setup that matches how the app renders:

| App setup | What to configure |
| --- | --- |
| Browser-only SPA (such as Vite) | Nothing needed |
| SSR rendered per request | Pass `detectPlatform(userAgent)` to `HotkeysProvider` ([details](#format-labels-in-server-rendered-apps)) |
| Static or prerendered pages | Render labels in a client-only wrapper ([details](#static-and-prerendered-pages)) |

## Format labels in server-rendered apps

The server doesn't know the user's platform. Without one, a label rendered on the server uses `'linux'`, so a Mac user gets `Ctrl+S` in the server's HTML. When Preact hydrates, it replaces the label's text with `⌘ S`, so the label changes in front of the user. Preact's `hydrate()` doesn't update attributes, so a label in an attribute, such as a `title`, keeps `Ctrl+S`. To render the right label from the start:

1. Read the request's `User-Agent` header on the server, and pass `detectPlatform(userAgent)` as the provider's `platform`.
2. Format labels with `useFormatForDisplay()`. It reads the provider, so it uses the platform from step 1.

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
  const formatForDisplay = useFormatForDisplay()

  return (
    <ul>
      {commands.map((command) => (
        <li key={command.id}>
          {command.name} <kbd>{formatForDisplay(command.hotkey)}</kbd>
        </li>
      ))}
    </ul>
  )
}
```

Call the hook once at the top of the component, then call the function anywhere, including in loops and conditions. A `platform` passed to the function wins over the provider's.

In the browser, `detectPlatform()` reads the browser's own `navigator`, so the server and the browser get the same platform for practically every user. The provider's `platform` is also the default platform for hotkeys and recorders inside it. The provider that holds `appHotkeys` also compares app hotkeys on its platform, such as for conflicts. An inner provider inherits it.

Without a provider `platform`, `useFormatForDisplay` detects `'linux'` on the server and the user's platform in the browser. The server's label then changes at hydration, as described above. Set the provider's `platform` in every server-rendered Preact app.

The provider must render on the server too. Wrap the app in it where the request is available, as the recipes below show.

> [!NOTE]
> **Caching.** Pages that depend on the request's `User-Agent` header shouldn't be shared across users by a CDN or another shared cache, because it can serve one user's labels, and the platform that `Mod` resolves to, to other users. Keep these pages out of shared caches, or add the platform to the cache key. `Vary: User-Agent` also works, but it splits the cache into many small entries.

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

Render the app with `preact-render-to-string` on the server, and pass the platform as a prop. In the browser, `detectPlatform()` returns the same platform, so `hydrate` gets the same props:

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

export function render(userAgent: string | null | undefined) {
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

The server calls `render` with the request's `User-Agent` header: `request.headers.get('user-agent')` for a Fetch API `Request`, or `req.headers['user-agent']` in Express.

The [Vite SSR example](../examples/useFormatForDisplay-vite-ssr) shows this setup.

### Render a label only in the browser

To skip server rendering for a label instead, render it after hydration. A component that first renders in the browser gets the browser's platform from `useFormatForDisplay` at once:

```tsx
import { useEffect, useState } from 'preact/hooks'
import type { ComponentChildren } from 'preact'
import { useFormatForDisplay } from '@tanstack/preact-hotkeys'
import type { Hotkey } from '@tanstack/preact-hotkeys'

function ClientOnly({ children, fallback = null }: { children: ComponentChildren; fallback?: ComponentChildren }) {
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => setHydrated(true), [])
  return <>{hydrated ? children : fallback}</>
}

// Formats when it renders, which happens only in the browser
function ShortcutLabel({ hotkey }: { hotkey: Hotkey }) {
  const formatForDisplay = useFormatForDisplay()
  return <kbd>{formatForDisplay(hotkey)}</kbd>
}

<ClientOnly fallback={<kbd>&nbsp;</kbd>}>
  <ShortcutLabel hotkey="Mod+S" />
</ClientOnly>
```

The server and the first browser render both show the fallback, so hydration matches. On an Astro island, `client:only="preact"` does the same for the whole island. Fresh's `IS_BROWSER` is already `true` while an island hydrates, so use the check above for labels instead. A fallback with the label's width keeps the layout from shifting.

### Static and prerendered pages

A page rendered at build time has no request and no user, so `useFormatForDisplay` can't know the platform. This includes Astro's default static output and any page prerendered with `preact-render-to-string`. Render platform-specific labels in a client-only wrapper, as above.

### Development warning

In development, formatting a label on the server without a platform logs a warning once. Without a platform, the server renders `'linux'` labels, so macOS and Windows users see the label change after hydration. Developers on Linux never see that change, so the warning names the missing setting. The check is stripped from production builds.
