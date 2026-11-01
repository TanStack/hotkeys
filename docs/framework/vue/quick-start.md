---
title: Quick Start
id: quick-start
description: Add keyboard shortcuts to a Vue app with TanStack Hotkeys. Register hotkeys, show them in your UI, and group them with scoped providers.
---

This guide adds keyboard shortcuts to a Vue app. If you haven't installed TanStack Hotkeys yet, see [Installation](../../installation).

## Register a hotkey

TanStack Hotkeys needs no special setup. To register a keyboard shortcut, call `useHotkey` in the component that owns the action:

```vue
<script setup lang="ts">
import { useHotkey } from '@tanstack/vue-hotkeys'

useHotkey('Mod+S', () => saveDocument())
</script>

<template>
  <textarea />
</template>
```

`Mod` is Command on macOS and Control on Windows and Linux, so `Mod+S` is the save shortcut each user already knows. The browser's Save dialog stays closed, and the shortcut still works while the user types in the textarea. [Sensible Defaults](../../guides/sensible-defaults) explains these defaults.

That's all a hotkey needs. Providers, scopes, and the other features later in this guide are optional, so add them as your app grows.

## Register several hotkeys

When a component has more than one hotkey, register them together with `useHotkeys`:

```vue
<script setup lang="ts">
import { useHotkeys } from '@tanstack/vue-hotkeys'

useHotkeys([
  { hotkey: 'Mod+S', callback: () => save() },
  { hotkey: 'Mod+Z', callback: () => undo() },
  { hotkey: 'Mod+Shift+Z', callback: () => redo() },
])
</script>
```

`useHotkeys` also accepts a ref or getter that returns the array, so the list can come from reactive state and change length over time.

## Sequences

Pass an array of chords to register a sequence, pressed one after another:

```ts
useHotkey(['G', 'G'], () => scrollToTop())
```

Each step must follow the previous one within a second.

`useHotkeys` accepts chords and sequences in the same array:

```ts
useHotkeys([
  { hotkey: 'Mod+K', callback: () => openSearch() },
  { hotkey: ['G', 'H'], callback: () => goHome() },
  { hotkey: ['G', 'S'], callback: () => goToSettings() },
])
```

## Show the shortcut

Label a button or menu item with `formatForDisplay`. Format the same value you register, so the label always matches the binding:

```vue
<script setup lang="ts">
import { formatForDisplay, useHotkey } from '@tanstack/vue-hotkeys'
import type { HotkeyChord } from '@tanstack/vue-hotkeys'

const saveHotkey: HotkeyChord = 'Mod+S'

useHotkey(saveHotkey, () => save())
</script>

<template>
  <button @click="save">
    Save <kbd>{{ formatForDisplay(saveHotkey) }}</kbd>
  </button>
</template>
```

The label is `⌘ S` on macOS and `Ctrl+S` on Windows and Linux. `HotkeyChord` checks the string, so a typo in the binding is a type error. Use `Hotkey` for a value that can also be a sequence.

## Hotkeys follow your components

A hotkey is registered when the component that calls the composable mounts, and unregistered when that component unmounts. Put each hotkey in the component it belongs to, so it is active only while that component is mounted:

```vue
<!-- App.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import SettingsDialog from './SettingsDialog.vue'

const isOpen = ref(false)
</script>

<template>
  <button @click="isOpen = true">Settings</button>
  <SettingsDialog v-if="isOpen" @close="isOpen = false" />
</template>
```

```vue
<!-- SettingsDialog.vue -->
<script setup lang="ts">
import { useHotkey } from '@tanstack/vue-hotkeys'

const emit = defineEmits<{ close: [] }>()

// Registered only while the dialog is mounted
useHotkey('Escape', () => emit('close'))
</script>

<template>
  <div role="dialog">...</div>
</template>
```

For a condition that doesn't match a component, pass `enabled`. It accepts a ref or a getter:

```ts
useHotkey('Mod+S', () => save(), { enabled: hasUnsavedChanges })
```

When a group of hotkeys turns on and off together, put them in a scope instead. See [Add providers and scopes](#add-providers-and-scopes-optional).

The composables also work outside a component, in an `effectScope`, such as a shared composable or a module-level store. Their hotkeys unregister when the scope stops.

During server rendering, the composables return the current state and register nothing, so they are safe to call in Nuxt and other SSR apps.

## Element hotkeys

A hotkey's default `target` is `document`, so it works wherever focus is on the page. To limit it to one element, pass a template ref as `target`:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useHotkey } from '@tanstack/vue-hotkeys'

const panel = ref<HTMLDivElement | null>(null)

// Fires only while the panel, or something inside it, has focus
useHotkey('Escape', () => closePanel(), { target: panel })
</script>

<template>
  <div ref="panel" tabindex="0">...</div>
</template>
```

The hotkey fires while focus is on the element or inside it. If nothing there can take focus, give the element a `tabindex`.

## Add providers and scopes (optional)

So far, every hotkey uses the built-in defaults and belongs to the global scope, so it is active whenever its component is mounted. You don't need a provider for that.

Add `HotkeysProvider` at the root to set default options for every hotkey inside it, such as more time between sequence steps:

```vue
<!-- App.vue -->
<script setup lang="ts">
import { HotkeysProvider } from '@tanstack/vue-hotkeys'
</script>

<template>
  <HotkeysProvider :default-options="{ hotkey: { timeout: 1500 } }">
    <AppContent />
  </HotkeysProvider>
</template>
```

Add more providers deeper in your app to group hotkeys into scopes. Every hotkey inside a provider with a `scope` belongs to that scope. Make the scope `exclusive`, and while it is mounted, only its hotkeys work. Use one for dialogs and popups that should own the keyboard:

```vue
<!-- DocumentView.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { HotkeysProvider } from '@tanstack/vue-hotkeys'
import ConfirmDialog from './ConfirmDialog.vue'

const isConfirming = ref(false)
</script>

<template>
  <button @click="isConfirming = true">Delete</button>
  <HotkeysProvider v-if="isConfirming" scope="confirm-dialog" exclusive>
    <ConfirmDialog @confirm="remove" @cancel="isConfirming = false" />
  </HotkeysProvider>
</template>
```

```vue
<!-- ConfirmDialog.vue -->
<script setup lang="ts">
import { useHotkeys } from '@tanstack/vue-hotkeys'

const emit = defineEmits<{ confirm: []; cancel: [] }>()

useHotkeys([
  { hotkey: 'Enter', callback: () => emit('confirm') },
  { hotkey: 'Escape', callback: () => emit('cancel') },
])
</script>

<template>
  <div role="dialog">...</div>
</template>
```

While the dialog is open, `Enter` and `Escape` confirm and cancel it, and every hotkey outside the dialog is suspended. When the dialog closes, they work again.

A composable uses the nearest provider above the component that calls it, so put the provider around the dialog component, not inside its template. [HotkeysProvider and Scopes](./guides/hotkeys-provider-and-scopes) covers nested scopes, precedence, and turning a scope off without unmounting it.

## Next steps

Learn more about the basics:

- [Hotkeys](./guides/hotkeys): chords and sequences, options, and element hotkeys
- [Sequences](./guides/sequences): Vim-style multi-key shortcuts
- [Sensible Defaults](../../guides/sensible-defaults): what hotkeys do without options, and keyboard layouts
- [Formatting & Display](./guides/formatting-display): labels and keycaps for every platform
- [Held Key State Helpers](./guides/held-key-state-helpers): show which keys are held
- [Hotkey Hints](./guides/hotkey-hints): show a button's shortcut while the user holds its modifiers
- [Devtools](../../devtools): inspect registered hotkeys, scopes, and held keys while you develop

As your app grows:

- [HotkeysProvider and Scopes](./guides/hotkeys-provider-and-scopes): set default options, and turn groups of hotkeys on and off with dialogs, panes, and tabs
- [App Hotkeys](./guides/app-hotkeys): declare hotkeys in one place and let users change them
- [Cheat Sheet UI Helpers](./guides/cheat-sheet-ui-helpers): list your shortcuts in a help dialog
- [Custom Hotkey Recording](./guides/custom-hotkey-recording): record the shortcut a user presses
- [Hotkey Manager](./guides/hotkey-manager): register and inspect hotkeys outside components
