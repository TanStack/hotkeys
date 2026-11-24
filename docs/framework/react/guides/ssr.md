---
title: Server-Side Rendering and Hydration in React
id: ssr
description: Render platform-accurate shortcut labels without hydration mismatches in TanStack Start, Next.js, React Router, and Astro, and pass app hotkeys from React Server Components.
---

TanStack Hotkeys works in server-rendered and static React apps without hydration errors. Use the setup that matches how your app renders:

| App setup | What to configure |
| --- | --- |
| Browser-only SPA (such as Vite) | Nothing needed |
| SSR rendered per request | Pass `detectPlatform(userAgent)` to `HotkeysProvider` ([details](#format-labels-in-server-rendered-apps)) |
| Static or prerendered pages | Render labels in a client-only wrapper, or allow Linux fallback until hydration ([details](#static-and-prerendered-pages)) |
| React Server Components passing `appHotkeys` | Render `AppHotkeysProvider` instead of `HotkeysProvider` ([details](#app-hotkeys-with-server-components)) |

## Format labels in server-rendered apps

Because a server has no `navigator`, server-rendered labels default to `'linux'` (`Ctrl+S`). Without telling the provider which operating system sent the request, macOS users see `Ctrl+S` in server HTML before switching to `⌘ S` on the client.

To render the right labels from the first byte:

1. Read the incoming `User-Agent` header on the server and pass `detectPlatform(userAgent)` to `HotkeysProvider`.
2. Render shortcut labels with `useFormatForDisplay()` inside your components.

```tsx
import { HotkeysProvider, detectPlatform } from '@tanstack/react-hotkeys'

<HotkeysProvider defaultOptions={{ platform: detectPlatform(userAgent) }}>
  <App />
</HotkeysProvider>
```

```tsx
import { useFormatForDisplay } from '@tanstack/react-hotkeys'

function Toolbar() {
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

- Calling `detectPlatform()` with no arguments in the browser reads `navigator` automatically. The provider's `platform` also sets the default for `useHotkey`, `useHotkeyRecorder`, and app hotkey conflict checks.
- Without a provider `platform`, `useFormatForDisplay` won't throw a hydration mismatch. It outputs `'linux'` during SSR and hydration, then updates on the client, so Mac users briefly see `Ctrl+S` and a dev warning logs once.

> [!NOTE]
> **Caching.** Pages personalized by `User-Agent` shouldn't be shared across users in a CDN cache unless you vary or key the cache on platform. `Vary: User-Agent` works, though keying directly by `'mac'`, `'windows'`, or `'linux'` avoids splitting cache entries by browser version.

### TanStack Start

`createIsomorphicFn` reads the request header on the server and `navigator` on the client, so no route loader is needed:

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

See the [TanStack Start example](../examples/useFormatForDisplay-tanstack-start).

### Next.js (App Router)

Read `headers()` in your root layout (a Server Component) and pass the resolved platform into `HotkeysProvider` (a Client Component):

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

Call `useFormatForDisplay()` inside `'use client'` components. For Server Components, call `formatForDisplay` directly (see [Format outside a component](./formatting-display#format-outside-a-component)). Because calling `headers()` opts routes into dynamic rendering, see [Static and prerendered pages](#static-and-prerendered-pages) if a route must stay static.

See the [Next.js example](../examples/useFormatForDisplay-nextjs).

### React Router (framework mode)

Detect the platform in the root loader and pass `loaderData.platform` into `HotkeysProvider`:

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

See the [React Router example](../examples/useFormatForDisplay-react-router).

### Astro

Each React island is a separate React root, so render `HotkeysProvider` inside the island and pass `platform` from an on-demand page (`prerender = false` or `output: 'server'`):

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

See the [Astro example](../examples/useFormatForDisplay-astro).

### Render a label only in the browser

To skip rendering labels during SSR, wrap the label component so it renders only after hydration:

```tsx
'use client'

import { useSyncExternalStore } from 'react'
import { useFormatForDisplay } from '@tanstack/react-hotkeys'
import type { Hotkey } from '@tanstack/react-hotkeys'

const subscribe = () => () => {}

function ClientOnly({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false)
  return hydrated ? children : fallback
}

// Formats inside the client-only boundary rather than in the parent
function ShortcutLabel({ hotkey }: { hotkey: Hotkey }) {
  const formatForDisplay = useFormatForDisplay()
  return <kbd>{formatForDisplay(hotkey)}</kbd>
}

<ClientOnly fallback={<kbd>&nbsp;</kbd>}>
  <ShortcutLabel hotkey="Mod+S" />
</ClientOnly>
```

Make sure `useFormatForDisplay()` runs *inside* the child component. Otherwise the parent already formatted it on the server. Built-in helpers like TanStack Router's `<ClientOnly>`, `next/dynamic` with `ssr: false`, and Astro's `client:only="react"` work the same way. Give the `fallback` a fixed width placeholder to prevent layout shift.

### Static and prerendered pages

Pages generated at build time, including prerendered TanStack Start or React Router routes, Next.js `output: 'export'`, and default static Astro pages, have no request headers. Without a `platform`, `useFormatForDisplay` shows `'linux'` labels until hydration and switches on the client. To hide labels until hydration, wrap them in a client-only component as shown above.

### Development warning

In development, formatting a label on the server without a `platform` logs a one-time warning so you catch the `'linux'` fallback even if you develop on Linux. The check is stripped from production builds.

## App hotkeys with Server Components

In React Server Component frameworks like the Next.js App Router, passing `appHotkeys` from a Server Component directly into `HotkeysProvider` won't initialize the client app-hotkeys store, because `defineAppHotkeys` only ran on the server.

Render `AppHotkeysProvider` instead. It accepts the same props and initializes the client store automatically:

```tsx
// app/layout.tsx
import { AppHotkeysProvider } from '@tanstack/react-hotkeys'
import { appHotkeys } from './app-hotkeys'
import type { ReactNode } from 'react'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html>
      <body>
        <AppHotkeysProvider appHotkeys={appHotkeys}>{children}</AppHotkeysProvider>
      </body>
    </html>
  )
}
```

`AppHotkeysProvider` also accepts saved `customHotkeys` from cookies or a database. Because functions can't cross the server and client boundary, render the provider from a `'use client'` module that imports the declarations if you pass `onCustomHotkeysChange` or functions inside `meta`.
