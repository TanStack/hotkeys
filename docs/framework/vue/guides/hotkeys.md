---
title: Hotkeys Guide
id: hotkeys
---

The `useHotkey` composable is the primary way to register keyboard shortcuts in Vue applications. It wraps the singleton `HotkeyManager` with automatic cleanup, support for template refs, and reactive option syncing.

## Logical keys and physical positions

Use a logical binding when the shortcut should follow the character on the active layout. Use a physical binding when it should follow a keyboard position:

| Binding | Identity checked |
| --- | --- |
| `Mod+S` or `{ key: 'S', mod: true }` | Logical `event.key`, with conservative code fallback |
| `Mod+[KeyS]` or `{ code: 'KeyS', mod: true }` | Exact `event.code` |
| `Enter` | Logical Enter, including numpad Enter |
| `[Enter]` / `[NumpadEnter]` | Separate physical Enter positions |

Every physical code uses brackets in strings, including names shared with logical keys such as `[Enter]` and `[F13]`. Supported codes are type-safe and available in autocomplete. Do not put a bracketed code in an object's `key` field; use `code`. A binding has either `key` or `code`, never both.

On a layout where the `KeyQ` position produces `a`, `A` follows that character and `[KeyQ]` follows the position. Logical ASCII letters remain layout-aware; conservative physical fallback helps with transformed output such as macOS Option keys. Exact matches take priority over weaker fallbacks among eligible registrations on the same target.

Callbacks expose the same distinction in `context.parsedHotkey`: check `parsed.code !== undefined` before reading its physical identity. Use `formatForDisplay` for labels; stored physical strings retain their brackets.

## Basic usage

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

### Changing a binding

Pass a new logical or physical binding through your framework's normal state mechanism. A recorder result such as `Alt+[KeyS]` can be passed directly to the same registration API. Keep an initial binding in application state if you want a reset button; the library does not need a separate preferences store.

## Default options

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

## Reactive options

Vue-specific options can be plain values, refs, or getters.

### `enabled`

When `enabled` is false, the hotkey stays registered (visible in devtools); only the callback is suppressed.

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

## Global defaults via provider

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

## Common options

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

## Automatic cleanup

Hotkeys are automatically unregistered when the owning component unmounts.

## Registering multiple hotkeys

When you need to register several hotkeys at once, or a dynamic list whose length changes, use the `useHotkeys` (plural) composable:

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

### Common options with per-hotkey overrides

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

### Dynamic hotkey lists

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

## Metadata (name, description, and group)

Every hotkey registration can carry a `meta` object with a `name`, `description`, and `group`. Metadata never affects hotkey behavior, but it flows through to registrations and devtools, so you can build shortcut palettes and help screens from it.

```ts
useHotkey('Mod+S', () => save(), {
  meta: { name: 'Save', description: 'Save the document' },
})
```

The `meta` option is typed as `HotkeyMeta`, which ships with `name`, `description`, and `group` fields. You can extend it with additional properties using TypeScript declaration merging:

```ts
declare module '@tanstack/hotkeys' {
  interface HotkeyMeta {
    icon?: string
  }
}

useHotkey('Mod+S', () => save(), {
  meta: { name: 'Save', description: 'Save the document', icon: 'floppy', group: 'File' },
})
```

Group is descriptive metadata, not an execution scope. A shortcuts panel can group live registration views directly. Disabled registrations remain listed; unmounted registrations disappear.

## Introspecting registrations

Use the `useHotkeyRegistrations` composable to get a live view of all hotkey and sequence registrations. It works well for shortcut palettes, help dialogs, and devtools.

```vue
<script setup lang="ts">
import { useHotkeyRegistrations, formatForDisplay } from '@tanstack/vue-hotkeys'

const { hotkeys, sequences } = useHotkeyRegistrations()
</script>

<template>
  <div>
    <h2>Keyboard Shortcuts</h2>
    <ul>
      <li v-for="reg in hotkeys" :key="reg.id">
        <kbd>{{ formatForDisplay(reg.hotkey) }}</kbd>
        <span v-if="reg.options.meta?.name"> — {{ reg.options.meta.name }}</span>
        <p v-if="reg.options.meta?.description">{{ reg.options.meta.description }}</p>
      </li>
    </ul>
    <template v-if="sequences.length > 0">
      <h2>Sequences</h2>
      <ul>
        <li v-for="reg in sequences" :key="reg.id">
          <kbd>{{ reg.sequence.map((step) => formatForDisplay(step)).join(' → ') }}</kbd>
          <span v-if="reg.options.meta?.name"> — {{ reg.options.meta.name }}</span>
        </li>
      </ul>
    </template>
  </div>
</template>
```

The returned `hotkeys` array contains registration objects with the hotkey string, options (including `meta`), and enabled state. The `sequences` array contains sequence registrations with the same structure.

## The hotkey manager

You can always reach for the underlying manager directly:

```ts
import { getHotkeyManager } from '@tanstack/vue-hotkeys'

const manager = getHotkeyManager()
manager.isRegistered('Mod+S')
manager.getRegistrationCount()
```
