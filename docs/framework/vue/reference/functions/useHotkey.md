---
id: useHotkey
title: useHotkey
---

# Function: useHotkey()

```ts
function useHotkey(
   hotkey, 
   callback, 
   options): void;
```

Defined in: [packages/vue-hotkeys/src/useHotkey.ts:99](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/useHotkey.ts#L99)

Vue composable for registering a keyboard hotkey.

Uses the singleton HotkeyManager for efficient event handling.
The callback receives both the keyboard event and a context object
containing the hotkey string and parsed hotkey.

This composable automatically tracks reactive dependencies and updates
the registration when options or the callback change.

## Parameters

### hotkey

`MaybeRefOrGetter`\<`RegisterableHotkey`\>

The hotkey string (e.g., 'Mod+S', 'Escape') or RawHotkey object (supports `mod` for cross-platform)

### callback

`HotkeyCallback`

The function to call when the hotkey is pressed

### options

`MaybeRefOrGetter`\<[`UseHotkeyOptions`](../interfaces/UseHotkeyOptions.md)\> = `{}`

Options for the hotkey behavior

## Returns

`void`

## Examples

```vue
<script setup>
import { ref } from 'vue'
import { useHotkey } from '@tanstack/vue-hotkeys'

const count = ref(0)

// Callback always has access to latest count value
useHotkey('Mod+S', (event, { hotkey }) => {
  console.log(`Save triggered, count is ${count.value}`)
  handleSave()
})
</script>
```

```vue
<script setup>
import { ref } from 'vue'
import { useHotkey } from '@tanstack/vue-hotkeys'

const isOpen = ref(false)

// enabled option is reactive
useHotkey('Escape', () => {
  isOpen.value = false
}, { enabled: isOpen })
</script>
```

```vue
<script setup>
import { ref } from 'vue'
import { useHotkey } from '@tanstack/vue-hotkeys'

const editorRef = ref<HTMLDivElement | null>(null)

// Scoped to a specific element
useHotkey('Mod+S', () => {
  save()
}, { target: editorRef })
</script>

<template>
  <div ref="editorRef">...</div>
</template>
```
