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

When `enabled` is false, the hotkey **stays registered** (visible in devtools); only the callback is suppressed.

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

## Registering Multiple Hotkeys

When you need to register several hotkeys at once — or a dynamic, variable-length list — use the `useHotkeys` (plural) composable:

```vue
<script setup>
import { useHotkeys } from '@tanstack/vue-hotkeys'

useHotkeys([
  { hotkey: 'Mod+S', callback: () => save() },
  { hotkey: 'Mod+Z', callback: () => undo() },
  { hotkey: 'Escape', callback: () => close() },
])
</script>
```

### Common Options with Per-Hotkey Overrides

Pass shared options as the second argument. Per-definition options override the common ones:

```ts
useHotkeys(
  [
    { hotkey: 'Mod+S', callback: () => save() },
    { hotkey: 'Mod+Z', callback: () => undo(), options: { enabled: false } },
  ],
  { preventDefault: true },
)
```

### Dynamic Hotkey Lists

Pass a getter or computed ref as the first argument for reactive arrays:

```vue
<script setup>
import { computed } from 'vue'
import { useHotkeys } from '@tanstack/vue-hotkeys'

const items = computed(() => [...])

useHotkeys(
  () => items.value.map((item) => ({
    hotkey: item.shortcut,
    callback: item.action,
  })),
)
</script>
```

The composable watches for changes and diffs registrations automatically.

## Metadata (name & description)

Every hotkey registration can carry a `meta` object with a `name` and `description`. This metadata is informational only -- it does not affect hotkey behavior -- but it flows through to registrations and devtools, making it easy to build shortcut palettes and help screens.

```ts
useHotkey('Mod+S', () => save(), {
  meta: { name: 'Save', description: 'Save the document' },
})
```

The `meta` option is typed as `HotkeyMeta`, which ships with `name` and `description` fields. You can extend it with additional properties using TypeScript declaration merging:

```ts
declare module '@tanstack/hotkeys' {
  interface HotkeyMeta {
    icon?: string
    group?: string
  }
}

useHotkey('Mod+S', () => save(), {
  meta: { name: 'Save', description: 'Save the document', icon: 'floppy', group: 'File' },
})
```

## Introspecting Registrations

Use the `useHotkeyRegistrations` composable to get a live view of all hotkey and sequence registrations. This is useful for building shortcut palettes, help dialogs, or devtools.

```vue
<script setup lang="ts">
import { useHotkeyRegistrations } from '@tanstack/vue-hotkeys'

const { hotkeys, sequences } = useHotkeyRegistrations()
</script>

<template>
  <div>
    <h2>Keyboard Shortcuts</h2>
    <ul>
      <li v-for="reg in hotkeys" :key="reg.hotkey">
        <kbd>{{ reg.hotkey }}</kbd>
        <span v-if="reg.meta?.name"> — {{ reg.meta.name }}</span>
        <p v-if="reg.meta?.description">{{ reg.meta.description }}</p>
      </li>
    </ul>
    <template v-if="sequences.length > 0">
      <h2>Sequences</h2>
      <ul>
        <li v-for="reg in sequences" :key="reg.sequence.join(' ')">
          <kbd>{{ reg.sequence.join(' → ') }}</kbd>
          <span v-if="reg.meta?.name"> — {{ reg.meta.name }}</span>
        </li>
      </ul>
    </template>
  </div>
</template>
```

The returned `hotkeys` array contains registration objects with the hotkey string, options (including `meta`), and enabled state. The `sequences` array contains sequence registrations with the same structure.

## The Hotkey Manager

You can always reach for the underlying manager directly:

```ts
import { getHotkeyManager } from '@tanstack/vue-hotkeys'

const manager = getHotkeyManager()
manager.isRegistered('Mod+S')
manager.getRegistrationCount()
```
