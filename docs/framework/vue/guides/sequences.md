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

## Many sequences at once

When you need several sequences—or a **reactive** list whose length changes—use `useHotkeySequences` instead of many `useHotkeySequence` calls. One composable registers every sequence safely.

```vue
<script setup lang="ts">
import { useHotkeySequences } from '@tanstack/vue-hotkeys'

useHotkeySequences([
  { sequence: ['G', 'G'], callback: () => scrollToTop() },
  { sequence: ['D', 'D'], callback: () => deleteLine(), options: { timeout: 500 } },
])
</script>
```

Options merge like `useHotkeys`: `HotkeysProvider` defaults, then `commonOptions`, then each definition’s `options`.

## Sequence Options

```ts
useHotkeySequence(['G', 'G'], callback, {
  timeout: 1000,
  enabled: true,
})
```

### Reactive `enabled`

When disabled, the sequence **stays registered** (visible in devtools); only execution is suppressed.

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

## Chained modifier chords

Each step can use modifiers (for example `Mod+K` then `Mod+C`). You can use the **same** modifier on consecutive steps:

```ts
useHotkeySequence(['Shift+R', 'Shift+T'], () => doNextAction())
```

While a sequence is in progress, **modifier-only** keydown events (Shift, Control, Alt, or Meta pressed alone) are ignored: they do not advance the sequence and do not reset progress. A user can press Shift alone between `Shift+R` and `Shift+T` without breaking the sequence.

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
