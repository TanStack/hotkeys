---
id: createHotkeySequence
title: createHotkeySequence
---

# Function: createHotkeySequence()

```ts
function createHotkeySequence(
   sequence, 
   callback, 
   options): void;
```

Defined in: [packages/svelte-hotkeys/src/createHotkeySequence.svelte.ts:67](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkeySequence.svelte.ts#L67)

Svelte function for registering a keyboard shortcut sequence (Vim-style).

This hook allows you to register multi-key sequences like 'g g' or 'd d'
that trigger when the full sequence is pressed within a timeout.

## Parameters

### sequence

`HotkeySequence`

Array of hotkey strings that form the sequence

### callback

`HotkeyCallback`

Function to call when the sequence is completed

### options

[`CreateHotkeySequenceOptions`](../interfaces/CreateHotkeySequenceOptions.md) = `{}`

Options for the sequence behavior

## Returns

`void`

## Example

```svelte
<script lang="ts">
  import { createHotkeySequence } from '@tanstack/svelte-hotkeys'

  // Scroll to top when 'G G' is pressed
  createHotkeySequence(['G', 'G'], () => {
    scrollToTop()
  })

  // Delete line when 'D D' is pressed
  createHotkeySequence(['D', 'D'], () => {
    deleteLine()
  })

  // Delete inner word when 'D I W' is pressed
  createHotkeySequence(['D', 'I', 'W'], () => {
    deleteInnerWord()
  }, { timeout: 500 })
</script>

<div>
  ....
</div>
```
