---
title: Sequences Guide
id: sequences
---

TanStack Hotkeys supports multi-key sequences in Vue, where keys are pressed one after another rather than simultaneously.

## Basic Usage

```vue
<script setup lang="ts">
import { useHotkeySequence } from '@tanstack/vue-hotkeys'

useHotkeySequence(['G', 'G'], () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
})
</script>
```

## Sequence Options

```ts
useHotkeySequence(['G', 'G'], callback, {
  timeout: 1000,
  enabled: true,
})
```

### Reactive `enabled`

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useHotkeySequence } from '@tanstack/vue-hotkeys'

const isVimMode = ref(true)

useHotkeySequence(['G', 'G'], () => scrollToTop(), {
  enabled: isVimMode,
})
</script>
```

## Global Default Options via Provider

```vue
<script setup lang="ts">
import { HotkeysProvider } from '@tanstack/vue-hotkeys'
</script>

<template>
  <HotkeysProvider
    :default-options="{
      hotkeySequence: { timeout: 1500 },
    }"
  >
    <AppContent />
  </HotkeysProvider>
</template>
```

## Common Patterns

### Vim-Style Navigation

```ts
useHotkeySequence(['G', 'G'], () => scrollToTop())
useHotkeySequence(['G', 'Shift+G'], () => scrollToBottom())
useHotkeySequence(['D', 'D'], () => deleteLine())
useHotkeySequence(['D', 'W'], () => deleteWord())
useHotkeySequence(['C', 'I', 'W'], () => changeInnerWord())
```

### Konami Code

```ts
useHotkeySequence(
  ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'B', 'A'],
  () => enableEasterEgg(),
  { timeout: 2000 },
)
```

## Under the Hood

`useHotkeySequence` uses the singleton `SequenceManager`. You can also access it directly:

```ts
import { createSequenceMatcher, getSequenceManager } from '@tanstack/vue-hotkeys'

const manager = getSequenceManager()
const matcher = createSequenceMatcher(['G', 'G'], { timeout: 1000 })
```
