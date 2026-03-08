---
title: Hotkeys Guide
id: hotkeys
---

The `useHotkey` composable is the primary way to register keyboard shortcuts in Vue applications. It wraps the singleton `HotkeyManager` with automatic cleanup, support for template refs, and reactive option syncing.

## Basic Usage

```vue
<script setup lang="ts">
import { useHotkey } from '@tanstack/vue-hotkeys'

useHotkey('Mod+S', () => {
  saveDocument()
})
</script>
```

The callback receives the original `KeyboardEvent` as the first argument and a `HotkeyCallbackContext` as the second:

```ts
useHotkey('Mod+S', (event, context) => {
  console.log(context.hotkey)
  console.log(context.parsedHotkey)
})
```

## Default Options

`useHotkey` uses the same core defaults as the framework-agnostic manager:

```ts
useHotkey('Mod+S', callback, {
  enabled: true,
  preventDefault: true,
  stopPropagation: true,
  eventType: 'keydown',
  requireReset: false,
  ignoreInputs: undefined,
  target: document,
  platform: undefined,
  conflictBehavior: 'warn',
})
```

## Reactive Options

Vue-specific options can be plain values, refs, or getters.

### `enabled`

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useHotkey } from '@tanstack/vue-hotkeys'

const isEditing = ref(false)

useHotkey('Mod+S', () => save(), { enabled: isEditing })
</script>
```

### `target`

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useHotkey } from '@tanstack/vue-hotkeys'

const panelRef = ref<HTMLDivElement | null>(null)

useHotkey('Escape', () => closePanel(), { target: panelRef })
</script>

<template>
  <div ref="panelRef" tabindex="0">Panel content</div>
</template>
```

## Global Default Options via Provider

```vue
<script setup lang="ts">
import { HotkeysProvider } from '@tanstack/vue-hotkeys'
</script>

<template>
  <HotkeysProvider
    :default-options="{
      hotkey: { preventDefault: false, ignoreInputs: false },
    }"
  >
    <AppContent />
  </HotkeysProvider>
</template>
```

## Common Options

### `requireReset`

```ts
useHotkey('Escape', () => closePanel(), { requireReset: true })
```

### `ignoreInputs`

```ts
useHotkey('K', () => openSearch())
useHotkey('Enter', () => submit(), { ignoreInputs: false })
```

### `conflictBehavior`

```ts
useHotkey('Mod+S', () => save(), { conflictBehavior: 'replace' })
```

### `platform`

```ts
useHotkey('Mod+S', () => save(), { platform: 'mac' })
```

## Automatic Cleanup

Hotkeys are automatically unregistered when the owning component unmounts.

## The Hotkey Manager

You can always reach for the underlying manager directly:

```ts
import { getHotkeyManager } from '@tanstack/vue-hotkeys'

const manager = getHotkeyManager()
manager.isRegistered('Mod+S')
manager.getRegistrationCount()
```
