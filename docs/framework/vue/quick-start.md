---
title: Quick Start
id: quick-start
---

## Installation

Don't have TanStack Hotkeys installed yet? See the [Installation](../../installation) page for instructions.

## Your First Hotkey

The `useHotkey` composable is the primary way to register keyboard shortcuts in Vue:

```vue
<script setup lang="ts">
import { useHotkey } from '@tanstack/vue-hotkeys'

useHotkey('Mod+S', () => {
  saveDocument()
})
</script>

<template>
  <div>Press Cmd+S (Mac) or Ctrl+S (Windows) to save</div>
</template>
```

The `Mod` modifier automatically resolves to `Meta` (Command) on macOS and `Control` on Windows/Linux, so your shortcuts work across platforms without extra logic.

## Common Patterns

### Multiple Hotkeys

```vue
<script setup lang="ts">
import { useHotkey } from '@tanstack/vue-hotkeys'

useHotkey('Mod+S', () => save())
useHotkey('Mod+Z', () => undo())
useHotkey('Mod+Shift+Z', () => redo())
useHotkey('Mod+F', () => openSearch())
useHotkey('Escape', () => closeDialog())
</script>
```

### Scoped Hotkeys with Template Refs

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useHotkey } from '@tanstack/vue-hotkeys'

const panelRef = ref<HTMLDivElement | null>(null)

useHotkey('Escape', () => closePanel(), { target: panelRef })
</script>

<template>
  <div ref="panelRef" tabindex="0">
    <p>Press Escape while focused here to close</p>
  </div>
</template>
```

### Conditional Hotkeys

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useHotkey } from '@tanstack/vue-hotkeys'

const isOpen = ref(true)

useHotkey('Escape', () => {
  isOpen.value = false
}, { enabled: isOpen })
</script>
```

### Multi-Key Sequences

```vue
<script setup lang="ts">
import { useHotkeySequence } from '@tanstack/vue-hotkeys'

useHotkeySequence(['G', 'G'], () => scrollToTop())
useHotkeySequence(['G', 'Shift+G'], () => scrollToBottom())
</script>
```

### Tracking Held Keys

```vue
<script setup lang="ts">
import { useHeldKeys, useKeyHold } from '@tanstack/vue-hotkeys'

const heldKeys = useHeldKeys()
const isShiftHeld = useKeyHold('Shift')
</script>

<template>
  <div class="status-bar">
    <span v-if="isShiftHeld">Shift mode active</span>
    <span v-if="heldKeys.length > 0">Keys: {{ heldKeys.join('+') }}</span>
  </div>
</template>
```

### Displaying Hotkeys in the UI

```vue
<script setup lang="ts">
import { formatForDisplay, useHotkey } from '@tanstack/vue-hotkeys'

useHotkey('Mod+S', () => save())
</script>

<template>
  <button>
    Save <kbd>{{ formatForDisplay('Mod+S') }}</kbd>
  </button>
</template>
```

## Default Options Provider

Wrap part of your app with `HotkeysProvider` to set default options for all Vue composables in that subtree:

```vue
<script setup lang="ts">
import { HotkeysProvider } from '@tanstack/vue-hotkeys'
</script>

<template>
  <HotkeysProvider
    :default-options="{
      hotkey: { preventDefault: true },
      hotkeySequence: { timeout: 1500 },
      hotkeyRecorder: { onCancel: () => console.log('Recording cancelled') },
    }"
  >
    <AppContent />
  </HotkeysProvider>
</template>
```

## Next Steps

- [Hotkeys Guide](./guides/hotkeys)
- [Sequences Guide](./guides/sequences)
- [Hotkey Recording Guide](./guides/hotkey-recording)
- [Key State Tracking Guide](./guides/key-state-tracking)
- [Formatting & Display Guide](./guides/formatting-display)
