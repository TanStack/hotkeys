---
title: Devtools
id: devtools
---

TanStack Hotkeys ships devtools for debugging and monitoring your registered hotkeys in real time, as a panel inside the [TanStack Devtools](https://tanstack.com/devtools) multi-panel UI.

> [!NOTE]
> The Hotkeys devtools exports are no-ops outside development mode. The Angular and Svelte setup examples below also guard the TanStack Devtools dock so it does not mount in production. To debug a production build, use the explicit `/production` Hotkeys exports.

## Features

The Hotkeys devtools panel lets you:

- View all currently registered hotkeys with their options and status
- See which keys are held down in real time
- Trigger hotkey callbacks for testing, without pressing the keys
- Inspect individual registrations, including their target, event type, and conflict behavior

## Installation

Install the devtools packages for your framework:

### Angular

Requires Angular 21 or newer.

```sh
npm install @tanstack/angular-devtools @tanstack/angular-hotkeys-devtools
```

### Svelte

Requires Svelte 5.25 or newer within version 5.

```sh
npm install @tanstack/svelte-devtools @tanstack/svelte-hotkeys-devtools
```

### React

```sh
npm install @tanstack/react-devtools @tanstack/react-hotkeys-devtools
```

### Preact

```sh
npm install @tanstack/preact-devtools @tanstack/preact-hotkeys-devtools
```

### Solid

```sh
npm install @tanstack/solid-devtools @tanstack/solid-hotkeys-devtools
```

### Vue

```sh
npm install @tanstack/vue-hotkeys-devtools
```

Alpine, Ember, Lit, and Octane do not currently ship dedicated Hotkeys devtools adapters.

## Setup

### Angular setup

Add the plugin through the official `provideTanStackDevtools` provider in `app.config.ts`. The provider creates the dock; you do not need to add a component to your template.

```ts
import { isDevMode } from '@angular/core'
import { provideTanStackDevtools } from '@tanstack/angular-devtools/provider'
import { hotkeysDevtoolsPlugin } from '@tanstack/angular-hotkeys-devtools'
import type { ApplicationConfig } from '@angular/core'

export const appConfig: ApplicationConfig = {
  providers: [
    ...(isDevMode()
      ? [
          provideTanStackDevtools(() => ({
            plugins: [hotkeysDevtoolsPlugin()],
          })),
        ]
      : []),
  ],
}
```

Keep your existing application providers alongside this provider.

### Svelte setup

Add the dock once in your root component. This example uses Vite's `import.meta.env.DEV` flag to keep the dock out of production builds.

```svelte
<script lang="ts">
  import { TanStackDevtools } from '@tanstack/svelte-devtools'
  import { hotkeysDevtoolsPlugin } from '@tanstack/svelte-hotkeys-devtools'
</script>

{#if import.meta.env.DEV}
  <TanStackDevtools plugins={[hotkeysDevtoolsPlugin()]} />
{/if}
```

In SvelteKit, you can use `dev` from `$app/environment` as the condition instead.

### React setup

```tsx
import { TanStackDevtools } from '@tanstack/react-devtools'
import { hotkeysDevtoolsPlugin } from '@tanstack/react-hotkeys-devtools'

function App() {
  return <TanStackDevtools plugins={[hotkeysDevtoolsPlugin()]} />
}
```

### Preact setup

```tsx
import { TanStackDevtools } from '@tanstack/preact-devtools'
import { hotkeysDevtoolsPlugin } from '@tanstack/preact-hotkeys-devtools'

export function App() {
  return <TanStackDevtools plugins={[hotkeysDevtoolsPlugin()]} />
}
```

### Solid setup

```tsx
import { TanStackDevtools } from '@tanstack/solid-devtools'
import { hotkeysDevtoolsPlugin } from '@tanstack/solid-hotkeys-devtools'

export function App() {
  return <TanStackDevtools plugins={[hotkeysDevtoolsPlugin()]} />
}
```

### Vue setup

```vue
<script setup lang="ts">
import { HotkeysDevtoolsPanel } from '@tanstack/vue-hotkeys-devtools'
</script>

<template>
  <AppContent />
  <HotkeysDevtoolsPanel />
</template>
```

For Angular, Svelte, React, Preact, and Solid, the Hotkeys panel appears alongside any other TanStack devtools plugins you have installed.

### Standalone panel

React, Preact, and Solid also export `HotkeysDevtoolsPanel` for rendering without the TanStack Devtools dock:

```tsx
import { HotkeysDevtoolsPanel } from '@tanstack/react-hotkeys-devtools'

function DebugPanel() {
  return <HotkeysDevtoolsPanel />
}
```

Use the corresponding `@tanstack/preact-hotkeys-devtools` or `@tanstack/solid-hotkeys-devtools` import for those frameworks. The panel and no-op component also accept an omitted props argument during rendering. Both props are optional: `theme` defaults to `'dark'` and `devtoolsOpen` defaults to `true`. Pass `theme="light"` to select the light theme. When using `hotkeysDevtoolsPlugin()`, the dock supplies these props and its values take precedence over the standalone defaults.

Svelte also exports a standalone component:

```svelte
<script lang="ts">
  import { HotkeysDevtoolsPanel } from '@tanstack/svelte-hotkeys-devtools'
</script>

<HotkeysDevtoolsPanel theme="light" />
```

Angular's `HotkeysDevtoolsPanel` is a render factory for the official dock. To mount it in your own host element, call the factory and keep its returned cleanup function:

```ts
import { HotkeysDevtoolsPanel } from '@tanstack/angular-hotkeys-devtools'

export function mountHotkeysPanel(host: HTMLElement) {
  const render = HotkeysDevtoolsPanel()
  return render?.(() => ({ theme: 'light' }), host)
}
```

Call the returned cleanup function when the host is destroyed. The factory returns `null` outside development mode. Both Angular and Svelte use the same standalone defaults as React: `theme: 'dark'` and `devtoolsOpen: true`. Values supplied by the dock take precedence over these defaults.

## Production builds

In production builds, the framework devtools adapters return no-op implementations, so they don't affect your bundle's behavior.

React also exposes a production import for when you explicitly want the plugin in production:

```tsx
import { hotkeysDevtoolsPlugin } from '@tanstack/react-hotkeys-devtools/production'
```

Angular and Svelte also provide explicit production exports:

```ts
import { hotkeysDevtoolsPlugin } from '@tanstack/angular-hotkeys-devtools/production'
```

```ts
import { hotkeysDevtoolsPlugin } from '@tanstack/svelte-hotkeys-devtools/production'
```

Remove the `isDevMode()` or `import.meta.env.DEV` guard from the corresponding setup example when you intentionally want the dock in production. These entry points also export the active `HotkeysDevtoolsPanel` for standalone use.
