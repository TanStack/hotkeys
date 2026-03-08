---
id: useHotkeySequence
title: useHotkeySequence
---

# Function: useHotkeySequence()

```ts
function useHotkeySequence(
   sequence, 
   callback, 
   options): void;
```

Defined in: [packages/vue-hotkeys/src/useHotkeySequence.ts:66](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/useHotkeySequence.ts#L66)

Vue composable for registering a keyboard shortcut sequence (Vim-style).

This composable allows you to register multi-key sequences like 'g g' or 'd d'
that trigger when the full sequence is pressed within a timeout.

## Parameters

### sequence

`MaybeRefOrGetter`\<`HotkeySequence`\>

Array of hotkey strings that form the sequence

### callback

`HotkeyCallback`

Function to call when the sequence is completed

### options

`MaybeRefOrGetter`\<[`UseHotkeySequenceOptions`](../interfaces/UseHotkeySequenceOptions.md)\> = `{}`

Options for the sequence behavior

## Returns

`void`

## Example

```vue
<script setup>
import { useHotkeySequence } from '@tanstack/vue-hotkeys'

// 'g g' to go to top
useHotkeySequence(['G', 'G'], () => {
  scrollToTop()
})

// 'd d' to delete line
useHotkeySequence(['D', 'D'], () => {
  deleteLine()
})

// 'd i w' to delete inner word
useHotkeySequence(['D', 'I', 'W'], () => {
  deleteInnerWord()
}, { timeout: 500 })
</script>

<template>
  <div>...</div>
</template>
```
