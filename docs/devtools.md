---
title: Devtools
id: devtools
---

TanStack Hotkeys ships devtools for debugging and monitoring your registered hotkeys in real time, as a panel inside the [TanStack Devtools](https://tanstack.com/devtools) multi-panel UI.

> [!NOTE]
> The Hotkeys devtools exports are no-ops outside development mode. See [Production builds](#production-builds) if you need them in production.

## Features

The Hotkeys devtools panel lets you:

- View all currently registered hotkeys, chords and sequences in one list, with their options and status
- Follow sequence progress as steps are pressed
- See declared [app hotkeys](./overview#app-hotkeys) that nothing has registered yet, with their custom hotkeys
- See which keys are held down in real time
- Trigger hotkey callbacks for testing, without pressing the keys
- Inspect individual registrations, including their target, event type, and conflict behavior

## Installation

Install the TanStack Devtools host package and the Hotkeys devtools adapter for your framework.

<!-- ::start:framework -->

# React

```sh
npm install @tanstack/react-devtools @tanstack/react-hotkeys-devtools
```

# Preact

```sh
npm install @tanstack/preact-devtools @tanstack/preact-hotkeys-devtools
```

# Solid

```sh
npm install @tanstack/solid-devtools @tanstack/solid-hotkeys-devtools
```

# Angular

Requires Angular 21 or newer.

```sh
npm install @tanstack/angular-devtools @tanstack/angular-hotkeys-devtools
```

# Vue

```sh
npm install @tanstack/vue-hotkeys-devtools
```

# Svelte

Requires Svelte 5.25 or newer within version 5.

```sh
npm install @tanstack/svelte-devtools @tanstack/svelte-hotkeys-devtools
```

# Lit

Lit does not currently ship a dedicated Hotkeys devtools adapter.

# Alpine

Alpine does not currently ship a dedicated Hotkeys devtools adapter.

# Ember

Ember does not currently ship a dedicated Hotkeys devtools adapter.

# Octane

Octane does not currently ship a dedicated Hotkeys devtools adapter.

<!-- ::end:framework -->

## Setup

<!-- ::start:framework -->

# React

```tsx
import { TanStackDevtools } from '@tanstack/react-devtools'
import { hotkeysDevtoolsPlugin } from '@tanstack/react-hotkeys-devtools'

const devtoolsPlugins = [hotkeysDevtoolsPlugin()]

function App() {
  return <TanStackDevtools plugins={devtoolsPlugins} />
}
```

Create the `plugins` array outside your component. A new array on every render makes the devtools remount the panel, which clears its search box. Hotkeys state such as `useHeldKeys` re-renders a component on every key press, so this shows up quickly.

The Hotkeys panel appears alongside any other TanStack devtools plugins you have installed.

# Preact

```tsx
import { TanStackDevtools } from '@tanstack/preact-devtools'
import { hotkeysDevtoolsPlugin } from '@tanstack/preact-hotkeys-devtools'

const devtoolsPlugins = [hotkeysDevtoolsPlugin()]

export function App() {
  return <TanStackDevtools plugins={devtoolsPlugins} />
}
```

Create the `plugins` array outside your component. A new array on every render makes the devtools remount the panel, which clears its search box. Hotkeys state such as `useHeldKeys` re-renders a component on every key press, so this shows up quickly.

The Hotkeys panel appears alongside any other TanStack devtools plugins you have installed.

# Solid

```tsx
import { TanStackDevtools } from '@tanstack/solid-devtools'
import { hotkeysDevtoolsPlugin } from '@tanstack/solid-hotkeys-devtools'

export function App() {
  return <TanStackDevtools plugins={[hotkeysDevtoolsPlugin()]} />
}
```

The Hotkeys panel appears alongside any other TanStack devtools plugins you have installed.

# Angular

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

Keep your existing application providers alongside this provider. The Hotkeys panel appears alongside any other TanStack devtools plugins you have installed.

# Vue

```vue
<script setup lang="ts">
import { HotkeysDevtoolsPanel } from '@tanstack/vue-hotkeys-devtools'
</script>

<template>
  <AppContent />
  <HotkeysDevtoolsPanel />
</template>
```

# Svelte

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

In SvelteKit, you can use `dev` from `$app/environment` as the condition instead. The Hotkeys panel appears alongside any other TanStack devtools plugins you have installed.

# Lit

Lit does not currently ship a dedicated Hotkeys devtools adapter.

# Alpine

Alpine does not currently ship a dedicated Hotkeys devtools adapter.

# Ember

Ember does not currently ship a dedicated Hotkeys devtools adapter.

# Octane

Octane does not currently ship a dedicated Hotkeys devtools adapter.

<!-- ::end:framework -->

## Standalone panel

<!-- ::start:framework -->

# React

`HotkeysDevtoolsPanel` renders the panel without the TanStack Devtools dock:

```tsx
import { HotkeysDevtoolsPanel } from '@tanstack/react-hotkeys-devtools'

function DebugPanel() {
  return <HotkeysDevtoolsPanel />
}
```

Both props are optional: `theme` defaults to `'dark'` and `devtoolsOpen` defaults to `true`. Pass `theme="light"` to select the light theme. When using `hotkeysDevtoolsPlugin()`, the dock supplies these props and its values take precedence over the standalone defaults.

# Preact

`HotkeysDevtoolsPanel` renders the panel without the TanStack Devtools dock:

```tsx
import { HotkeysDevtoolsPanel } from '@tanstack/preact-hotkeys-devtools'

export function DebugPanel() {
  return <HotkeysDevtoolsPanel />
}
```

Both props are optional: `theme` defaults to `'dark'` and `devtoolsOpen` defaults to `true`. Pass `theme="light"` to select the light theme. When using `hotkeysDevtoolsPlugin()`, the dock supplies these props and its values take precedence over the standalone defaults.

# Solid

`HotkeysDevtoolsPanel` renders the panel without the TanStack Devtools dock:

```tsx
import { HotkeysDevtoolsPanel } from '@tanstack/solid-hotkeys-devtools'

export function DebugPanel() {
  return <HotkeysDevtoolsPanel />
}
```

Both props are optional: `theme` defaults to `'dark'` and `devtoolsOpen` defaults to `true`. Pass `theme="light"` to select the light theme. When using `hotkeysDevtoolsPlugin()`, the dock supplies these props and its values take precedence over the standalone defaults.

# Angular

`HotkeysDevtoolsPanel` is a render factory for the official dock. To mount it in your own host element, call the factory and keep its returned cleanup function:

```ts
import { HotkeysDevtoolsPanel } from '@tanstack/angular-hotkeys-devtools'

export function mountHotkeysPanel(host: HTMLElement) {
  const render = HotkeysDevtoolsPanel()
  return render?.(() => ({ theme: 'light' }), host)
}
```

Call the returned cleanup function when the host is destroyed. The factory returns `null` outside development mode. `theme` defaults to `'dark'` and `devtoolsOpen` defaults to `true`. Values supplied by the dock take precedence over these defaults.

# Vue

The `HotkeysDevtoolsPanel` component in the setup above is the standalone panel.

# Svelte

`HotkeysDevtoolsPanel` renders the panel without the TanStack Devtools dock:

```svelte
<script lang="ts">
  import { HotkeysDevtoolsPanel } from '@tanstack/svelte-hotkeys-devtools'
</script>

<HotkeysDevtoolsPanel theme="light" />
```

Both props are optional: `theme` defaults to `'dark'` and `devtoolsOpen` defaults to `true`. Values supplied by the dock take precedence over these defaults.

# Lit

Lit does not currently ship a dedicated Hotkeys devtools adapter.

# Alpine

Alpine does not currently ship a dedicated Hotkeys devtools adapter.

# Ember

Ember does not currently ship a dedicated Hotkeys devtools adapter.

# Octane

Octane does not currently ship a dedicated Hotkeys devtools adapter.

<!-- ::end:framework -->

## Production builds

In production builds, the framework devtools adapters return no-op implementations, so they don't affect your bundle's behavior.

<!-- ::start:framework -->

# React

To include the devtools in a production build, import from the production entry point:

```tsx
import { hotkeysDevtoolsPlugin } from '@tanstack/react-hotkeys-devtools/production'
```

This entry point also exports the active `HotkeysDevtoolsPanel` for standalone use.

# Preact

The Preact adapter does not currently provide a production entry point.

# Solid

To include the devtools in a production build, import from the production entry point:

```tsx
import { hotkeysDevtoolsPlugin } from '@tanstack/solid-hotkeys-devtools/production'
```

This entry point also exports the active `HotkeysDevtoolsPanel` for standalone use.

# Angular

To include the devtools in a production build, import from the production entry point and remove the `isDevMode()` guard from the setup example:

```ts
import { hotkeysDevtoolsPlugin } from '@tanstack/angular-hotkeys-devtools/production'
```

This entry point also exports the active `HotkeysDevtoolsPanel` for standalone use.

# Vue

To include the devtools in a production build, import from the production entry point:

```ts
import { HotkeysDevtoolsPanel } from '@tanstack/vue-hotkeys-devtools/production'
```

# Svelte

To include the devtools in a production build, import from the production entry point and remove the `import.meta.env.DEV` guard from the setup example:

```ts
import { hotkeysDevtoolsPlugin } from '@tanstack/svelte-hotkeys-devtools/production'
```

This entry point also exports the active `HotkeysDevtoolsPanel` for standalone use.

# Lit

Lit does not currently ship a dedicated Hotkeys devtools adapter.

# Alpine

Alpine does not currently ship a dedicated Hotkeys devtools adapter.

# Ember

Ember does not currently ship a dedicated Hotkeys devtools adapter.

# Octane

Octane does not currently ship a dedicated Hotkeys devtools adapter.

<!-- ::end:framework -->
