---
title: Server-Side Rendering and Hydration in Vue
id: ssr
description: Render platform-accurate shortcut labels without hydration mismatches in Nuxt, Vite SSR, and Astro, and handle prerendered pages.
---

Configure platform detection for server-rendered and static Vue apps so shortcut labels match the user's operating system without hydration issues. Use the setup that matches how your app renders:

| App setup | What to configure |
| --- | --- |
| Browser-only SPA (such as Vite) | Nothing needed |
| Server-rendered per request | Pass `platform` in the `HotkeysProvider` default options from the request ([details](#format-labels-in-server-rendered-apps)) |
| Static or prerendered pages | Render labels in a client-only wrapper ([details](#static-and-prerendered-pages)) |

## Format labels in server-rendered apps

The server doesn't know the user's platform. Without one, a label rendered on the server uses `'linux'`, so a Mac user gets `Ctrl+S` in the server's HTML and `⌘ S` once Vue hydrates, with a hydration mismatch. To render the right label from the start:

1. Read the request's `User-Agent` header on the server, and pass `detectPlatform(userAgent)` as the provider's `platform`.
2. Format labels with `useFormatForDisplay()`. It reads the provider, so it uses the platform from step 1.

```vue
<script setup lang="ts">
import { HotkeysProvider, detectPlatform } from '@tanstack/vue-hotkeys'

const platform = detectPlatform(userAgent)
</script>

<template>
  <HotkeysProvider :default-options="{ platform }">
    <AppContent />
  </HotkeysProvider>
</template>
```

```vue
<script setup lang="ts">
import { useFormatForDisplay } from '@tanstack/vue-hotkeys'

// Call it in setup, like any composable
const formatForDisplay = useFormatForDisplay()
</script>

<template>
  <ul>
    <li v-for="command in commands" :key="command.id">
      {{ command.name }} <kbd>{{ formatForDisplay(command.hotkey) }}</kbd>
    </li>
  </ul>
</template>
```

Call the composable once in `setup`, then call the function anywhere, including in templates, loops, and computed properties. The function reads the provider's `platform` on every call, so labels update when the platform changes. A `platform` passed to the function wins over the provider's.

In the browser, `detectPlatform()` reads the browser's own `navigator`, so the server and the browser get the same platform for practically every user. The provider's `platform` is also the default platform for hotkeys and recorders inside it. The provider that holds `appHotkeys` also compares app hotkeys on its platform, such as for conflicts. An inner provider inherits it.

Vue has no fallback for a missing platform. Without a provider `platform`, `useFormatForDisplay` renders `'linux'` labels on the server and the browser's platform during hydration. Vue then replaces the label text, and logs a hydration mismatch: a warning for each label in development, and one error in production builds. Attributes, such as a `title` that contains a label, keep the server's value. Set the provider's `platform` on every page that renders on the server.

The provider must render on the server too, so wrap your app in it where the request is available, as shown for each framework below.

Pages rendered this way depend on the request's `User-Agent` header. If a CDN or another shared cache stores them, it can serve one user's labels, and the platform that `Mod` resolves to, to other users. Keep these pages out of shared caches, or add the platform to the cache key. `Vary: User-Agent` also works, but it splits the cache into many small entries.

### Nuxt

`useRequestHeader` returns the request's header on the server and `undefined` in the browser. `detectPlatform(undefined)` reads the browser's `navigator`, so the same line works on both sides:

```vue
<!-- app.vue -->
<script setup lang="ts">
import { HotkeysProvider, detectPlatform } from '@tanstack/vue-hotkeys'

// useRequestHeader is auto-imported
const platform = detectPlatform(useRequestHeader('user-agent'))
</script>

<template>
  <HotkeysProvider :default-options="{ platform }">
    <NuxtPage />
  </HotkeysProvider>
</template>
```

If your app uses layouts, wrap `<NuxtLayout>` instead of `<NuxtPage />`. For routes that Nuxt prerenders, see [Static and prerendered pages](#static-and-prerendered-pages).

The [Nuxt example](../examples/useFormatForDisplay-nuxt) shows this setup.

### Vite SSR

In a custom server-rendering setup, create the app with the platform. The server detects it from the request, and the browser detects it from `navigator`:

```ts
// src/main.ts
import { createSSRApp } from 'vue'
import type { HotkeyPlatform } from '@tanstack/vue-hotkeys'
import App from './App.vue'

export function createApp(platform: HotkeyPlatform) {
  return createSSRApp(App, { platform })
}
```

```ts
// src/entry-server.ts
import { renderToString } from 'vue/server-renderer'
import { detectPlatform } from '@tanstack/vue-hotkeys'
import { createApp } from './main'

// Call with the request's header, such as req.headers['user-agent']
export function render(userAgent: string | undefined) {
  return renderToString(createApp(detectPlatform(userAgent)))
}
```

```ts
// src/entry-client.ts
import { detectPlatform } from '@tanstack/vue-hotkeys'
import { createApp } from './main'

createApp(detectPlatform()).mount('#app')
```

```vue
<!-- src/App.vue -->
<script setup lang="ts">
import { HotkeysProvider } from '@tanstack/vue-hotkeys'
import type { HotkeyPlatform } from '@tanstack/vue-hotkeys'

defineProps<{ platform: HotkeyPlatform }>()
</script>

<template>
  <HotkeysProvider :default-options="{ platform }">
    <AppContent />
  </HotkeysProvider>
</template>
```

The [Vite SSR example](../examples/useFormatForDisplay-vite-ssr) shows this setup.

### Astro

Each Vue island is its own Vue app, so render the provider inside the island and pass the platform from the page. The page must render on demand to have a request: add `export const prerender = false`, or use `output: 'server'`.

```astro
---
// src/pages/index.astro
import { detectPlatform } from '@tanstack/vue-hotkeys'
import Shortcuts from '../components/Shortcuts.vue'

export const prerender = false
const platform = detectPlatform(Astro.request.headers.get('user-agent'))
---

<Shortcuts client:load platform={platform} />
```

```vue
<!-- src/components/Shortcuts.vue -->
<script setup lang="ts">
import { HotkeysProvider } from '@tanstack/vue-hotkeys'
import type { HotkeyPlatform } from '@tanstack/vue-hotkeys'
import CheatSheet from './CheatSheet.vue'

defineProps<{ platform: HotkeyPlatform }>()
</script>

<template>
  <HotkeysProvider :default-options="{ platform }">
    <CheatSheet />
  </HotkeysProvider>
</template>
```

The [Astro example](../examples/useFormatForDisplay-astro) shows this setup.

### Render a label only in the browser

To skip server rendering for a label instead, render it after the component mounts. Without a provider `platform`, the function from `useFormatForDisplay` detects the platform in the browser:

```vue
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useFormatForDisplay } from '@tanstack/vue-hotkeys'

const formatForDisplay = useFormatForDisplay()
const mounted = ref(false)
onMounted(() => {
  mounted.value = true
})
</script>

<template>
  <kbd v-if="mounted">{{ formatForDisplay('Mod+S') }}</kbd>
  <kbd v-else>&nbsp;</kbd>
</template>
```

Framework wrappers do the same: `<ClientOnly>` in Nuxt and VitePress, or `client:only="vue"` on an Astro island. Nuxt's `<ClientOnly>` renders its `#fallback` slot on the server:

```vue
<ClientOnly>
  <kbd>{{ formatForDisplay('Mod+S') }}</kbd>
  <template #fallback>
    <kbd>&nbsp;</kbd>
  </template>
</ClientOnly>
```

A fallback with the label's width keeps the layout from shifting.

### Static and prerendered pages

A page rendered at build time has no request and no user, so `useFormatForDisplay` can't know the platform. This includes `nuxt generate`, Nuxt routes with `prerender: true` in `routeRules`, VitePress sites, and Astro's default static output. Render platform-specific labels in a client-only wrapper, as above. Without one, Mac and Windows users get `'linux'` labels in the HTML and a hydration mismatch.

For example, a VitePress site can show shortcut labels in Markdown with a global component:

```vue
<!-- .vitepress/theme/Shortcut.vue -->
<script setup lang="ts">
import { useFormatForDisplay } from '@tanstack/vue-hotkeys'
import type { Hotkey } from '@tanstack/vue-hotkeys'

defineProps<{ hotkey: Hotkey }>()
const formatForDisplay = useFormatForDisplay()
</script>

<template>
  <ClientOnly>
    <kbd>{{ formatForDisplay(hotkey) }}</kbd>
  </ClientOnly>
</template>
```

```ts
// .vitepress/theme/index.ts
import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import Shortcut from './Shortcut.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('Shortcut', Shortcut)
  },
} satisfies Theme
```

```md
Press <Shortcut hotkey="Mod+K" /> to search.
```

VitePress's `<ClientOnly>` renders nothing on the server, and the label appears once the page hydrates.

The [VitePress example](../examples/useFormatForDisplay-vitepress) shows labels in `<ClientOnly>` on a static site.

### Development warning

In development, formatting a label on the server without a platform logs a warning once. Without a platform, the server renders `'linux'` labels, so users on macOS and Windows get a different label after hydration. If you develop on Linux, you won't see the problem yourself. The warning names the missing setting. It isn't included in production builds.
