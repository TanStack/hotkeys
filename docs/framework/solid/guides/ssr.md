---
title: Server-Side Rendering and Hydration in Solid
id: ssr
description: Render platform-accurate shortcut labels without hydration mismatches in SolidStart, TanStack Start, and Astro.
---

Configure platform detection for server-rendered and static Solid apps so shortcut labels match the user's operating system without hydration issues. Use the setup that matches how the app renders:

| App setup | What to configure |
| --- | --- |
| Browser-only SPA (such as Vite) | Nothing needed |
| SSR rendered per request | Pass `detectPlatform(userAgent)` to `HotkeysProvider` ([details](#format-labels-in-server-rendered-apps)) |
| Static or prerendered pages | Render labels in a client-only wrapper ([details](#static-and-prerendered-pages)) |

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

Without a provider `platform`, `createFormatForDisplay` renders `'linux'` labels on the server, and Mac users keep them after hydration. Set the provider's `platform` in every server-rendered Solid app.

The provider must render on the server too. Wrap the app in it where the request is available, as the recipes below show.

> [!NOTE]
> **Caching.** Pages that depend on the request's `User-Agent` header shouldn't be shared across users by a CDN or another shared cache, because it can serve one user's labels, and the platform that `Mod` resolves to, to other users. Keep these pages out of shared caches, or add the platform to the cache key. `Vary: User-Agent` also works, but it splits the cache into many small entries.

### SolidStart

> [!NOTE]
> SolidStart and Astro's Solid integration don't support Solid 2 yet. This section and its example use Solid 1 with `@tanstack/solid-hotkeys` 0.25, the last release for Solid 1.

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

> [!NOTE]
> SolidStart and Astro's Solid integration don't support Solid 2 yet. This section and its example use Solid 1 with `@tanstack/solid-hotkeys` 0.25, the last release for Solid 1.

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
import { Show, createSignal, onSettled } from 'solid-js'
import { createFormatForDisplay } from '@tanstack/solid-hotkeys'
import type { JSX } from '@solidjs/web'
import type { Hotkey } from '@tanstack/solid-hotkeys'

function ClientOnly(props: { children: JSX.Element; fallback?: JSX.Element }) {
  const [mounted, setMounted] = createSignal(false)
  onSettled(() => {
    setMounted(true)
  })
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

`onSettled` runs only in the browser, after hydration, so the server and the first render in the browser both show the fallback. Framework wrappers do the same: TanStack Router's `<ClientOnly>` from `@tanstack/solid-router`, SolidStart's `clientOnly()`, or `client:only="solid-js"` on an Astro island. A fallback with the label's width keeps the layout from shifting.

Don't use `<NoHydration>` or an `isServer` check for labels. `<NoHydration>` keeps the server's label, and rendering different content on the server and in the browser breaks hydration.

### Static and prerendered pages

A page rendered at build time has no request and no user, so `createFormatForDisplay` can't know the platform. This includes prerendered routes in SolidStart and TanStack Start, and Astro's default static output. Render platform-specific labels in a client-only wrapper, as above. Without a wrapper, Solid keeps the `'linux'` labels from the build.

### Development warning

In development, formatting a label on the server without a platform logs a warning once, because the label uses `'linux'` and Solid keeps it after hydration. The warning names the missing setting. It isn't included in production builds.
