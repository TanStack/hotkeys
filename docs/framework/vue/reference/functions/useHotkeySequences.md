---
id: useHotkeySequences
title: useHotkeySequences
---

# Function: useHotkeySequences()

```ts
function useHotkeySequences(definitions, commonOptions): void;
```

Defined in: [packages/vue-hotkeys/src/useHotkeySequences.ts:68](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/useHotkeySequences.ts#L68)

Vue composable for registering multiple keyboard shortcut sequences at once (Vim-style).

Uses the singleton SequenceManager. Accepts a dynamic array of definitions, or a getter/ref
that returns one, so you can register variable-length lists safely.

Options are merged in this order:
HotkeysProvider defaults < commonOptions < per-definition options

Definitions with an empty `sequence` are skipped (no registration).

## Parameters

### definitions

`MaybeRefOrGetter`\<[`UseHotkeySequenceDefinition`](../interfaces/UseHotkeySequenceDefinition.md)[]\>

Array of sequence definitions, or a getter/ref

### commonOptions

`MaybeRefOrGetter`\<[`UseHotkeySequenceOptions`](../interfaces/UseHotkeySequenceOptions.md)\> = `{}`

Shared options applied to all sequences (overridden by per-definition options)

## Returns

`void`

## Examples

```vue
<script setup>
import { useHotkeySequences } from '@tanstack/vue-hotkeys'

useHotkeySequences([
  { sequence: ['G', 'G'], callback: () => scrollToTop() },
  { sequence: ['D', 'D'], callback: () => deleteLine() },
])
</script>
```

```vue
<script setup>
import { computed } from 'vue'
import { useHotkeySequences } from '@tanstack/vue-hotkeys'

const items = computed(() => [...])
useHotkeySequences(
  () => items.value.map((item) => ({
    sequence: item.chords,
    callback: item.action,
    options: { enabled: item.enabled },
  })),
  { preventDefault: true },
)
</script>
```
