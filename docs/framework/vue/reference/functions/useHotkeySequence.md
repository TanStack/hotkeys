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

Defined in: [packages/vue-hotkeys/src/useHotkeySequence.ts:76](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/useHotkeySequence.ts#L76)

Vue composable for registering a keyboard shortcut sequence (Vim-style).

This composable allows you to register multi-key sequences like 'g g' or 'd d'
that trigger when the full sequence is pressed within a timeout.

Each step may include modifiers. You can chain the same modifier across
steps (e.g. `Shift+R` then `Shift+T`). Modifier-only keydown events (Shift,
Control, Alt, or Meta pressed alone) are ignored while matching—they do not
advance the sequence or reset progress.

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

// Same modifier on consecutive steps (bare Shift between chords is ignored)
useHotkeySequence(['Shift+R', 'Shift+T'], () => {
  nextAction()
})
</script>

<template>
  <div>...</div>
</template>
```
