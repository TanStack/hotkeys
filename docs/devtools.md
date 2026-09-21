---
title: Devtools
id: devtools
---

TanStack Hotkeys ships devtools for debugging and monitoring your registered hotkeys in real time, as a panel inside the [TanStack Devtools](https://tanstack.com/devtools) multi-panel UI.

> [!NOTE]
> By default, TanStack Devtools and the Hotkeys devtools are only included in development mode, so they add nothing to your production bundle. If you need devtools in a production build (say, to debug a production-only issue), use the alternative "production" imports.

## Features

The Hotkeys devtools panel lets you:

- View all currently registered hotkeys with their options and status
- See which keys are held down in real time
- Trigger hotkey callbacks for testing, without pressing the keys
- Inspect individual registrations, including their target, event type, and conflict behavior

## Installation

Install the devtools packages for your framework:

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

Angular and Lit do not currently ship a dedicated hotkeys devtools adapter.

## Setup

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

For React, Preact, and Solid, the Hotkeys panel appears alongside any other TanStack devtools plugins you have installed.

## Production builds

In production builds, the framework devtools adapters return no-op implementations, so they don't affect your bundle's behavior.

React also exposes a production import for when you explicitly want the plugin in production:

```tsx
import { hotkeysDevtoolsPlugin } from '@tanstack/react-hotkeys-devtools/production'
```
