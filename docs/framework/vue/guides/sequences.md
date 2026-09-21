---
title: Sequences Guide
id: sequences
---

TanStack Hotkeys supports multi-key sequences in Vue, where keys are pressed one after another rather than simultaneously.

Sequence steps use the same string syntax as single hotkeys. For example, `['[KeyG]', '[KeyG]']` follows a physical position, while `['G', 'G']` follows the logical letter. A sequence can mix forms, such as `['Mod+[KeyK]', 'C']`. Display steps with `sequence.map((step) => formatForDisplay(step)).join(' → ')`.

## Basic usage

```vue
<script setup lang="ts">
import { useHotkeySequence } from '@tanstack/vue-hotkeys'

useHotkeySequence(['G', 'G'], () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
})
</script>
```

## Many sequences at once

When you need several sequences, or a reactive list whose length changes, use `useHotkeySequences` instead of many `useHotkeySequence` calls. One composable registers every sequence safely.

```vue
<script setup lang="ts">
import { useHotkeySequences } from '@tanstack/vue-hotkeys'

useHotkeySequences([
  { sequence: ['G', 'G'], callback: () => scrollToTop() },
  { sequence: ['D', 'D'], callback: () => deleteLine(), options: { timeout: 500 } },
])
</script>
```

Options merge like `useHotkeys`: `HotkeysProvider` defaults, then `commonOptions`, then each definition's `options`.

## Matching steps

Both `SequenceManager` and `createSequenceMatcher` ignore modifier-only events, IME composition, and automatic keydown repeats. These events neither advance the sequence nor refresh its timeout: holding G does not complete a two-press G sequence. The manager prefers exact matches over weaker logical-key fallbacks while preserving equally strong matches.

## Sequence options

```ts
useHotkeySequence(['G', 'G'], callback, {
  timeout: 1000,
  enabled: true,
})
```

### Reactive `enabled`

When disabled, the sequence stays registered (visible in devtools); only execution is suppressed.

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

## Global defaults via provider

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

### `meta`

Sequences support the same `meta` option as hotkeys. Attach a `name` and `description` to use in shortcut palettes and devtools.

```ts
useHotkeySequence(['G', 'G'], () => scrollToTop(), {
  meta: { name: 'Go to Top', description: 'Scroll to the top of the page' },
})
```

See the [Hotkeys Guide](./hotkeys.md#metadata-name--description) for details on declaration merging and introspecting registrations.

## Chained modifier chords

This example follows physical R and T positions. Brackets retain those positions even when the keys produce different letters. Other sequences can continue using logical characters.

Each step can use modifiers (for example `Mod+K` then `Mod+C`). You can use the same modifier on consecutive steps:

```ts
useHotkeySequence(['Shift+[KeyR]', 'Shift+[KeyT]'], () => doNextAction())
```

While a sequence is in progress, modifier-only keydown events (Shift, Control, Alt, or Meta pressed alone) are ignored: they do not advance the sequence and do not reset progress. A user can press Shift alone between `Shift+R` and `Shift+T` without breaking the sequence.

## Common patterns

### Vim-style navigation

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

## Under the hood

`useHotkeySequence` uses the singleton `SequenceManager`. You can also access it directly:

```ts
import { createSequenceMatcher, getSequenceManager } from '@tanstack/vue-hotkeys'

const manager = getSequenceManager()
const matcher = createSequenceMatcher(['G', 'G'], { timeout: 1000 })
```

### Conflicting registrations

For the same target, duplicate detection compares resolved steps: modifier aliases, modifier order, and logical key casing do not create separate bindings. `conflictBehavior` applies to equivalent sequences without rewriting their stored strings. Physical and logical identities remain distinct, and a shared prefix alone is not a duplicate registration. Recorder conflict detection also checks prefixes and observed physical/logical overlap.
