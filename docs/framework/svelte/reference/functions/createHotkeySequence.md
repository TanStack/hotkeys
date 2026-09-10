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

Defined in: [packages/svelte-hotkeys/src/createHotkeySequence.svelte.ts:72](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkeySequence.svelte.ts#L72)

Register a global keyboard shortcut sequence for the current component.

Each step may include modifiers. You can chain the same modifier across
steps (e.g. `Shift+R` then `Shift+T`). Modifier-only keydown events (Shift,
Control, Alt, or Meta pressed alone) are ignored while matching—they do not
advance the sequence or reset progress.

## Parameters

### sequence

`MaybeGetter`\<`HotkeySequence`\>

### callback

`HotkeyCallback`

### options

`MaybeGetter`\<[`CreateHotkeySequenceOptions`](../interfaces/CreateHotkeySequenceOptions.md)\> = `{}`

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

  // Same modifier on consecutive steps (bare Shift between chords is ignored)
  createHotkeySequence(['Shift+R', 'Shift+T'], () => {
    nextAction()
  })
</script>

<div>
  ....
</div>
```
