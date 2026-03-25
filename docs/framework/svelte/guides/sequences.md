---
title: Sequences Guide
id: sequences
---

TanStack Hotkeys supports multi-key sequences in Svelte, where keys are pressed one after another rather than simultaneously.

## Global sequences

```svelte
<script lang="ts">
  import { createHotkeySequence } from '@tanstack/svelte-hotkeys'

  createHotkeySequence(['G', 'G'], () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })
</script>
```

## Many sequences at once

Use `createHotkeySequences` to register several global sequences in one place (including from a reactive getter). For multiple sequences on a focused element, use `createHotkeySequencesAttachment` the same way you would use `createHotkeySequenceAttachment`.

```svelte
<script lang="ts">
  import { createHotkeySequences } from '@tanstack/svelte-hotkeys'

  createHotkeySequences([
    { sequence: ['G', 'G'], callback: () => scrollToTop() },
    { sequence: ['D', 'D'], callback: () => deleteLine(), options: { timeout: 500 } },
  ])
</script>
```

## Scoped sequences

Use `createHotkeySequenceAttachment` when a sequence should only be active while a specific element owns focus.

```svelte
<script lang="ts">
  import { createHotkeySequenceAttachment } from '@tanstack/svelte-hotkeys'

  const editorSequences = createHotkeySequenceAttachment(['G', 'G'], () => {
    scrollToTop()
  })
</script>

<div tabindex="0" {@attach editorSequences}>
  Focus here, then press g then g
</div>
```

## Sequence options

```ts
createHotkeySequence(['G', 'G'], callback, {
  timeout: 1000,
  enabled: true,
})
```

### Reactive `enabled`

When disabled, the sequence **stays registered** (visible in devtools); only execution is suppressed.

```svelte
<script lang="ts">
  import { createHotkeySequence } from '@tanstack/svelte-hotkeys'

  let isVimMode = $state(true)

  createHotkeySequence(
    ['G', 'G'],
    () => scrollToTop(),
    () => ({ enabled: isVimMode }),
  )
</script>
```

## Default options

```svelte
<script lang="ts">
  import { setHotkeysContext } from '@tanstack/svelte-hotkeys'

  setHotkeysContext({
    hotkeySequence: { timeout: 1500 },
  })
</script>
```

## Chained modifier chords

You can use the same modifier on consecutive steps (for example `Shift+R` then `Shift+T`):

```ts
createHotkeySequence(['Shift+R', 'Shift+T'], () => doNextAction())
```

While a sequence is in progress, **modifier-only** keydown events (Shift, Control, Alt, or Meta pressed alone) are ignored: they do not advance the sequence and do not reset progress.

## Common Patterns

### Vim-Style Navigation

```ts
createHotkeySequence(['G', 'G'], () => scrollToTop())
createHotkeySequence(['G', 'Shift+G'], () => scrollToBottom())
createHotkeySequence(['D', 'D'], () => deleteLine())
createHotkeySequence(['D', 'W'], () => deleteWord())
createHotkeySequence(['C', 'I', 'W'], () => changeInnerWord())
```

### Konami Code

```ts
createHotkeySequence(
  ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'B', 'A'],
  () => enableEasterEgg(),
  { timeout: 2000 },
)
```

## Under the Hood

`createHotkeySequence` uses the singleton `SequenceManager`. You can also access it directly:

```ts
import {
  createSequenceMatcher,
  getSequenceManager,
} from '@tanstack/svelte-hotkeys'

const manager = getSequenceManager()
const matcher = createSequenceMatcher(['G', 'G'], { timeout: 1000 })
```
