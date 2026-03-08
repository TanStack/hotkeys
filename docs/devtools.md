---
title: Devtools
id: devtools
---

TanStack Hotkeys provides devtools for debugging and monitoring all your registered hotkeys in real-time. The devtools integrate seamlessly within the [TanStack Devtools](https://tanstack.com/devtools) multi-panel UI.

> [!NOTE]
> By default, the TanStack Devtools and TanStack Hotkeys Devtools will only be included in development mode. This helps keep your production bundle size minimal. If you need to include devtools in production builds (e.g., for debugging production issues), you can use the alternative "production" imports.

## Features

The Hotkeys devtools panel provides:

- **Registered Hotkeys List** - View all currently registered hotkeys with their options and status
- **Held Keys Display** - See which keys are currently being held down in real-time
- **Trigger Hotkeys** - Programmatically trigger hotkey callbacks for testing without pressing keys
- **Registration Details** - Inspect individual hotkey registrations including their target, event type, and conflict behavior

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

Angular does not currently ship a dedicated hotkeys devtools adapter.

## Setup

### React Setup

```tsx
import { TanStackDevtools } from '@tanstack/react-devtools'
import { hotkeysDevtoolsPlugin } from '@tanstack/react-hotkeys-devtools'

function App() {
  return <TanStackDevtools plugins={[hotkeysDevtoolsPlugin()]} />
}
```

### Preact Setup

```tsx
import { TanStackDevtools } from '@tanstack/preact-devtools'
import { hotkeysDevtoolsPlugin } from '@tanstack/preact-hotkeys-devtools'

export function App() {
  return <TanStackDevtools plugins={[hotkeysDevtoolsPlugin()]} />
}
```

### Solid Setup

```tsx
import { TanStackDevtools } from '@tanstack/solid-devtools'
import { hotkeysDevtoolsPlugin } from '@tanstack/solid-hotkeys-devtools'

export function App() {
  return <TanStackDevtools plugins={[hotkeysDevtoolsPlugin()]} />
}
```

### Vue Setup

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

## Production Builds

By default, the framework devtools adapters return no-op implementations in production builds so they do not affect your production bundle behavior.

React additionally exposes a production import when you explicitly want to include the plugin in production:

```tsx
import { hotkeysDevtoolsPlugin } from '@tanstack/react-hotkeys-devtools/production'
```
