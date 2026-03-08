---
title: Hotkeys Guide
id: hotkeys
---

The `createHotkey` function is the primary way to register keyboard shortcuts in Svelte applications. It wraps the singleton `HotkeyManager` with automatic cleanup, support for refs, and reactive option syncing.

## Basic Usage

```svelte
<script lang="ts">
  import { createHotkey } from '@tanstack/svelte-hotkeys'

  createHotkey('Mod+S', () => {
    saveDocument()
  })
</script>
```

The callback receives the original `KeyboardEvent` as the first argument and a `HotkeyCallbackContext` as the second:

```ts
createHotkey('Mod+S', (event, context) => {
  console.log(context.hotkey)
  console.log(context.parsedHotkey)
})
```

## Default Options

`createHotkey` uses the same core defaults as the framework-agnostic manager:

```ts
createHotkey('Mod+S', callback, {
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

Svelte options can be plain values or getter functions for reactive state.

### `enabled`

```svelte
<script lang="ts">
  import { createHotkey } from '@tanstack/svelte-hotkeys'

  let isEditing = $state(false)

  createHotkey('Mod+S', () => save(), { enabled: () => isEditing })
</script>
```

### `target`

```svelte
<script lang="ts">
  import { createHotkey } from '@tanstack/svelte-hotkeys'

  let panelRef = $state<HTMLDivElement | null>(null)

  createHotkey('Escape', () => closePanel(), { target: () => panelRef })
</script>

<div bind:this={panelRef} tabindex="0">Panel content</div>
```

## Global Default Options via Provider

```svelte
<script lang="ts">
  import { HotkeysProvider } from '@tanstack/svelte-hotkeys'
</script>

<HotkeysProvider
  defaultOptions={{
    hotkey: { preventDefault: false, ignoreInputs: false },
  }}
>
  <AppContent />
</HotkeysProvider>
```

## Common Options

### `requireReset`

```ts
createHotkey('Escape', () => closePanel(), { requireReset: true })
```

### `ignoreInputs`

```ts
createHotkey('K', () => openSearch())
createHotkey('Enter', () => submit(), { ignoreInputs: false })
```

### `conflictBehavior`

```ts
createHotkey('Mod+S', () => save(), { conflictBehavior: 'replace' })
```

### `platform`

```ts
createHotkey('Mod+S', () => save(), { platform: 'mac' })
```

## Automatic Cleanup

Hotkeys are automatically unregistered when the owning component unmounts.

## The Hotkey Manager

You can always reach for the underlying manager directly:

```ts
import { getHotkeyManager } from '@tanstack/svelte-hotkeys'

const manager = getHotkeyManager()
manager.isRegistered('Mod+S')
manager.getRegistrationCount()
```
