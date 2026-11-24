---
title: Server-Side Rendering and Hydration in Svelte
id: ssr
description: Render platform-accurate shortcut labels without hydration mismatches in SvelteKit and Astro, and handle prerendered pages.
---

TanStack Hotkeys works in server-rendered and static Svelte apps without hydration errors. Use the setup that matches how your app renders:

| App setup | What to configure |
| --- | --- |
| Browser-only SPA (such as Vite) | Nothing needed |
| Server-rendered per request | Pass `platform` in the `HotkeysProvider` default options from the request ([details](#format-labels-in-server-rendered-apps)) |
| Static or prerendered pages | Render labels only in the browser, or allow the Linux fallback until hydration ([details](#static-and-prerendered-pages)) |

## Format labels in server-rendered apps

The server doesn't know the user's platform. Without one, a label rendered on the server uses `'linux'`, so a Mac user gets `Ctrl+S` in the server's HTML and `⌘ S` once Svelte hydrates. To render the right label from the start:

1. Read the request's `User-Agent` header on the server, and pass `detectPlatform(userAgent)` as the provider's `platform`.
2. Format labels with `getFormatForDisplay()`. It reads the provider, so it uses the platform from step 1.

```svelte
<script lang="ts">
  import { HotkeysProvider, detectPlatform } from '@tanstack/svelte-hotkeys'
  import Editor from './Editor.svelte'
</script>

<HotkeysProvider defaultOptions={{ platform: detectPlatform(userAgent) }}>
  <Editor />
</HotkeysProvider>
```

```svelte
<script lang="ts">
  import { getFormatForDisplay } from '@tanstack/svelte-hotkeys'

  // Call it during component initialization, like getContext
  const formatForDisplay = getFormatForDisplay()
</script>

<ul>
  {#each commands as command (command.id)}
    <li>{command.name} <kbd>{formatForDisplay(command.hotkey)}</kbd></li>
  {/each}
</ul>
```

Call `getFormatForDisplay` once at the top level of the component's `<script>`, then call the function anywhere, including in markup, `{#each}` blocks, and `$derived`. The function reads the provider's `platform` on every call, so labels update when the platform changes. A `platform` passed to the function wins over the provider's.

In the browser, `detectPlatform()` reads the browser's own `navigator`, so the server and the browser get the same platform for practically every user. The provider's `platform` is also the default platform for hotkeys and recorders inside it. The provider that holds `appHotkeys` also compares app hotkeys on its platform, such as for conflicts. An inner provider, or a component that calls `setHotkeysContext`, inherits it.

Svelte has no fallback for a missing platform. Without a provider `platform`, `getFormatForDisplay` renders `'linux'` labels on the server and the browser's platform during hydration. Svelte replaces the label during hydration without a warning, so Mac users see `Ctrl+S` until the page hydrates. Set the provider's `platform` on every page that renders on the server.

The provider must render on the server too, so wrap your app in it where the request is available, as shown for each framework below.

Pages rendered this way depend on the request's `User-Agent` header. If a CDN or another shared cache stores them, it can serve one user's labels, and the platform that `Mod` resolves to, to other users. Keep these pages out of shared caches, or add the platform to the cache key. `Vary: User-Agent` also works, but it splits the cache into many small entries.

### SvelteKit

Detect the platform in the root layout's server `load` function, and read it in the root layout. SvelteKit sends load data to the browser with the page:

```ts
// src/routes/+layout.server.ts
import { detectPlatform } from '@tanstack/svelte-hotkeys'
import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = ({ request }) => {
  const userAgent = request.headers.get('user-agent')
  // Prerendered pages have no request header, so the browser detects it
  return { platform: userAgent ? detectPlatform(userAgent) : undefined }
}
```

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import { HotkeysProvider } from '@tanstack/svelte-hotkeys'
  import type { LayoutProps } from './$types'

  let { data, children }: LayoutProps = $props()
</script>

<HotkeysProvider defaultOptions={{ platform: data.platform }}>
  {@render children()}
</HotkeysProvider>
```

A prerendered page gets no `platform` from this load function. Don't return `detectPlatform()` without a user agent: on the server it returns `'linux'`, and the browser would keep it, for labels and for `Mod`. For prerendered pages, see [Static and prerendered pages](#static-and-prerendered-pages).

The [SvelteKit example](../examples/getFormatForDisplay-sveltekit) shows this setup.

### Astro

Each Svelte island is mounted on its own, and context doesn't cross islands, so render the provider inside the island and pass the platform from the page. The page must render on demand to have a request: add `export const prerender = false`, or use `output: 'server'`.

```astro
---
// src/pages/index.astro
import { detectPlatform } from '@tanstack/svelte-hotkeys'
import Shortcuts from '../components/Shortcuts.svelte'

export const prerender = false
const platform = detectPlatform(Astro.request.headers.get('user-agent'))
---

<Shortcuts client:load platform={platform} />
```

```svelte
<!-- src/components/Shortcuts.svelte -->
<script lang="ts">
  import { HotkeysProvider } from '@tanstack/svelte-hotkeys'
  import type { HotkeyPlatform } from '@tanstack/svelte-hotkeys'
  import CheatSheet from './CheatSheet.svelte'

  let { platform }: { platform: HotkeyPlatform } = $props()
</script>

<HotkeysProvider defaultOptions={{ platform }}>
  <CheatSheet />
</HotkeysProvider>
```

The [Astro example](../examples/getFormatForDisplay-astro) shows this setup.

### Render a label only in the browser

To skip server rendering for a label instead, render it after the component mounts. Without a provider `platform`, the function from `getFormatForDisplay` detects the platform in the browser:

```svelte
<script lang="ts">
  import { onMount } from 'svelte'
  import { getFormatForDisplay } from '@tanstack/svelte-hotkeys'

  const formatForDisplay = getFormatForDisplay()
  let mounted = $state(false)
  onMount(() => {
    mounted = true
  })
</script>

{#if mounted}
  <kbd>{formatForDisplay('Mod+S')}</kbd>
{:else}
  <kbd>&nbsp;</kbd>
{/if}
```

Framework options do the same for a whole page or island: `export const ssr = false` in a SvelteKit page or layout, or `client:only="svelte"` on an Astro island. A fallback with the label's width keeps the layout from shifting.

### Static and prerendered pages

A page rendered at build time has no request and no user, so `getFormatForDisplay` can't know the platform. This includes SvelteKit pages with `export const prerender = true`, sites built with `adapter-static`, and Astro's default static output. Without a provider `platform`, `getFormatForDisplay` shows `'linux'` labels until the page hydrates, then switches. To show nothing until then, render the labels in a client-only wrapper, as above.

### Development warning

In development, formatting a label on the server without a platform logs a warning once. Without a platform, the server renders `'linux'` labels, so users on macOS and Windows see a different label after hydration. If you develop on Linux, you won't see the problem yourself. The warning names the missing setting. It isn't included in production builds.
